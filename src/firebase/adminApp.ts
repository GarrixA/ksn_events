import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";
import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

type ServiceAccountPayload = {
  project_id: string;
  client_email: string;
  private_key: string;
};

function loadServiceAccountPayload(): ServiceAccountPayload {
  const rawFromEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (rawFromEnv) {
    const parsed = JSON.parse(rawFromEnv) as ServiceAccountPayload;
    return {
      ...parsed,
      private_key: parsed.private_key?.replace(/\\n/g, "\n"),
    };
  }

  const configuredPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH ?? "services/serviceAccountKey.json";
  const absolutePath = path.join(process.cwd(), configuredPath);
  const rawFile = readFileSync(absolutePath, "utf8");
  const parsed = JSON.parse(rawFile) as ServiceAccountPayload;

  return {
    ...parsed,
    private_key: parsed.private_key?.replace(/\\n/g, "\n"),
  };
}

function getAdminApp() {
  if (getApps().length > 0) {
    return getApp();
  }

  const serviceAccount = loadServiceAccountPayload();
  return initializeApp({
    credential: cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    }),
  });
}

export const adminDb = getFirestore(getAdminApp());
