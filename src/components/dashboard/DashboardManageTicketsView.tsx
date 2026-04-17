"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  Camera,
  CheckCircle,
  Eye,
  Mail,
  MapPin,
  Phone,
  QrCode,
  RotateCw,
  ScanLine,
  X,
  XCircle,
} from "lucide-react";
import { ManagedTicket } from "@/components/dashboard/dashboardTypes";

type DashboardManageTicketsViewProps = {
  tickets: ManagedTicket[];
  loading: boolean;
};

/** Response shape from POST /api/tickets/scan on success — merged into the list immediately. */
type ValidatedTicketPayload = {
  id: string;
  purchaseId: string;
  eventId: string;
  eventTitle: string;
  eventLocation: string;
  ownerId: string;
  buyerFullName: string;
  buyerEmail: string;
  buyerPhone: string;
  ticketCode: string;
  qrPayload: string;
  status: "used";
  createdAtMs: number | null;
  usedAtMs: number | null;
};

function formatDateTime(ms: number | null): string {
  if (ms == null) {
    return "—";
  }
  try {
    return new Date(ms).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

export function DashboardManageTicketsView({ tickets, loading }: DashboardManageTicketsViewProps) {
  const [selectedTicket, setSelectedTicket] = useState<ManagedTicket | null>(null);
  const [detailsTicket, setDetailsTicket] = useState<ManagedTicket | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanError, setScanError] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");
  const [resendingTicketId, setResendingTicketId] = useState<string | null>(null);
  /** Shown in the list before Firestore snapshot catches up (or if the listener lags). */
  const [pinnedTickets, setPinnedTickets] = useState<ManagedTicket[]>([]);
  const [scanSuccessBanner, setScanSuccessBanner] = useState("");
  const scannerRef = useRef<{
    stop: () => Promise<void>;
    clear: () => void | Promise<void>;
  } | null>(null);
  const handlingResultRef = useRef(false);
  const scannerElementId = "dashboard-qr-scanner";

  const mergeValidatedTicket = useCallback((raw: ValidatedTicketPayload | undefined) => {
    if (!raw?.id) {
      return;
    }
    const next: ManagedTicket = {
      id: raw.id,
      purchaseId: raw.purchaseId,
      eventId: raw.eventId,
      eventTitle: raw.eventTitle,
      eventLocation: raw.eventLocation,
      ownerId: raw.ownerId,
      buyerFullName: raw.buyerFullName,
      buyerEmail: raw.buyerEmail,
      buyerPhone: raw.buyerPhone,
      ticketCode: raw.ticketCode,
      qrPayload: raw.qrPayload,
      status: "used",
      createdAtMs: raw.createdAtMs,
      usedAtMs: raw.usedAtMs,
    };
    setPinnedTickets((prev) => [...prev.filter((p) => p.id !== next.id), next]);
  }, []);

  useEffect(() => {
    setPinnedTickets((prev) => prev.filter((p) => !tickets.some((t) => t.id === p.id)));
  }, [tickets]);

  const displayTickets = useMemo(() => {
    const byId = new Map<string, ManagedTicket>();
    tickets.forEach((t) => byId.set(t.id, t));
    pinnedTickets.forEach((p) => byId.set(p.id, p));
    return Array.from(byId.values()).sort((a, b) => (b.createdAtMs ?? 0) - (a.createdAtMs ?? 0));
  }, [tickets, pinnedTickets]);

  const stopScanner = async () => {
    if (!scannerRef.current) {
      return;
    }
    try {
      await scannerRef.current.stop();
    } catch {
      // Scanner may already be stopped.
    }
    try {
      await scannerRef.current.clear();
    } catch {
      // Ignore clear errors.
    }
    scannerRef.current = null;
  };

  useEffect(() => {
    if (!isScannerOpen) {
      void stopScanner();
      return;
    }

    let cancelled = false;

    const initScanner = async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;
        const scanner = new Html5Qrcode(scannerElementId);
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 240 },
          async (decodedText) => {
            if (handlingResultRef.current) return;
            handlingResultRef.current = true;
            setScanError("");
            try {
              const response = await fetch("/api/tickets/scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ qrPayload: decodedText }),
              });
              const payload = (await response.json().catch(() => null)) as
                | {
                    ok?: boolean;
                    message?: string;
                    error?: string;
                    ticket?: ValidatedTicketPayload;
                  }
                | null;
              if (!response.ok || !payload?.ok) {
                setScanError(payload?.error || "Failed to validate ticket.");
              } else {
                mergeValidatedTicket(payload.ticket);
                setScanSuccessBanner(payload.message || "Ticket validated successfully.");
                setIsScannerOpen(false);
              }
            } catch {
              setScanError("Unable to validate ticket right now.");
            } finally {
              handlingResultRef.current = false;
              await stopScanner();
            }
          },
          () => {
            // Ignore per-frame decode errors.
          },
        );
      } catch {
        setScanError("Unable to access camera scanner.");
      }
    };

    void initScanner();

    return () => {
      cancelled = true;
      void stopScanner();
    };
  }, [isScannerOpen, mergeValidatedTicket]);

  useEffect(() => {
    if (!scanSuccessBanner) {
      return;
    }
    const t = window.setTimeout(() => setScanSuccessBanner(""), 8000);
    return () => window.clearTimeout(t);
  }, [scanSuccessBanner]);

  const resendTicketEmail = async (ticketId: string) => {
    setResendMessage("");
    setResendError("");
    setResendingTicketId(ticketId);
    try {
      const response = await fetch("/api/tickets/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; message?: string; error?: string }
        | null;
      if (!response.ok || !payload?.ok) {
        setResendError(payload?.error || "Unable to resend ticket email.");
        return;
      }
      setResendMessage(payload.message || "Ticket email resent successfully.");
    } catch {
      setResendError("Unable to resend ticket email right now.");
    } finally {
      setResendingTicketId(null);
    }
  };

  return (
    <section className="card min-w-0 space-y-5 rounded-[24px] p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 shadow-lg">
            <ScanLine className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Manage Tickets</h2>
            <p className="text-sm text-slate-300">
              Scan QRs for check-in; scanned tickets show status and full details below.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setScanError("");
            setIsScannerOpen(true);
          }}
          className="group flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-purple-700"
        >
          <Camera className="h-4 w-4 transition-transform group-hover:scale-110" />
          Scan Ticket
        </button>
      </div>
      {resendMessage && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/15 px-3 py-2 text-sm text-emerald-300">
          <CheckCircle className="h-4 w-4" />
          <span>{resendMessage}</span>
        </div>
      )}
      {resendError && (
        <div className="flex items-center gap-2 rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-300">
          <XCircle className="h-4 w-4" />
          <span>{resendError}</span>
        </div>
      )}

      {scanSuccessBanner && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-emerald-500/40 bg-emerald-950/50 px-3 py-2.5 text-sm text-emerald-200">
          <div className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            <span>{scanSuccessBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setScanSuccessBanner("")}
            className="shrink-0 rounded p-1 text-emerald-300/80 hover:bg-emerald-900/60 hover:text-emerald-100"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl bg-slate-800 p-4">
              <div className="h-4 w-1/2 rounded bg-slate-700" />
            </div>
          ))}
        </div>
      ) : displayTickets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/60 p-8 text-center">
          <ScanLine className="mx-auto mb-3 h-10 w-10 text-slate-500" />
          <p className="font-medium text-slate-200">No tickets to show yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-400">
            When someone buys a ticket for your event, it appears in this list. Use{" "}
            <span className="text-slate-300">Scan Ticket</span> to check them in—each scanned ticket is marked{" "}
            <span className="text-emerald-400/90">Scanned</span>. Tap{" "}
            <span className="text-slate-300">Details</span> to view the event, booker, purchase time, and scan
            time.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {displayTickets.map((ticketItem) => (
            <article
              key={ticketItem.id}
              className="rounded-xl border border-slate-700 bg-slate-800/80 p-4 transition-colors hover:border-slate-500"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{ticketItem.eventTitle}</p>
                  <p className="text-xs text-slate-400">Code: {ticketItem.ticketCode}</p>
                  <p className="text-xs text-slate-400">{ticketItem.buyerFullName}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      ticketItem.status === "used"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {ticketItem.status === "used" ? "Scanned" : "Active"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDetailsTicket(ticketItem)}
                    className="flex items-center gap-1 rounded-lg border border-slate-600 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
                    aria-label="View ticket details"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Details
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(ticketItem)}
                    className="flex items-center gap-1 rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-600"
                  >
                    <QrCode className="h-3.5 w-3.5" />
                    View QR
                  </button>
                  <button
                    type="button"
                    onClick={() => void resendTicketEmail(ticketItem.id)}
                    disabled={resendingTicketId === ticketItem.id}
                    className="flex items-center gap-1 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <RotateCw className={`h-3.5 w-3.5 ${resendingTicketId === ticketItem.id ? "animate-spin" : ""}`} />
                    {resendingTicketId === ticketItem.id ? "Sending..." : "Resend"}
                  </button>
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-xs text-slate-300 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span className="truncate">{ticketItem.buyerEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span>{ticketItem.buyerPhone}</span>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
                <span>Booked: {formatDateTime(ticketItem.createdAtMs)}</span>
                {ticketItem.status === "used" && (
                  <span>Scanned: {formatDateTime(ticketItem.usedAtMs)}</span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <section className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Ticket QR</h3>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="rounded-lg p-1 text-slate-300 hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col items-center gap-3 rounded-xl bg-white p-4">
              <QRCodeCanvas value={selectedTicket.qrPayload} size={220} includeMargin />
              <p className="text-center text-xs text-slate-700">{selectedTicket.ticketCode}</p>
            </div>
          </section>
        </div>
      )}

      {detailsTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <section className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Ticket details</h3>
              <button
                type="button"
                onClick={() => setDetailsTicket(null)}
                className="rounded-lg p-1 text-slate-300 hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      detailsTicket.status === "used"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {detailsTicket.status === "used" ? "Scanned" : "Active"}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Event</dt>
                <dd className="mt-1 font-medium text-white">{detailsTicket.eventTitle}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Location</dt>
                <dd className="mt-1 flex items-start gap-2 text-slate-200">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <span>{detailsTicket.eventLocation || "—"}</span>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Ticket code</dt>
                <dd className="mt-1 font-mono text-slate-200">{detailsTicket.ticketCode}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Booker</dt>
                <dd className="mt-1 space-y-1 text-slate-200">
                  <p>{detailsTicket.buyerFullName}</p>
                  <p className="flex items-center gap-2 text-slate-300">
                    <Mail className="h-3.5 w-3.5 text-slate-500" />
                    {detailsTicket.buyerEmail}
                  </p>
                  <p className="flex items-center gap-2 text-slate-300">
                    <Phone className="h-3.5 w-3.5 text-slate-500" />
                    {detailsTicket.buyerPhone}
                  </p>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Booked</dt>
                <dd className="mt-1 text-slate-200">{formatDateTime(detailsTicket.createdAtMs)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Scanned</dt>
                <dd className="mt-1 text-slate-200">
                  {detailsTicket.status === "used" ? formatDateTime(detailsTicket.usedAtMs) : "—"}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      )}

      {isScannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <section className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Scan Ticket</h3>
              <button
                type="button"
                onClick={() => {
                  setIsScannerOpen(false);
                  setScanError("");
                }}
                className="rounded-lg p-1 text-slate-300 hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div id={scannerElementId} className="overflow-hidden rounded-xl bg-black" />
            {scanError && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-300">
                <XCircle className="h-4 w-4" />
                <span>{scanError}</span>
              </div>
            )}
          </section>
        </div>
      )}
    </section>
  );
}
