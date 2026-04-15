import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { adminDb } from "@/firebase/adminApp";

type PurchaseBody = {
  eventId?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  tickets?: number;
};

const badRequest = (message: string) => NextResponse.json({ error: message }, { status: 400 });

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PurchaseBody;

    const eventId = body.eventId?.trim() ?? "";
    const fullName = body.fullName?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const phone = body.phone?.trim() ?? "";
    const tickets = Number(body.tickets);

    if (!eventId) {
      return badRequest("Event is required.");
    }
    if (!fullName || !email || !phone) {
      return badRequest("Please fill your full name, email, and phone number.");
    }
    if (!email.includes("@")) {
      return badRequest("Please enter a valid email address.");
    }
    if (phone.length < 7) {
      return badRequest("Please enter a valid phone number.");
    }
    if (!Number.isInteger(tickets) || tickets < 1) {
      return badRequest("Number of tickets must be at least 1.");
    }

    const result = await adminDb.runTransaction(async (transaction) => {
      const eventRef = adminDb.collection("events").doc(eventId);
      const eventDoc = await transaction.get(eventRef);

      if (!eventDoc.exists) {
        throw new Error("Event does not exist.");
      }

      const eventData = eventDoc.data() ?? {};
      const remaining = Number(eventData.ticketsAvailable ?? 0);
      const unitPrice = Number(eventData.price ?? 0);
      const eventTitle = String(eventData.title ?? "Untitled event");

      if (remaining < tickets) {
        throw new Error(`Only ${Math.max(0, remaining)} ticket(s) are left for this event.`);
      }

      transaction.update(eventRef, {
        ticketsAvailable: remaining - tickets,
      });

      const purchaseRef = adminDb.collection("purchases").doc();
      const totalAmount = unitPrice * tickets;

      transaction.set(purchaseRef, {
        eventId,
        eventTitle,
        buyerAuthType: "guest",
        buyerFullName: fullName,
        buyerEmail: email,
        buyerPhone: phone,
        ticketsCount: tickets,
        unitPrice,
        totalAmount,
        createdAt: FieldValue.serverTimestamp(),
      });

      return { totalAmount };
    });

    return NextResponse.json({ ok: true, totalAmount: result.totalAmount });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Unable to complete ticket purchase." },
      { status: 500 },
    );
  }
}
