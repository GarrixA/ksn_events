import { FieldValue, type Timestamp } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { adminDb } from "@/firebase/adminApp";
import { parseTicketQrPayload } from "@/lib/ticketQr";

type ScanBody = {
  qrPayload?: string;
};

const badRequest = (message: string) => NextResponse.json({ error: message }, { status: 400 });

function timestampToMs(value: unknown): number | null {
  if (value && typeof value === "object" && "toMillis" in value) {
    const ms = (value as Timestamp).toMillis();
    return typeof ms === "number" ? ms : null;
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ScanBody;
    const qrPayload = body.qrPayload?.trim() ?? "";
    if (!qrPayload) {
      return badRequest("Missing QR payload.");
    }

    const parsed = parseTicketQrPayload(qrPayload);
    if (!parsed) {
      return badRequest("Invalid QR payload. Use the in-app scanner or scan a valid ticket QR.");
    }

    const ticketId = parsed.ticketId;
    const ticketToken = parsed.ticketToken;

    const ticketRef = adminDb.collection("tickets").doc(ticketId);
    const ticketDoc = await ticketRef.get();
    if (!ticketDoc.exists) {
      return badRequest("Ticket was not found.");
    }

    const ticketData = ticketDoc.data() ?? {};
    if (String(ticketData.ticketToken ?? "") !== ticketToken) {
      return badRequest("Ticket token mismatch.");
    }
    if (String(ticketData.status ?? "active") === "used") {
      return badRequest("Ticket has already been used.");
    }

    await ticketRef.update({
      status: "used",
      usedAt: FieldValue.serverTimestamp(),
    });

    const usedAtMs = Date.now();
    const createdAtMs = timestampToMs(ticketData.createdAt);

    return NextResponse.json({
      ok: true,
      message: `Ticket ${String(ticketData.ticketCode ?? ticketId)} validated.`,
      ticket: {
        id: ticketId,
        purchaseId: String(ticketData.purchaseId ?? ""),
        eventId: String(ticketData.eventId ?? ""),
        eventTitle: String(ticketData.eventTitle ?? ""),
        eventLocation: String(ticketData.eventLocation ?? ""),
        ownerId: String(ticketData.ownerId ?? ""),
        buyerFullName: String(ticketData.buyerFullName ?? ""),
        buyerEmail: String(ticketData.buyerEmail ?? ""),
        buyerPhone: String(ticketData.buyerPhone ?? ""),
        ticketCode: String(ticketData.ticketCode ?? ticketId),
        qrPayload: String(ticketData.qrPayload ?? ""),
        status: "used" as const,
        createdAtMs,
        usedAtMs,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Unable to scan ticket." },
      { status: 500 },
    );
  }
}
