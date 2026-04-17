import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { adminDb } from "@/firebase/adminApp";
import {
  getMailtrapFromAddress,
  resolveMailtrapRecipient,
  sendMailWithMailtrap,
} from "@/lib/mailtrap";

type ResendBody = {
  ticketId?: string;
};

const badRequest = (message: string) => NextResponse.json({ error: message }, { status: 400 });

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ResendBody;
    const ticketId = body.ticketId?.trim() ?? "";
    if (!ticketId) {
      return badRequest("Ticket ID is required.");
    }

    const ticketDoc = await adminDb.collection("tickets").doc(ticketId).get();
    if (!ticketDoc.exists) {
      return badRequest("Ticket not found.");
    }

    const ticketData = ticketDoc.data() ?? {};
    const buyerEmail = String(ticketData.buyerEmail ?? "").trim();
    const buyerName = String(ticketData.buyerFullName ?? "Guest");
    const eventTitle = String(ticketData.eventTitle ?? "Event");
    const qrPayload = String(ticketData.qrPayload ?? "");
    const ticketCode = String(ticketData.ticketCode ?? ticketId);

    if (!buyerEmail || !qrPayload) {
      return badRequest("Ticket is missing buyer email or QR payload.");
    }

    const from = getMailtrapFromAddress();
    const { toEmail, devRedirectNote } = resolveMailtrapRecipient(buyerEmail);

    const qrDataUrl = await QRCode.toDataURL(qrPayload, { margin: 1, width: 260 });
    const contentBase64 = qrDataUrl.replace(/^data:image\/png;base64,/, "");

    const redirectBanner = devRedirectNote
      ? `<p style="padding:10px;background:#fef3c7;border-radius:8px;font-size:13px;color:#92400e;">${devRedirectNote}</p>`
      : "";

    const sendResult = await sendMailWithMailtrap({
      from,
      to: [{ email: toEmail }],
      subject: `Resent ticket QR code - ${eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          ${redirectBanner}
          <h2>Your ticket for ${eventTitle}</h2>
          <p>Hello ${buyerName},</p>
          <p>Here is your ticket QR code again.</p>
          <p><strong>${ticketCode}</strong></p>
          <img src="cid:ticket-qr-resend" alt="${ticketCode}" width="180" height="180" />
        </div>
      `,
      attachments: [
        {
          filename: `${ticketCode}.png`,
          content: Buffer.from(contentBase64, "base64"),
          disposition: "inline",
          content_id: "ticket-qr-resend",
        },
      ],
      category: "ticket-resend",
    });

    if (!sendResult.ok) {
      if (sendResult.reason === "missing_token") {
        return NextResponse.json(
          {
            error:
              "Mailtrap is not configured. Set MAILTRAP_TOKEN (or TOKEN) in .env.local and restart the server.",
          },
          { status: 500 },
        );
      }
      return NextResponse.json(
        {
          error:
            sendResult.message ??
            "Mailtrap could not send the email. For Email Testing, set MAILTRAP_SANDBOX=true and MAILTRAP_TEST_INBOX_ID.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, message: `Ticket ${ticketCode} resent to ${buyerEmail}.` });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Unable to resend ticket email." },
      { status: 500 },
    );
  }
}
