"use client";

import { useState } from "react";
import { 
  Ticket, 
  Users, 
  DollarSign, 
  ChevronDown, 
  Calendar,
  MapPin,
  Mail,
  Phone,
  Clock,
  Sparkles,
  TrendingUp,
  Star
} from "lucide-react";
import { TicketGroup } from "@/components/dashboard/dashboardTypes";

type DashboardTicketsViewProps = {
  ticketsByEvent: TicketGroup[];
  loading: boolean;
};

export function DashboardTicketsView({ ticketsByEvent, loading }: DashboardTicketsViewProps) {
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);

  const toggle = (eventId: string) =>
    setExpandedEventId((prev) => (prev === eventId ? null : eventId));

  // Loading skeleton component
  if (loading) {
    return (
      <section className="rounded-[24px] border border-slate-200/70 bg-white p-6 shadow-[0_15px_40px_-35px_rgba(15,23,42,0.5)]">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900">
            <Ticket className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Booked Tickets</h2>
            <p className="text-sm text-slate-500">Open an event to view all booked ticket details.</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-slate-100 p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-32 rounded bg-slate-200"></div>
                  <div className="h-3 w-24 rounded bg-slate-200"></div>
                </div>
                <div className="h-6 w-6 rounded bg-slate-200"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="group rounded-[24px] border border-slate-200/70 bg-white p-6 shadow-[0_15px_40px_-35px_rgba(15,23,42,0.5)] transition-all duration-300 hover:shadow-[0_20px_50px_-25px_rgba(15,23,42,0.25)]">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 shadow-lg">
          <Ticket className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
            Booked Tickets
            <Sparkles className="h-5 w-5 text-slate-700" />
          </h2>
          <p className="text-sm text-slate-500">Open an event to view all booked ticket details.</p>
        </div>
      </div>

      {ticketsByEvent.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200">
            <Ticket className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-lg font-medium text-slate-600">No events found</p>
          <p className="text-sm text-slate-500">Create your first event to start selling tickets!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {ticketsByEvent.map(({ event, sales, soldCount, totalRevenue }) => {
            const isExpanded = expandedEventId === event.id;
            const isHovered = hoveredEventId === event.id;
            const sellThroughRate = event.initialTickets > 0 ? (soldCount / event.initialTickets) * 100 : 0;
            
            return (
              <article
                key={event.id}
                className={`group/card overflow-hidden rounded-2xl border transition-all duration-300 ${
                  isExpanded || isHovered
                    ? "border-slate-300 bg-slate-100 shadow-lg"
                    : "border-slate-200 bg-slate-50/80 hover:border-slate-300"
                }`}
                onMouseEnter={() => setHoveredEventId(event.id)}
                onMouseLeave={() => setHoveredEventId(null)}
              >
                <button
                  type="button"
                  onClick={() => toggle(event.id)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-all duration-200"
                >
                  {/* Event Info */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 shadow-md transition-transform duration-300 group-hover/card:scale-110">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="mb-1 text-lg font-bold text-slate-900 transition-colors duration-200 group-hover/card:text-black">
                        {event.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <MapPin className="h-3 w-3" />
                        <span className="font-medium uppercase tracking-wider">{event.location}</span>
                      </div>
                      
                      {/* Progress bar for sell-through rate */}
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              sellThroughRate >= 80 ? 'bg-green-500' :
                              sellThroughRate >= 50 ? 'bg-orange-500' :
                              'bg-slate-900'
                            }`}
                            style={{ width: `${Math.min(sellThroughRate, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-600">
                          {sellThroughRate.toFixed(0)}% sold
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4">
                    <div className="flex gap-3 text-right text-sm">
                      {/* Bookings */}
                      <div className="flex flex-col items-center rounded-lg bg-white/80 px-3 py-2 shadow-sm backdrop-blur-sm transition-all duration-200 group-hover/card:bg-white group-hover/card:shadow-md">
                        <div className="flex items-center gap-1 text-slate-600">
                          <Users className="h-4 w-4 text-slate-700" />
                          <span className="font-bold text-slate-900">{sales.length}</span>
                        </div>
                        <span className="text-xs text-slate-500">bookings</span>
                      </div>
                      
                      {/* Tickets */}
                      <div className="flex flex-col items-center rounded-lg bg-white/80 px-3 py-2 shadow-sm backdrop-blur-sm transition-all duration-200 group-hover/card:bg-white group-hover/card:shadow-md">
                        <div className="flex items-center gap-1 text-slate-600">
                          <Ticket className="h-4 w-4 text-purple-500" />
                          <span className="font-bold text-slate-900">{soldCount}</span>
                        </div>
                        <span className="text-xs text-slate-500">tickets</span>
                      </div>
                      
                      {/* Revenue */}
                      <div className="flex flex-col items-center rounded-lg bg-white/80 px-3 py-2 shadow-sm backdrop-blur-sm transition-all duration-200 group-hover/card:bg-white group-hover/card:shadow-md">
                        <div className="flex items-center gap-1 text-slate-600">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          <span className="font-bold text-slate-900">${totalRevenue.toFixed(0)}</span>
                        </div>
                        <span className="text-xs text-slate-500">revenue</span>
                      </div>
                    </div>
                    
                    {/* Expand Icon */}
                    <ChevronDown
                      className={`h-5 w-5 text-slate-400 transition-all duration-300 ${
                        isExpanded ? "rotate-180 text-slate-700" : "group-hover/card:text-slate-600"
                      }`}
                    />
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="animate-in slide-in-from-top-2 border-t border-slate-200 bg-white/90 backdrop-blur-sm duration-300">
                    {sales.length === 0 ? (
                      <div className="flex items-center justify-center py-8 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                            <Ticket className="h-6 w-6 text-slate-400" />
                          </div>
                          <p className="font-medium text-slate-600">No ticket bookings yet</p>
                          <p className="text-sm text-slate-500">Bookings will appear here once customers purchase tickets</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 p-5">
                        <div className="mb-4 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium text-slate-700">Recent Bookings</span>
                        </div>
                        
                        {sales.map((sale, index) => (
                          <div
                            key={sale.id}
                            className="group/sale relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md hover:bg-slate-50"
                            style={{ 
                              animationDelay: `${index * 50}ms`,
                            }}
                          >
                            {/* Customer Name & Badge */}
                            <div className="mb-3 flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white shadow-md">
                                  {sale.buyerFullName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900">{sale.buyerFullName}</p>
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span className="text-xs font-medium text-slate-500">Customer</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Purchase amount badge */}
                              <div className="rounded-full bg-green-600 px-3 py-1 text-sm font-bold text-white shadow-sm">
                                ${sale.totalAmount.toFixed(2)}
                              </div>
                            </div>
                            
                            {/* Contact & Purchase Info Grid */}
                            <div className="grid gap-3 text-sm sm:grid-cols-2">
                              <div className="flex items-center gap-2 text-slate-600">
                                <Mail className="h-4 w-4 text-slate-700" />
                                <span>{sale.buyerEmail || "No email"}</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-600">
                                <Phone className="h-4 w-4 text-green-500" />
                                <span>{sale.buyerPhone || "No phone"}</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-600">
                                <Ticket className="h-4 w-4 text-purple-500" />
                                <span className="font-semibold">{sale.ticketsCount} ticket{sale.ticketsCount !== 1 ? 's' : ''}</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-600">
                                <Clock className="h-4 w-4 text-orange-500" />
                                <span>
                                  {sale.createdAtMs 
                                    ? new Date(sale.createdAtMs).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })
                                    : "Unknown date"
                                  }
                                </span>
                              </div>
                            </div>
                            
                            {/* Hover effect overlay */}
                            <div className="absolute inset-0 bg-slate-900/5 opacity-0 transition-opacity duration-200 group-hover/sale:opacity-100" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
