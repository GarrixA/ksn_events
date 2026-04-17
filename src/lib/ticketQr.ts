/**
 * Ticket QR encodes a public verify URL so phone cameras open the web app.
 * Legacy tickets used raw JSON; both formats are accepted when scanning.
 */

export function getPublicAppOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (explicit) {
    return explicit;
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return vercel.startsWith("http") ? vercel.replace(/\/$/, "") : `https://${vercel}`;
  }
  return "http://localhost:3000";
}

export function buildTicketVerifyUrl(ticketId: string, ticketToken: string): string {
  const base = getPublicAppOrigin();
  const url = new URL("/ticket-verify", `${base}/`);
  url.searchParams.set("id", ticketId);
  url.searchParams.set("token", ticketToken);
  return url.toString();
}

export function parseTicketQrPayload(raw: string): { ticketId: string; ticketToken: string } | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const url = new URL(trimmed);
      const id = url.searchParams.get("id") ?? url.searchParams.get("ticketId");
      const token = url.searchParams.get("token") ?? url.searchParams.get("t");
      if (id && token) {
        return { ticketId: id.trim(), ticketToken: token.trim() };
      }
    } catch {
      return null;
    }
    return null;
  }

  try {
    const parsed = JSON.parse(trimmed) as { ticketId?: string; ticketToken?: string };
    const ticketId = parsed.ticketId?.trim() ?? "";
    const ticketToken = parsed.ticketToken?.trim() ?? "";
    if (ticketId && ticketToken) {
      return { ticketId, ticketToken };
    }
  } catch {
    return null;
  }

  return null;
}
