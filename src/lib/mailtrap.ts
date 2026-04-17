import { MailtrapClient } from "mailtrap";
import type { Mail } from "mailtrap";

export function getMailtrapClient(): MailtrapClient | null {
  const token = (process.env.MAILTRAP_TOKEN ?? process.env.TOKEN ?? "").trim();
  if (!token) {
    return null;
  }
  const sandbox = process.env.MAILTRAP_SANDBOX === "true";
  const testInboxIdRaw = process.env.MAILTRAP_TEST_INBOX_ID?.trim();
  const testInboxId =
    sandbox && testInboxIdRaw && !Number.isNaN(Number(testInboxIdRaw))
      ? Number(testInboxIdRaw)
      : undefined;

  return new MailtrapClient({
    token,
    sandbox,
    ...(testInboxId !== undefined ? { testInboxId } : {}),
  });
}

export function getMailtrapFromAddress(): { email: string; name: string } {
  return {
    email: process.env.MAILTRAP_FROM_EMAIL?.trim() || "hello@demomailtrap.co",
    name: process.env.MAILTRAP_FROM_NAME?.trim() || "KSN Tickets",
  };
}

/**
 * Mailtrap demo senders (`hello@demomailtrap.co`) may only deliver to your Mailtrap account email.
 * Set `MAILTRAP_OVERRIDE_TO_EMAIL` to that address so test purchases still send; the real buyer
 * stays on the ticket — we only change the envelope recipient and add a note in the body.
 */
export function resolveMailtrapRecipient(actualBuyerEmail: string): {
  toEmail: string;
  devRedirectNote: string | null;
} {
  const override = process.env.MAILTRAP_OVERRIDE_TO_EMAIL?.trim();
  if (override) {
    if (override.toLowerCase() === actualBuyerEmail.toLowerCase()) {
      return { toEmail: actualBuyerEmail, devRedirectNote: null };
    }
    return {
      toEmail: override,
      devRedirectNote: `This message was delivered to you because Mailtrap demo mail is limited to the account owner. Intended recipient (buyer): ${actualBuyerEmail.replace(/</g, "&lt;").replace(/>/g, "&gt;")}.`,
    };
  }
  return { toEmail: actualBuyerEmail, devRedirectNote: null };
}

export type MailtrapSendResult =
  | { ok: true }
  | { ok: false; reason: "missing_token" | "send_failed"; message?: string };

export async function sendMailWithMailtrap(mail: Mail): Promise<MailtrapSendResult> {
  const client = getMailtrapClient();
  if (!client) {
    return { ok: false, reason: "missing_token" };
  }
  try {
    await client.send(mail);
    return { ok: true };
  } catch (error) {
    const message =
      error && typeof error === "object" && "message" in error
        ? String((error as { message?: string }).message)
        : String(error);
    return { ok: false, reason: "send_failed", message };
  }
}
