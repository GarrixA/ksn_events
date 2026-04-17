"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ExternalLink, QrCode, Ticket } from "lucide-react";

function TicketVerifyContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const token = searchParams.get("token");
  const hasParams = Boolean(id?.trim() && token?.trim());

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600 shadow-lg">
            <Ticket className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">KSN Ticket Hub</h1>
            <p className="text-sm text-slate-400">Event ticket link</p>
          </div>
        </div>

        {hasParams ? (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800">
              <QrCode className="h-6 w-6 text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Open this ticket in the app</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              This QR was scanned outside the official check-in scanner. To validate entry, event staff
              should use <strong className="text-white">Manage Tickets</strong> and{" "}
              <strong className="text-white">Scan Ticket</strong> in the Ticket Hub dashboard.
            </p>
            <p className="mt-3 text-sm text-slate-400">
              Attendees: show your QR at the door—staff will scan it with the in-app camera.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-purple-700"
              >
                Open Ticket Hub
                <ExternalLink className="h-4 w-4" />
              </Link>
              <Link
                href="/"
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-600 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
              >
                Home
              </Link>
            </div>
          </section>
        ) : (
          <section className="rounded-2xl border border-amber-500/30 bg-amber-950/40 p-6">
            <h2 className="text-lg font-semibold text-amber-100">Invalid ticket link</h2>
            <p className="mt-2 text-sm text-amber-200/90">
              This URL is missing ticket information. Use the QR from your confirmation email or ask the
              organizer to resend your ticket.
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-purple-400 hover:text-purple-300"
            >
              Go to home
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}

export default function TicketVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
          Loading…
        </div>
      }
    >
      <TicketVerifyContent />
    </Suspense>
  );
}
