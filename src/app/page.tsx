"use client";

import { LandingPageEmpty } from "../components/LandingPageSkeleton";
import { db } from "../firebase/clientApp";
import {
  collection,
  orderBy,
  query,
} from "firebase/firestore";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle,
  CreditCard,
  Eye,
  Heart,
  Mail,
  MapPin,
  Minus,
  Phone,
  Plus,
  Shield,
  Sparkles,
  Star,
  Ticket,
  TrendingUp,
  User,
  Users,
  X,
  XCircle,
  Zap
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";

type EventItem = {
  id: string;
  title: string;
  description: string;
  location: string;
  imageUrl: string;
  price: number;
  ticketsAvailable: number;
};

type PurchaseForm = {
  fullName: string;
  email: string;
  phone: string;
  tickets: string;
};

const emptyPurchaseForm: PurchaseForm = {
  fullName: "",
  email: "",
  phone: "",
  tickets: "1",
};

export default function Home() {
  const [eventMessage, setEventMessage] = useState("");
  const [isSuccessMessage, setIsSuccessMessage] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isTicketStepComplete, setIsTicketStepComplete] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState<PurchaseForm>(emptyPurchaseForm);
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);

  const [eventsSnapshot, eventsLoading] = useCollection(
    query(collection(db, "events"), orderBy("createdAt", "desc")),
  );
  const events = useMemo(() => {
    return (eventsSnapshot?.docs ?? []).map((docItem) => {
      const data = docItem.data();
      return {
        id: docItem.id,
        title: data.title as string,
        description: data.description as string,
        location: (data.location as string) ?? "Location not set",
        imageUrl: (data.imageUrl as string) ?? "",
        price: Number(data.price ?? 0),
        ticketsAvailable: Number(data.ticketsAvailable ?? 0),
      };
    }) as EventItem[];
  }, [eventsSnapshot]);

  const soldOutEvents = useMemo(
    () => events.filter((eventItem) => eventItem.ticketsAvailable < 1).length,
    [events],
  );
  const latestEvent = events[0] ?? null;
  const featuredEvents = events.length > 1 ? events.slice(1) : events;

  const selectedTickets = Math.max(1, Number(purchaseForm.tickets) || 1);
  const totalAmount = selectedEvent ? selectedTickets * selectedEvent.price : 0;

  const openPurchaseModal = (event: EventItem) => {
    setSelectedEvent(event);
    setIsTicketStepComplete(false);
    setPurchaseForm(emptyPurchaseForm);
    setEventMessage("");
  };

  const closePurchaseModal = () => {
    if (isPurchasing) {
      return;
    }
    setSelectedEvent(null);
    setIsTicketStepComplete(false);
    setPurchaseForm(emptyPurchaseForm);
  };

  const continueToDetailsStep = () => {
    if (!selectedEvent) {
      return;
    }
    const requestedTickets = Number(purchaseForm.tickets);
    if (!Number.isInteger(requestedTickets) || requestedTickets < 1) {
      setIsSuccessMessage(false);
      setEventMessage("Number of tickets must be at least 1.");
      return;
    }
    if (requestedTickets > selectedEvent.ticketsAvailable) {
      setIsSuccessMessage(false);
      setEventMessage(`Only ${selectedEvent.ticketsAvailable} ticket(s) are left for this event.`);
      return;
    }
    setEventMessage("");
    setIsTicketStepComplete(true);
  };

  const updatePurchaseForm = (field: keyof PurchaseForm, value: string) => {
    setPurchaseForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const incrementTickets = () => {
    const current = Number(purchaseForm.tickets) || 1;
    const max = selectedEvent?.ticketsAvailable || 1;
    if (current < max) {
      updatePurchaseForm("tickets", String(current + 1));
    }
  };

  const decrementTickets = () => {
    const current = Number(purchaseForm.tickets) || 1;
    if (current > 1) {
      updatePurchaseForm("tickets", String(current - 1));
    }
  };

  const submitPurchase = async () => {
    if (!selectedEvent) {
      return;
    }

    const fullName = purchaseForm.fullName.trim();
    const email = purchaseForm.email.trim();
    const phone = purchaseForm.phone.trim();
    const requestedTickets = Number(purchaseForm.tickets);

    if (!fullName || !email || !phone) {
      setIsSuccessMessage(false);
      setEventMessage("Please fill your full name, email, and phone number.");
      return;
    }
    if (!email.includes("@")) {
      setIsSuccessMessage(false);
      setEventMessage("Please enter a valid email address.");
      return;
    }
    if (phone.length < 7) {
      setIsSuccessMessage(false);
      setEventMessage("Please enter a valid phone number.");
      return;
    }
    if (!Number.isInteger(requestedTickets) || requestedTickets < 1) {
      setIsSuccessMessage(false);
      setEventMessage("Number of tickets must be at least 1.");
      return;
    }
    if (requestedTickets > selectedEvent.ticketsAvailable) {
      setIsSuccessMessage(false);
      setEventMessage(`Only ${selectedEvent.ticketsAvailable} ticket(s) are left for this event.`);
      return;
    }

    setIsPurchasing(true);
    setEventMessage("");

    try {
      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          fullName,
          email,
          phone,
          tickets: requestedTickets,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; totalAmount?: number; emailSent?: boolean; emailError?: string }
        | null;
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to complete ticket purchase.");
      }

      const totalAmountPaid = Number(payload?.totalAmount ?? selectedEvent.price * requestedTickets);
      const emailText = payload?.emailSent
        ? " A QR code ticket has been sent to your email."
        : payload?.emailError
          ? ` Purchase saved. Ticket email failed: ${payload.emailError} For Mailtrap Email Testing, add MAILTRAP_SANDBOX=true and MAILTRAP_TEST_INBOX_ID (then restart next dev).`
          : " Purchase saved, but ticket email was not sent (set MAILTRAP_TOKEN and restart the dev server).";
      setIsSuccessMessage(true);
      setEventMessage(
        `Ticket purchased successfully. Total amount: $${totalAmountPaid.toFixed(2)}.${emailText}`,
      );
      setPurchaseForm(emptyPurchaseForm);
      setSelectedEvent(null);
    } catch (error) {
      setIsSuccessMessage(false);
      setEventMessage((error as Error).message);
    } finally {
      setIsPurchasing(false);
    }
  };

  // Loading state - show nothing while loading
  if (eventsLoading) {
    return <LandingPageEmpty />;
  }

  return (
    <main className="min-h-screen bg-theme-primary px-4 py-8 md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl btn-primary shadow-lg">
              <Ticket className="h-7 w-7 text-theme-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-theme-primary">
                  KSN Ticket Hub
                </p>
                <Sparkles className="h-4 w-4 text-theme-secondary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-theme-primary md:text-4xl">
                Discover Amazing Events
              </h1>
              <p className="text-theme-secondary mt-1">Book tickets in seconds and join unforgettable experiences</p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="btn-primary group flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
          >
            <BarChart3 className="h-4 w-4 transition-transform group-hover:scale-110" />
            <span>Manage Events</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </header>

        {/* Hero Section */}
        <section className="grid gap-8 lg:grid-cols-[1.8fr_1fr]">
          {/* Main Poster */}
          <article className="group relative min-h-[320px] overflow-hidden rounded-3xl card shadow-xl md:min-h-[400px] transition-all duration-300 hover:shadow-2xl">
            <Image
              src="/main_poster.png"
              alt="Main event poster"
              fill
              priority
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/10" />
            
            {/* Floating Badge */}
            <div className="absolute right-6 top-6">
              <div className="flex items-center gap-2 rounded-full bg-slate-800/90 backdrop-blur-sm px-4 py-2 shadow-lg border border-slate-600">
                <Eye className="h-4 w-4 text-white" />
                <span className="text-sm font-semibold text-white">Featured</span>
              </div>
            </div>
          </article>

          {/* Latest Event Card */}
          <article className="rounded-3xl card p-6 shadow-xl transition-all duration-300 hover:shadow-2xl">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-theme-primary">
                  Latest Event
                </p>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-green-600 font-medium">Live</span>
                </div>
              </div>
            </div>

            {latestEvent ? (
              <div className="space-y-5">
                {latestEvent.imageUrl?.trim() ? (
                  <div className="group/img relative h-44 overflow-hidden rounded-2xl border border-slate-200">
                    <Image
                      src={latestEvent.imageUrl.trim()}
                      alt={latestEvent.title}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-500 group-hover/img:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover/img:bg-black/10" />
                  </div>
                ) : (
                  <div className="flex h-44 items-center justify-center rounded-2xl border-2 border-dashed border-slate-600 bg-slate-700">
                    <Calendar className="h-16 w-16 text-slate-400" />
                  </div>
                )}
                
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-theme-primary">
                    {latestEvent.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm text-theme-secondary">{latestEvent.description}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-theme-tertiary" />
                    <p className="text-sm font-medium text-theme-tertiary uppercase tracking-wide">
                      {latestEvent.location}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="group flex items-center gap-3 rounded-xl border-theme-secondary bg-theme-tertiary px-4 py-3 transition-all hover:border-theme-tertiary" style={{ backgroundColor: 'var(--accent-green-bg)' }}>
                    <TrendingUp className="h-4 w-4" style={{ color: 'var(--accent-green)' }} />
                    <div>
                      <p className="text-xs text-theme-tertiary">Price</p>
                      <p className="font-bold text-theme-primary">${latestEvent.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="group flex items-center gap-3 rounded-xl border-theme-secondary bg-theme-tertiary px-4 py-3 transition-all hover:border-theme-tertiary" style={{ backgroundColor: 'var(--accent-purple-bg)' }}>
                    <Ticket className="h-4 w-4" style={{ color: 'var(--accent-purple)' }} />
                    <div>
                      <p className="text-xs text-theme-tertiary">Available</p>
                      <p className="font-bold text-theme-primary">{latestEvent.ticketsAvailable}</p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={latestEvent.ticketsAvailable < 1}
                  onClick={() => openPurchaseModal(latestEvent)}
                  className={`group flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-bold text-white shadow-lg transition-all duration-200 ${
                    latestEvent.ticketsAvailable < 1
                      ? "bg-slate-400 cursor-not-allowed"
                      : "bg-slate-900 hover:bg-black hover:shadow-xl hover:scale-105"
                  }`}
                >
                  {latestEvent.ticketsAvailable < 1 ? (
                    <>
                      <XCircle className="h-5 w-5" />
                      Sold Out
                    </>
                  ) : (
                    <>
                      <Ticket className="h-5 w-5 transition-transform group-hover:scale-110" />
                      Buy Tickets Now
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-theme-tertiary">
                  <Calendar className="h-8 w-8 text-theme-tertiary" />
                </div>
                <h3 className="font-semibold text-theme-secondary">No events yet</h3>
                <p className="text-sm text-theme-tertiary mt-1">Create your first event to get started</p>
              </div>
            )}
          </article>
        </section>

        {/* Message Section */}
        {eventMessage && (
          <section
            className={`group flex items-center gap-3 rounded-2xl border px-5 py-4 shadow-md transition-all duration-300 hover:shadow-lg ${
              isSuccessMessage
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
            }`}
          >
            {isSuccessMessage ? (
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <p className="font-medium">{eventMessage}</p>
          </section>
        )}

        {/* Featured Events Section */}
        <section className="card space-y-6 rounded-[28px] p-8 shadow-xl transition-all duration-300 hover:shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 shadow-md">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-theme-primary">Featured Events</h2>
                <p className="text-theme-secondary">Discover amazing experiences waiting for you</p>
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div className="group flex flex-col items-center rounded-xl border-theme-secondary bg-theme-tertiary px-4 py-3 transition-all hover:border-theme-tertiary" style={{ backgroundColor: 'var(--accent-blue-bg)' }}>
                <Calendar className="h-5 w-5 mb-1" style={{ color: 'var(--accent-blue)' }} />
                <p className="text-xl font-bold text-theme-primary">{events.length}</p>
                <p className="text-theme-secondary">Live Events</p>
              </div>
              <div className="group flex flex-col items-center rounded-xl border-theme-secondary bg-theme-tertiary px-4 py-3 transition-all hover:border-theme-tertiary" style={{ backgroundColor: 'var(--accent-purple-bg)' }}>
                <Ticket className="h-5 w-5 mb-1" style={{ color: 'var(--accent-purple)' }} />
                <p className="text-xl font-bold text-theme-primary">
                  {events.reduce((sum, eventItem) => sum + eventItem.ticketsAvailable, 0)}
                </p>
                <p className="text-theme-secondary">Available</p>
              </div>
              <div className="group flex flex-col items-center rounded-xl border-theme-secondary bg-theme-tertiary px-4 py-3 transition-all hover:border-theme-tertiary" style={{ backgroundColor: 'var(--accent-red-bg)' }}>
                <XCircle className="h-5 w-5 mb-1" style={{ color: 'var(--accent-red)' }} />
                <p className="text-xl font-bold text-theme-primary">{soldOutEvents}</p>
                <p className="text-theme-secondary">Sold Out</p>
              </div>
            </div>
          </div>

          {featuredEvents.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-theme-tertiary">
                <Calendar className="h-10 w-10 text-theme-tertiary" />
              </div>
              <h3 className="text-xl font-semibold text-theme-primary mb-2">No events published yet</h3>
              <p className="text-theme-secondary max-w-md">
                Create amazing events from the dashboard and they will appear here automatically for everyone to discover.
              </p>
              <Link
                href="/dashboard"
                className="btn-primary mt-6 flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all hover:scale-105"
              >
                <Plus className="h-4 w-4" />
                Create First Event
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featuredEvents.map((eventItem, index) => {
                const isHovered = hoveredEvent === eventItem.id;
                return (
                  <article
                    key={eventItem.id}
                    className={`card group relative overflow-hidden rounded-3xl p-6 shadow-lg transition-all duration-300 ${
                      isHovered
                        ? "shadow-2xl scale-[1.02] -translate-y-2"
                        : "hover:shadow-xl"
                    }`}
                    onMouseEnter={() => setHoveredEvent(eventItem.id)}
                    onMouseLeave={() => setHoveredEvent(null)}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Status Indicator */}
                    <div className={`absolute top-0 left-0 right-0 h-1 ${
                      index % 4 === 0 ? "bg-slate-900" :
                      index % 4 === 1 ? "bg-purple-500" :
                      index % 4 === 2 ? "bg-pink-500" : "bg-emerald-500"
                    }`} />

                    {eventItem.imageUrl?.trim() ? (
                      <div className="relative mb-5 h-44 overflow-hidden rounded-2xl border border-slate-200">
                        <Image
                          src={eventItem.imageUrl.trim()}
                          alt={eventItem.title}
                          fill
                          unoptimized
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/10" />
                        
                        {/* Floating Status Badge */}
                        <div className="absolute right-3 top-3">
                          <div className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold shadow-lg backdrop-blur-sm ${
                            eventItem.ticketsAvailable > 0
                              ? "bg-green-500 text-white"
                              : "bg-red-500 text-white"
                          }`}>
                            {eventItem.ticketsAvailable > 0 ? (
                              <>
                                <CheckCircle className="h-3 w-3" />
                                Available
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3" />
                                Sold Out
                              </>
                            )}
                          </div>
                        </div>

                        {/* Love Button */}
                        <button className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800/90 backdrop-blur-sm shadow-md transition-all hover:bg-slate-800 hover:scale-110 border border-slate-600">
                          <Heart className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    ) : (
                      <div className="mb-5 flex h-44 items-center justify-center rounded-2xl border-2 border-dashed border-slate-600 bg-slate-700">
                        <Calendar className="h-12 w-12 text-slate-400" />
                      </div>
                    )}

                    <div className="mb-4">
                      <h3 className="text-xl font-bold tracking-tight text-theme-primary mb-2 group-hover:text-theme-secondary transition-colors">
                        {eventItem.title}
                      </h3>
                      <p className="line-clamp-3 text-sm text-theme-secondary mb-3">
                        {eventItem.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-theme-tertiary" />
                        <p className="text-sm font-medium text-theme-tertiary uppercase tracking-wide">
                          {eventItem.location}
                        </p>
                      </div>
                    </div>

                    {/* Price & Tickets Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="flex items-center gap-3 rounded-xl border-theme-secondary bg-theme-tertiary px-4 py-3 transition-all hover:border-theme-tertiary" style={{ backgroundColor: 'var(--accent-green-bg)' }}>
                        <TrendingUp className="h-4 w-4" style={{ color: 'var(--accent-green)' }} />
                        <div>
                          <p className="text-xs text-theme-tertiary">Price</p>
                          <p className="font-bold text-theme-primary">${eventItem.price.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-xl border-theme-secondary bg-theme-tertiary px-4 py-3 transition-all hover:border-theme-tertiary" style={{ backgroundColor: 'var(--accent-purple-bg)' }}>
                        <Ticket className="h-4 w-4" style={{ color: 'var(--accent-purple)' }} />
                        <div>
                          <p className="text-xs text-theme-tertiary">Left</p>
                          <p className="font-bold text-theme-primary">{eventItem.ticketsAvailable}</p>
                        </div>
                      </div>
                    </div>

                    {/* Buy Button */}
                    <button
                      type="button"
                      disabled={eventItem.ticketsAvailable < 1}
                      onClick={() => openPurchaseModal(eventItem)}
                      className={`group/btn flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-bold shadow-md transition-all duration-200 ${
                        eventItem.ticketsAvailable < 1
                          ? "bg-theme-quaternary text-theme-muted cursor-not-allowed"
                          : "btn-primary hover:shadow-lg hover:scale-105"
                      }`}
                    >
                      {eventItem.ticketsAvailable < 1 ? (
                        <>
                          <XCircle className="h-5 w-5" />
                          Sold Out
                        </>
                      ) : (
                        <>
                          <Ticket className="h-5 w-5 transition-transform group-hover/btn:scale-110" />
                          Buy Tickets
                          <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                        </>
                      )}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Purchase Modal */}
      {selectedEvent && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4">
          <section className="card w-full max-w-5xl rounded-3xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            {/* Modal Header */}
            <div className="border-b border-theme-primary p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 shadow-md">
                    <Ticket className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-900 mb-1">
                      Purchase Tickets
                    </p>
                    <h3 className="text-xl font-bold tracking-tight text-theme-primary">
                      {selectedEvent.title}
                    </h3>
                    <p className="mt-1 text-sm text-theme-secondary">Choose tickets first, then continue to buyer details.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closePurchaseModal}
                  disabled={isPurchasing}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border-theme-secondary text-theme-tertiary transition-all hover:bg-theme-tertiary hover:text-theme-primary disabled:cursor-not-allowed"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="grid gap-6 lg:grid-cols-[0.95fr_1.45fr]">
                <aside className="space-y-4">
                  {selectedEvent.imageUrl?.trim() ? (
                    <div className="relative h-72 overflow-hidden rounded-2xl border border-theme-secondary">
                      <Image
                        src={selectedEvent.imageUrl.trim()}
                        alt={selectedEvent.title}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-72 items-center justify-center rounded-2xl border-2 border-dashed border-slate-600 bg-slate-700">
                      <Calendar className="h-12 w-12 text-slate-400" />
                    </div>
                  )}

                  <div className="space-y-3 rounded-2xl border-theme-secondary bg-theme-tertiary p-4">
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-theme-secondary">Event Details</h4>
                    <div className="flex items-start gap-2 text-sm text-theme-secondary">
                      <MapPin className="mt-0.5 h-4 w-4 text-theme-tertiary" />
                      <span>{selectedEvent.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-theme-secondary">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span>${selectedEvent.price.toFixed(2)} per ticket</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-theme-secondary">
                      <Users className="h-4 w-4 text-orange-600" />
                      <span>{selectedEvent.ticketsAvailable} available</span>
                    </div>
                  </div>

                </aside>

                <div className="space-y-5">
                  {/* Ticket Selection */}
                  <div className="space-y-4">
                    <h4 className="flex items-center gap-2 text-lg font-semibold text-theme-primary">
                      <Ticket className="h-5 w-5 text-theme-primary" />
                      Ticket Selection
                    </h4>

                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-theme-secondary mb-2">
                          Number of Tickets
                        </label>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={decrementTickets}
                            disabled={Number(purchaseForm.tickets) <= 1}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border-theme-secondary bg-theme-tertiary text-theme-secondary transition-all hover:bg-theme-quaternary disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={selectedEvent.ticketsAvailable}
                            value={purchaseForm.tickets}
                            onChange={(e) => updatePurchaseForm("tickets", e.target.value)}
                            className="input-field w-20 px-3 py-2 text-center text-sm font-semibold transition-all"
                            required
                          />
                          <button
                            type="button"
                            onClick={incrementTickets}
                            disabled={Number(purchaseForm.tickets) >= selectedEvent.ticketsAvailable}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border-theme-secondary bg-theme-tertiary text-theme-secondary transition-all hover:bg-theme-quaternary disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Total Amount */}
                      <div className="rounded-xl border-theme-secondary bg-theme-tertiary px-6 py-4">
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard className="h-4 w-4 text-theme-primary" />
                          <p className="text-sm font-medium text-theme-secondary">Total Amount</p>
                        </div>
                        <p className="text-2xl font-bold text-theme-primary">${totalAmount.toFixed(2)}</p>
                        <p className="text-xs text-theme-tertiary">
                          {selectedTickets} × ${selectedEvent.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={continueToDetailsStep}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-bold shadow-lg transition-all duration-200 btn-primary hover:shadow-xl hover:scale-105"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>

                  <div className="space-y-2 rounded-2xl border-theme-secondary bg-theme-tertiary p-4">
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-theme-secondary">About</h4>
                    <p className="text-sm leading-6 text-theme-secondary">{selectedEvent.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
      {selectedEvent && isTicketStepComplete && (
        <div className="modal-overlay fixed inset-0 z-60 flex items-center justify-center p-4">
          <section className="card w-full max-w-2xl rounded-3xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="border-b border-theme-primary p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-900 mb-1">
                    Buyer Details
                  </p>
                  <h3 className="text-xl font-bold tracking-tight text-theme-primary">
                    {selectedEvent.title}
                  </h3>
                  <p className="mt-1 text-sm text-theme-secondary">
                    {selectedTickets} ticket(s) selected - ${totalAmount.toFixed(2)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTicketStepComplete(false)}
                  disabled={isPurchasing}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border-theme-secondary text-theme-tertiary transition-all hover:bg-theme-tertiary hover:text-theme-primary disabled:cursor-not-allowed"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <form
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  void submitPurchase();
                }}
              >
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 text-lg font-semibold text-theme-primary">
                    <User className="h-5 w-5 text-theme-primary" />
                    Personal Information
                  </h4>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-theme-secondary mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={purchaseForm.fullName}
                        onChange={(e) => updatePurchaseForm("fullName", e.target.value)}
                        placeholder="Enter your full name"
                        className="input-field w-full px-4 py-3 text-sm placeholder:text-theme-tertiary transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-secondary mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="email"
                          value={purchaseForm.email}
                          onChange={(e) => updatePurchaseForm("email", e.target.value)}
                          placeholder="your.email@example.com"
                          className="input-field w-full pl-10 pr-4 py-3 text-sm placeholder:text-theme-tertiary transition-all"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="tel"
                        value={purchaseForm.phone}
                        onChange={(e) => updatePurchaseForm("phone", e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="input-field w-full pl-10 pr-4 py-3 text-sm placeholder:text-theme-tertiary transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-theme-secondary">Secure Transaction</p>
                    <p className="text-xs text-theme-tertiary">Your payment information is protected with industry-standard encryption</p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <button
                    type="button"
                    disabled={isPurchasing}
                    onClick={() => setIsTicketStepComplete(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-theme-secondary bg-theme-tertiary px-6 py-4 text-sm font-semibold text-theme-secondary transition-all duration-200 hover:bg-theme-quaternary disabled:cursor-not-allowed"
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={isPurchasing}
                    className={`group flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-bold shadow-lg transition-all duration-200 ${
                      isPurchasing
                        ? "bg-theme-quaternary text-theme-muted cursor-not-allowed"
                        : "btn-primary hover:shadow-xl hover:scale-105"
                    }`}
                  >
                    {isPurchasing ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 transition-transform group-hover:scale-110" />
                        Complete Purchase
                        <Zap className="h-4 w-4 transition-transform group-hover:scale-110" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}