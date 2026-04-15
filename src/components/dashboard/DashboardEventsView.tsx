"use client";

import Image from "next/image";
import { useState } from "react";
import { 
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Ticket,
  TrendingUp,
  Edit,
  Trash2,
  Plus,
  Star,
  Clock,
  Eye,
  BarChart3,
  Sparkles
} from "lucide-react";
import { EventItem } from "@/components/dashboard/dashboardTypes";

type DashboardEventsViewProps = {
  myEvents: EventItem[];
  eventsLoading: boolean;
  onCreateEvent: () => void;
  onUpdate: (event: EventItem) => void;
  onDelete: (eventId: string) => void;
};

export function DashboardEventsView({
  myEvents,
  eventsLoading,
  onCreateEvent,
  onUpdate,
  onDelete,
}: DashboardEventsViewProps) {
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);

  // Loading skeleton component
  if (eventsLoading) {
    return (
      <section className="rounded-[24px] border border-slate-200/70 bg-accent-blue p-6 shadow-[0_15px_40px_-35px_rgba(15,23,42,0.5)]">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 shadow-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">My Events</h2>
              <p className="text-sm text-slate-500">Manage and track your events</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCreateEvent}
            className="group flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:bg-purple-700 hover:shadow-xl hover:scale-105"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
            Create New Event
          </button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-slate-100 p-6">
              <div className="h-40 rounded-xl bg-slate-200 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 w-3/4 rounded bg-slate-200"></div>
                <div className="h-3 w-full rounded bg-slate-200"></div>
                <div className="h-3 w-1/2 rounded bg-slate-200"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="group rounded-[24px] border border-slate-200/70 bg-accent-blue-bg p-6 shadow-[0_15px_40px_-35px_rgba(15,23,42,0.5)] transition-all duration-300 hover:shadow-[0_20px_50px_-25px_rgba(15,23,42,0.25)]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 shadow-lg">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
              Events
            </h2>
            <p className="text-sm text-slate-500">Manage and track your events</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCreateEvent}
          className="group flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:bg-purple-700 hover:shadow-xl hover:scale-105"
        >
          <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
          Create New Event
        </button>
      </div>

      {myEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-200">
            <Calendar className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-slate-600">No events yet</h3>
          <p className="mb-6 text-sm text-slate-500 max-w-sm">
            Create your first event to start selling tickets and managing bookings
          </p>
          <button
            type="button"
            onClick={onCreateEvent}
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:bg-purple-700 hover:shadow-xl"
          >
            <Plus className="h-4 w-4" />
            Create Your First Event
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
          {myEvents.map((eventItem) => {
            const soldCount = eventItem.initialTickets - eventItem.ticketsAvailable;
            const earnedAmount = soldCount * eventItem.price;
            const sellThrough = eventItem.initialTickets
              ? (soldCount / eventItem.initialTickets) * 100
              : 0;
            const isHovered = hoveredEventId === eventItem.id;
            
            return (
              <article
                key={eventItem.id}
                className={`group/event overflow-hidden rounded-2xl border transition-all duration-300 ${
                  isHovered
                    ? "border-purple-200 bg-purple-50/50 shadow-2xl scale-[1.02]"
                    : "border-slate-200 bg-slate-50/80 hover:border-purple-100 shadow-lg hover:shadow-xl"
                }`}
                onMouseEnter={() => setHoveredEventId(eventItem.id)}
                onMouseLeave={() => setHoveredEventId(null)}
              >
                {/* Event Image */}
                {eventItem.imageUrl?.trim() ? (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={eventItem.imageUrl.trim()}
                      alt={eventItem.title}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-300 group-hover/event:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover/event:bg-black/10" />
                    
                    {/* Status Badge */}
                    <div className="absolute right-3 top-3">
                      <div className={`rounded-full px-3 py-1 text-xs font-bold text-white shadow-lg backdrop-blur-sm ${
                        eventItem.ticketsAvailable === 0 ? 'bg-red-500' :
                        sellThrough >= 80 ? 'bg-green-500' :
                        sellThrough >= 50 ? 'bg-orange-500' : 'bg-blue-500'
                      }`}>
                        {eventItem.ticketsAvailable === 0 ? 'SOLD OUT' :
                         sellThrough >= 80 ? 'HOT' :
                         sellThrough >= 50 ? 'SELLING' : 'AVAILABLE'
                        }
                      </div>
                    </div>
                    
                    {/* Quick Stats Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-3 transform translate-y-full transition-transform duration-300 group-hover/event:translate-y-0">
                      <div className="flex items-center justify-between text-white text-xs">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{soldCount} sold</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span>${earnedAmount.toFixed(0)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">{sellThrough.toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative h-48 bg-slate-200 flex items-center justify-center">
                    <div className="text-center">
                      <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">No image</p>
                    </div>
                  </div>
                )}

                {/* Event Content */}
                <div className="p-5">
                  {/* Title & Location */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1 group-hover/event:text-purple-900 transition-colors">
                      {eventItem.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                      {eventItem.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin className="h-3 w-3 text-purple-500" />
                      <span className="font-medium uppercase tracking-wide">{eventItem.location}</span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-3 shadow-sm transition-all duration-200 hover:border-green-200 hover:bg-green-50">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-xs text-slate-500">Price</p>
                        <p className="font-bold text-slate-900">${eventItem.price.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-3 shadow-sm transition-all duration-200 hover:border-blue-200 hover:bg-blue-50">
                      <Ticket className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-xs text-slate-500">Available</p>
                        <p className="font-bold text-slate-900">{eventItem.ticketsAvailable}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-3 shadow-sm transition-all duration-200 hover:border-orange-200 hover:bg-orange-50">
                      <Users className="h-4 w-4 text-orange-600" />
                      <div>
                        <p className="text-xs text-slate-500">Sold</p>
                        <p className="font-bold text-slate-900">{soldCount}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-3 shadow-sm transition-all duration-200 hover:border-purple-200 hover:bg-purple-50">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      <div>
                        <p className="text-xs text-slate-500">Revenue</p>
                        <p className="font-bold text-slate-900">${earnedAmount.toFixed(0)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <BarChart3 className="h-3 w-3 text-slate-700" />
                        <span className="font-medium">Sell-through Rate</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-slate-900">{sellThrough.toFixed(1)}%</span>
                        {sellThrough >= 80 && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
                      </div>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                          sellThrough >= 80 ? 'bg-green-500' :
                          sellThrough >= 50 ? 'bg-orange-500' :
                          'bg-slate-900'
                        }`}
                        style={{ width: `${Math.min(100, sellThrough)}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onUpdate(eventItem)}
                      className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-amber-600 hover:shadow-lg hover:scale-105"
                    >
                      <Edit className="h-4 w-4 transition-transform group-hover:scale-110" />
                      Update
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(eventItem.id)}
                      className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-red-600 hover:shadow-lg hover:scale-105"
                    >
                      <Trash2 className="h-4 w-4 transition-transform group-hover:scale-110" />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
