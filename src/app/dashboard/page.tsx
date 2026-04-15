"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import { useDropzone } from "react-dropzone";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { DashboardOverviewView } from "@/components/dashboard/DashboardOverviewView";
import { DashboardEventsView } from "@/components/dashboard/DashboardEventsView";
import { DashboardTicketsView } from "@/components/dashboard/DashboardTicketsView";
import { 
  DashboardSidebarSkeleton, 
  DashboardTopbarSkeleton, 
  DashboardOverviewSkeleton,
  DashboardLoadingScreen
} from "@/components/dashboard/DashboardSkeleton";
import { auth, db } from "@/firebase/clientApp";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import type {
  AnalyticsSummary,
  DashboardView,
  EventItem,
  MetricCard,
  PurchaseItem,
  TicketGroup,
  TopCustomer,
} from "@/components/dashboard/dashboardTypes";

export default function DashboardPage() {
  const router = useRouter();
  const [user, authLoading] = useAuthState(auth);
  const [activeView, setActiveView] = useState<DashboardView>("dashboard");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create-event form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [price, setPrice] = useState("10");
  const [ticketsAvailable, setTicketsAvailable] = useState("100");
  const [eventMessage, setEventMessage] = useState("");

  // Firestore live subscriptions
  const [eventsSnapshot, eventsLoading] = useCollection(
    query(collection(db, "events"), orderBy("createdAt", "desc")),
  );
  const [purchasesSnapshot, purchasesLoading] = useCollection(
    query(collection(db, "purchases"), orderBy("createdAt", "desc")),
  );

  // Derived data -------------------------------------------------------
  const events = useMemo<EventItem[]>(() => {
    return (eventsSnapshot?.docs ?? []).map((docItem) => {
      const data = docItem.data();
      const currentTickets = Number(data.ticketsAvailable ?? 0);
      return {
        id: docItem.id,
        title: data.title as string,
        description: data.description as string,
        location: (data.location as string) ?? "Location not set",
        imageUrl: (data.imageUrl as string) ?? "",
        price: Number(data.price ?? 0),
        ticketsAvailable: currentTickets,
        initialTickets: Number(data.initialTickets ?? currentTickets),
        ownerId: data.ownerId as string,
      };
    });
  }, [eventsSnapshot]);

  const myEvents = useMemo<EventItem[]>(() => {
    if (!user) return [];
    return events.filter((item) => item.ownerId === user.uid);
  }, [events, user]);

  const purchases = useMemo<PurchaseItem[]>(() => {
    return (purchasesSnapshot?.docs ?? []).map((docItem) => {
      const data = docItem.data();
      const ticketsCount = Number(data.ticketsCount ?? 0);
      const unitPrice = Number(data.unitPrice ?? 0);
      const totalAmount = Number(data.totalAmount ?? unitPrice * ticketsCount);
      const createdAt = data.createdAt as { toMillis?: () => number } | undefined;
      return {
        id: docItem.id,
        eventId: (data.eventId as string) ?? "",
        eventTitle: (data.eventTitle as string) ?? "Untitled event",
        buyerFullName: (data.buyerFullName as string) ?? "Unknown buyer",
        buyerEmail: (data.buyerEmail as string) ?? "",
        buyerPhone: (data.buyerPhone as string) ?? "",
        ticketsCount,
        unitPrice,
        totalAmount,
        createdAtMs: createdAt?.toMillis ? createdAt.toMillis() : null,
      };
    });
  }, [purchasesSnapshot]);

  const myPurchases = useMemo<PurchaseItem[]>(() => {
    const myEventIds = new Set(myEvents.map((item) => item.id));
    return purchases.filter((item) => myEventIds.has(item.eventId));
  }, [myEvents, purchases]);

  const analytics = useMemo<AnalyticsSummary>(() => {
    const totalEvents = myEvents.length;
    const totalListed = myEvents.reduce((sum, item) => sum + item.initialTickets, 0);
    const remainingTickets = myEvents.reduce((sum, item) => sum + item.ticketsAvailable, 0);
    const soldTickets = totalListed - remainingTickets;
    const sellThroughRate = totalListed > 0 ? (soldTickets / totalListed) * 100 : 0;
    const totalRevenue = myPurchases.reduce((sum, item) => sum + item.totalAmount, 0);
    const uniqueCustomers = new Set(myPurchases.map((item) => item.buyerEmail || item.buyerPhone)).size;
    return {
      totalEvents,
      totalListed,
      remainingTickets,
      soldTickets,
      sellThroughRate,
      totalRevenue,
      totalOrders: myPurchases.length,
      uniqueCustomers,
    };
  }, [myEvents, myPurchases]);

  const metricCards = useMemo<MetricCard[]>(
    () => [
      {
        title: "Total Revenue",
        value: `$${analytics.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
        subtitle: `${analytics.totalOrders} order(s)`,
        ringColor: "border-[#5b4bdd]",
      },
      {
        title: "Events Created",
        value: String(analytics.totalEvents),
        subtitle: `${analytics.totalListed} listed tickets`,
        ringColor: "border-[#1dbf73]",
      },
      {
        title: "Tickets Sold",
        value: String(analytics.soldTickets),
        subtitle: `${analytics.sellThroughRate.toFixed(1)}% sell-through`,
        ringColor: "border-[#f3b900]",
      },
      {
        title: "Unique Customers",
        value: String(analytics.uniqueCustomers),
        subtitle: `${analytics.remainingTickets} ticket(s) remaining`,
        ringColor: "border-[#f35b89]",
      },
    ],
    [analytics],
  );

  const topCustomers = useMemo<TopCustomer[]>(() => {
    const grouped = new Map<string, TopCustomer>();
    myPurchases.forEach((item) => {
      const key = item.buyerEmail || item.buyerPhone || item.id;
      const current = grouped.get(key);
      if (current) {
        current.orders += 1;
        current.tickets += item.ticketsCount;
        current.totalAmount += item.totalAmount;
      } else {
        grouped.set(key, {
          name: item.buyerFullName,
          orders: 1,
          tickets: item.ticketsCount,
          totalAmount: item.totalAmount,
          email: item.buyerEmail,
        });
      }
    });
    return [...grouped.values()].sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 5);
  }, [myPurchases]);

  const recentSales = useMemo<PurchaseItem[]>(() => myPurchases.slice(0, 8), [myPurchases]);

  const ticketsByEvent = useMemo<TicketGroup[]>(() => {
    const grouped = myEvents.map((eventItem) => {
      const eventPurchases = myPurchases.filter((sale) => sale.eventId === eventItem.id);
      const soldCount = eventPurchases.reduce((sum, sale) => sum + sale.ticketsCount, 0);
      return {
        event: eventItem,
        sales: eventPurchases,
        soldCount,
        totalRevenue: eventPurchases.reduce((sum, sale) => sum + sale.totalAmount, 0),
      };
    });
    return grouped.sort((a, b) => b.sales.length - a.sales.length);
  }, [myEvents, myPurchases]);

  // Auth guard ---------------------------------------------------------
  useEffect(() => {
    if (!authLoading && (!user || user.isAnonymous)) {
      router.replace("/login");
    }
  }, [authLoading, router, user]);

  // Image dropzone helpers ---------------------------------------------
  const handleImageDrop = useCallback((acceptedFiles: File[]) => {
    const [file] = acceptedFiles;
    if (!file) return;
    setEventMessage("");
    setSelectedImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  }, []);

  const handleRemoveSelectedImage = useCallback(() => {
    setSelectedImageFile(null);
    setImagePreviewUrl("");
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleImageDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
    multiple: false,
    disabled: isCreatingEvent,
  });

  // Event handlers -----------------------------------------------------
  const handleCreateEvent = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEventMessage("");
    if (!user || user.isAnonymous) {
      setEventMessage("Please log in first.");
      return false;
    }

    const priceNumber = Number(price);
    const ticketsNumber = Number(ticketsAvailable);
    if (!title || !description || !location || Number.isNaN(priceNumber) || Number.isNaN(ticketsNumber)) {
      setEventMessage("Please fill all fields with valid values.");
      return false;
    }
    if (!selectedImageFile) {
      setEventMessage("Please add an event image.");
      return false;
    }
    if (priceNumber < 0 || ticketsNumber < 1) {
      setEventMessage("Price must be >= 0 and tickets must be at least 1.");
      return false;
    }

    try {
      setIsCreatingEvent(true);
      const uploadedImageUrl = await uploadImageToCloudinary(selectedImageFile);
      await addDoc(collection(db, "events"), {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        imageUrl: uploadedImageUrl,
        price: priceNumber,
        ticketsAvailable: ticketsNumber,
        initialTickets: ticketsNumber,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
      });
      setTitle("");
      setDescription("");
      setLocation("");
      setSelectedImageFile(null);
      setImagePreviewUrl("");
      setPrice("10");
      setTicketsAvailable("100");
      setEventMessage("Event created.");
      return true;
    } catch (error) {
      setEventMessage((error as Error).message);
      return false;
    } finally {
      setIsCreatingEvent(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    setEventMessage("");
    try {
      await deleteDoc(doc(db, "events", eventId));
      setEventMessage("Event deleted.");
    } catch (error) {
      setEventMessage((error as Error).message);
    }
  };

  const handleUpdate = async (event: EventItem) => {
    setEventMessage("");
    const nextTitle = window.prompt("New title", event.title);
    if (nextTitle === null) return;
    const nextDescription = window.prompt("New description", event.description);
    if (nextDescription === null) return;
    const nextPriceRaw = window.prompt("New price", String(event.price));
    if (nextPriceRaw === null) return;
    const nextTicketsRaw = window.prompt("New tickets available", String(event.ticketsAvailable));
    if (nextTicketsRaw === null) return;

    const nextPrice = Number(nextPriceRaw);
    const nextTickets = Number(nextTicketsRaw);
    if (!nextTitle.trim() || !nextDescription.trim() || Number.isNaN(nextPrice) || Number.isNaN(nextTickets)) {
      setEventMessage("Invalid update values.");
      return;
    }
    if (nextPrice < 0 || nextTickets < 0) {
      setEventMessage("Price and tickets cannot be negative.");
      return;
    }

    try {
      await updateDoc(doc(db, "events", event.id), {
        title: nextTitle.trim(),
        description: nextDescription.trim(),
        price: nextPrice,
        ticketsAvailable: nextTickets,
        initialTickets: Math.max(event.initialTickets, nextTickets),
      });
      setEventMessage("Event updated.");
    } catch (error) {
      setEventMessage((error as Error).message);
    }
  };

  // Loading / auth gate ------------------------------------------------
  if (authLoading || !user || user.isAnonymous) {
    // Option 1: Clean loading screen with logo (current)
    return <DashboardLoadingScreen />;
    
    // Option 2: Detailed skeleton layout (uncomment to use instead)
    // return (
    //   <main className="min-h-screen bg-[#f3f5fa] p-4 md:p-6">
    //     <div className="mx-auto grid w-full gap-5 xl:grid-cols-[255px_1fr]">
    //       <DashboardSidebarSkeleton />
    //       
    //       <div className="space-y-5">
    //         <DashboardTopbarSkeleton />
    //         <DashboardOverviewSkeleton />
    //       </div>
    //     </div>
    //   </main>
    // );
  }

  return (
    <main className="min-h-screen bg-theme-primary p-4 md:p-6">
      <div className="mx-auto grid w-full gap-5 xl:grid-cols-[255px_1fr]">
        <DashboardSidebar
          activeView={activeView}
          onSelectView={setActiveView}
          onLogout={() => signOut(auth)}
        />

        <div className="space-y-5">
          {activeView === "dashboard" && (
            <DashboardTopbar
              activeView={activeView}
              userEmail={user.email}
              onOpenCreateEvent={() => setShowCreateModal(true)}
            />
          )}

          {activeView === "dashboard" ? (
            <DashboardOverviewView
              metricCards={metricCards}
              analytics={analytics}
              topCustomers={topCustomers}
              purchasesLoading={purchasesLoading}
              recentSales={recentSales}
            />
          ) : activeView === "events" ? (
            <DashboardEventsView
              myEvents={myEvents}
              eventsLoading={eventsLoading}
              onCreateEvent={() => setShowCreateModal(true)}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ) : (
            <DashboardTicketsView
              ticketsByEvent={ticketsByEvent}
              loading={eventsLoading || purchasesLoading}
            />
          )}

            {eventMessage && (
              <p className="rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-300">
                {eventMessage}
              </p>
            )}
        </div>
      </div>

      {/* Create-event modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <section className="w-full max-w-xl rounded-3xl border border-slate-600 bg-slate-800 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Create New Event</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg border border-slate-600 px-3 py-1 text-sm text-slate-300 transition hover:bg-slate-700"
              >
                Close
              </button>
            </div>
            {eventMessage && (
              <p className="mb-4 rounded-xl border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-300">
                {eventMessage}
              </p>
            )}
            <form
              onSubmit={async (e) => {
                const created = await handleCreateEvent(e);
                if (created) setShowCreateModal(false);
              }}
              className="grid gap-3 md:grid-cols-2"
            >
              <input
                className="rounded-xl border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
                type="text"
                placeholder="Event title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <input
                className="rounded-xl border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
                type="number"
                min="0"
                step="0.01"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
              <textarea
                className="rounded-xl border border-slate-600 bg-slate-700 p-3 text-sm text-white placeholder:text-slate-400 focus:border-slate-400 focus:outline-none md:col-span-2"
                placeholder="Event description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
              />
              <input
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none md:col-span-2"
                type="text"
                placeholder="Event location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
              <div
                {...getRootProps()}
                className={`cursor-pointer rounded-xl border border-dashed px-4 py-6 text-center text-sm transition md:col-span-2 ${
                  isCreatingEvent
                    ? "border-slate-600 bg-slate-700 text-slate-300"
                    : isDragActive
                      ? "border-slate-400 bg-slate-700 text-slate-200"
                      : "border-slate-600 bg-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-600"
                }`}
              >
                <input {...getInputProps()} />
                {isCreatingEvent
                  ? "Uploading to Cloudinary..."
                  : isDragActive
                    ? "Drop the event image here"
                    : "Drag and drop event image here, or click to select"}
              </div>
              {imagePreviewUrl ? (
                <div className="relative h-48 overflow-hidden rounded-xl border border-slate-600 md:col-span-2">
                  <Image src={imagePreviewUrl} alt="Selected event image preview" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSelectedImage();
                    }}
                    disabled={isCreatingEvent}
                    className="absolute right-2 top-2 rounded-lg bg-slate-900/90 border border-slate-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Remove
                  </button>
                </div>
              ) : null}
              <input
                className="rounded-xl border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
                type="number"
                min="1"
                placeholder="Tickets available"
                value={ticketsAvailable}
                onChange={(e) => setTicketsAvailable(e.target.value)}
                required
              />
              <button
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-black md:col-span-2"
                type="submit"
                disabled={isCreatingEvent}
              >
                {isCreatingEvent ? "Creating Event..." : "Create Event"}
              </button>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
