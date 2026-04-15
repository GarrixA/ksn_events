import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

type SeedUser = {
  email: string;
  password: string;
  role: "admin" | "organiser";
  displayName: string;
};

type SeedEvent = {
  id: string;
  title: string;
  description: string;
  price: number;
  ticketsAvailable: number;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function initAdmin() {
  if (getApps().length) {
    return;
  }

  const serviceAccountPath = join(process.cwd(), "services", "serviceAccountKey.json");
  const rawServiceAccount =
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
    (existsSync(serviceAccountPath) ? readFileSync(serviceAccountPath, "utf8") : "");

  if (!rawServiceAccount) {
    throw new Error(
      "Missing Firebase admin credentials. Set FIREBASE_SERVICE_ACCOUNT_KEY or add services/serviceAccountKey.json",
    );
  }

  const serviceAccount = JSON.parse(rawServiceAccount) as {
    project_id: string;
    client_email: string;
    private_key: string;
  };

  if (!serviceAccount.project_id) {
    throw new Error("Invalid service account: missing project_id");
  }
  if (!serviceAccount.client_email || !serviceAccount.private_key) {
    throw new Error("Invalid service account: missing client_email or private_key");
  }

  initializeApp({
    credential: cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key.replace(/\\n/g, "\n"),
    }),
    projectId: serviceAccount.project_id,
  });
}

async function upsertUser(user: SeedUser) {
  const auth = getAuth();
  const db = getFirestore();
  let uid = "";

  try {
    const existing = await auth.getUserByEmail(user.email);
    uid = existing.uid;
    await auth.updateUser(uid, {
      displayName: user.displayName,
      password: user.password,
    });
  } catch {
    const created = await auth.createUser({
      email: user.email,
      password: user.password,
      displayName: user.displayName,
    });
    uid = created.uid;
  }

  await auth.setCustomUserClaims(uid, { role: user.role });

  await db.collection("users").doc(uid).set(
    {
      uid,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return { uid, role: user.role, email: user.email };
}

async function upsertEvent(ownerId: string, event: SeedEvent) {
  const db = getFirestore();

  await db.collection("events").doc(event.id).set(
    {
      title: event.title,
      description: event.description,
      price: event.price,
      ticketsAvailable: event.ticketsAvailable,
      initialTickets: event.ticketsAvailable,
      ownerId,
      seeded: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

async function main() {
  initAdmin();

  const usersToSeed: SeedUser[] = [
    {
      email: "admin@ksn.com",
      password: "Admin@123456",
      role: "admin",
      displayName: "KSN Admin",
    },
    {
      email: "organiser@ksn.com",
      password: "Organiser@123456",
      role: "organiser",
      displayName: "KSN Organiser",
    },
  ];

  const [adminUser, organiserUser] = await Promise.all(usersToSeed.map(upsertUser));

  const eventsToSeed: SeedEvent[] = [
    {
      id: "seed-ticket-1",
      title: "Tech Meetup 2026",
      description: "Community technology meetup and networking.",
      price: 25,
      ticketsAvailable: 100,
    },
    {
      id: "seed-ticket-2",
      title: "Startup Pitch Night",
      description: "Founders pitch live to investors and audience.",
      price: 40,
      ticketsAvailable: 75,
    },
    {
      id: "seed-ticket-3",
      title: "Product Design Workshop",
      description: "Hands-on workshop for product and UX teams.",
      price: 30,
      ticketsAvailable: 50,
    },
  ];

  await upsertEvent(adminUser.uid, eventsToSeed[0]);
  await upsertEvent(organiserUser.uid, eventsToSeed[1]);
  await upsertEvent(organiserUser.uid, eventsToSeed[2]);

  console.log("Seed complete:");
  console.log(`- User: ${adminUser.email} (role: ${adminUser.role})`);
  console.log(`- User: ${organiserUser.email} (role: ${organiserUser.role})`);
  console.log("- Events: 3 seeded ticket events");
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
