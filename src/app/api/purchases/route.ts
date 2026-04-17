import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { adminDb } from "@/firebase/adminApp";
import {
  getMailtrapFromAddress,
  resolveMailtrapRecipient,
  sendMailWithMailtrap,
  type MailtrapSendResult,
} from "@/lib/mailtrap";
import { buildTicketVerifyUrl } from "@/lib/ticketQr";

type PurchaseBody = {
  eventId?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  tickets?: number;
};

const badRequest = (message: string) => NextResponse.json({ error: message }, { status: 400 });

type GeneratedTicket = {
  id: string;
  ticketCode: string;
  qrPayload: string;
};

const sendTicketsEmail = async ({
  buyerEmail,
  buyerName,
  eventTitle,
  tickets,
}: {
  buyerEmail: string;
  buyerName: string;
  eventTitle: string;
  tickets: GeneratedTicket[];
}): Promise<MailtrapSendResult> => {
  const from = getMailtrapFromAddress();
  const { toEmail, devRedirectNote } = resolveMailtrapRecipient(buyerEmail);

  const attachments = await Promise.all(
    tickets.map(async (ticketItem, index) => {
      const qrDataUrl = await QRCode.toDataURL(ticketItem.qrPayload, { margin: 1, width: 260 });
      const contentBase64 = qrDataUrl.replace(/^data:image\/png;base64,/, "");
      return {
        filename: `${ticketItem.ticketCode}.png`,
        content: Buffer.from(contentBase64, "base64"),
        disposition: "inline",
        content_id: `ticket-qr-${index}`,
      };
    }),
  );

  const redirectBanner = devRedirectNote
    ? `<p style="padding:10px;background:#fef3c7;border-radius:8px;font-size:13px;color:#92400e;">${devRedirectNote}</p>`
    : "";

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      ${redirectBanner}
      <h2>Your tickets for ${eventTitle}</h2>
      <p>Hello ${buyerName},</p>
      <p>Your purchase is confirmed. Present any of the QR codes below at check-in.</p>
      ${tickets
        .map(
          (ticketItem, index) => `
            <div style="margin: 18px 0; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <p style="margin: 0 0 10px;"><strong>${ticketItem.ticketCode}</strong></p>
              <img src="cid:ticket-qr-${index}" alt="${ticketItem.ticketCode}" width="180" height="180" />
            </div>
          `,
        )
        .join("")}
    </div>
  `;

  return sendMailWithMailtrap({
    from,
    to: [{ email: toEmail }],
    subject: `Your ticket QR code(s) - ${eventTitle}`,
    html,
    attachments,
    category: "ticket-purchase",
  });
};

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
      const eventLocation = String(eventData.location ?? "Location not set");
      const ownerId = String(eventData.ownerId ?? "");

      if (remaining < tickets) {
        throw new Error(`Only ${Math.max(0, remaining)} ticket(s) are left for this event.`);
      }

      transaction.update(eventRef, {
        ticketsAvailable: remaining - tickets,
      });

      const purchaseRef = adminDb.collection("purchases").doc();
      const totalAmount = unitPrice * tickets;
      const generatedTickets: GeneratedTicket[] = [];

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

      for (let index = 0; index < tickets; index += 1) {
        const ticketRef = adminDb.collection("tickets").doc();
        const ticketCode = `TKT-${ticketRef.id.slice(0, 8).toUpperCase()}`;
        const ticketToken = crypto.randomUUID();
        const qrPayload = buildTicketVerifyUrl(ticketRef.id, ticketToken);

        transaction.set(ticketRef, {
          purchaseId: purchaseRef.id,
          eventId,
          eventTitle,
          eventLocation,
          ownerId,
          buyerFullName: fullName,
          buyerEmail: email,
          buyerPhone: phone,
          ticketCode,
          ticketToken,
          qrPayload,
          status: "active",
          createdAt: FieldValue.serverTimestamp(),
        });

        generatedTickets.push({
          id: ticketRef.id,
          ticketCode,
          qrPayload,
        });
      }

      return {
        totalAmount,
        eventTitle,
        generatedTickets,
      };
    });

    let emailSent = false;
    let emailError: string | undefined;
    try {
      const emailResult = await sendTicketsEmail({
        buyerEmail: email,
        buyerName: fullName,
        eventTitle: result.eventTitle,
        tickets: result.generatedTickets,
      });
      emailSent = emailResult.ok;
      if (!emailResult.ok) {
        if (emailResult.reason === "missing_token") {
          emailError =
            "Set MAILTRAP_TOKEN (or TOKEN) in .env.local and restart the dev server.";
        } else {
          const raw = emailResult.message ?? "Mailtrap rejected the send request.";
          let hint = raw.length > 200 ? `${raw.slice(0, 197)}...` : raw;
          if (/demo domain|account owner/i.test(hint)) {
            hint +=
              " Fix: set MAILTRAP_OVERRIDE_TO_EMAIL to your Mailtrap login email (or verify a domain in Mailtrap Sending).";
          }
          emailError = hint;
        }
      }
    } catch (sendErr) {
      emailSent = false;
      emailError =
        sendErr instanceof Error ? sendErr.message : "Failed to send ticket email.";
    }

    return NextResponse.json({
      ok: true,
      totalAmount: result.totalAmount,
      emailSent,
      ...(emailError ? { emailError } : {}),
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Unable to complete ticket purchase." },
      { status: 500 },
    );
  }
}
