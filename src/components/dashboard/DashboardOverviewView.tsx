"use client";

import { useState } from "react";
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  BarChart3, 
  Activity,
  Crown,
  ChevronUp,
  ArrowRight,
  Star,
  Eye,
  Clock,
  Mail,
  Ticket
} from "lucide-react";
import { AnalyticsSummary, MetricCard, PurchaseItem, TopCustomer } from "@/components/dashboard/dashboardTypes";

type DashboardOverviewViewProps = {
  metricCards: MetricCard[];
  analytics: AnalyticsSummary;
  topCustomers: TopCustomer[];
  purchasesLoading: boolean;
  recentSales: PurchaseItem[];
};

const metricIcons = {
  "Total Revenue": { icon: DollarSign, color: "text-accent-green", bg: "bg-accent-green-light" },
  "Events Created": { icon: Calendar, color: "text-accent-blue", bg: "bg-accent-blue-light" },
  "Tickets Sold": { icon: Ticket, color: "text-accent-purple", bg: "bg-accent-purple-light" },
  "Unique Customers": { icon: Users, color: "text-accent-orange", bg: "bg-accent-orange-light" },
};

export function DashboardOverviewView({
  metricCards,
  analytics,
  topCustomers,
  purchasesLoading,
  recentSales,
}: DashboardOverviewViewProps) {
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);

  return (
    <section className="card min-w-0 space-y-6 rounded-[24px] p-4 transition-all duration-300 sm:p-6">
      {/* Dashboard Header */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 shadow-lg">
          <BarChart3 className="h-7 w-7 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white sm:text-4xl">
            Dashboard
            
          </h1>
          <p className="text-slate-300">Welcome back! Here's what's happening with your events.</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => {
          const metricConfig = metricIcons[card.title as keyof typeof metricIcons];
          const IconComponent = metricConfig?.icon || Activity;
          const isHovered = hoveredMetric === card.title;
          
          return (
            <article 
              key={card.title} 
              className={`card group relative overflow-hidden rounded-2xl p-5 shadow-md transition-all duration-300 ${
                isHovered 
                  ? "shadow-xl scale-105" 
                  : "hover:shadow-lg"
              }`}
              onMouseEnter={() => setHoveredMetric(card.title)}
              onMouseLeave={() => setHoveredMetric(null)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${metricConfig?.bg || "bg-slate-100"} transition-transform duration-300 group-hover:scale-110`}>
                      <IconComponent className={`h-5 w-5 ${metricConfig?.color || "text-slate-600"}`} />
                    </div>
                    <p className="text-sm font-semibold text-slate-300">{card.title}</p>
                  </div>
                  
                  <p className="text-3xl font-bold tracking-tight text-white mb-2 transition-colors group-hover:text-slate-100">
                    {card.value}
                  </p>
                  <p className="text-xs text-slate-400">{card.subtitle}</p>
                </div>
                
                <div className="flex items-center gap-1">
                  <ChevronUp className="h-4 w-4 text-green-500" />
                  <span className="text-xs font-medium text-accent-green">+12%</span>
                </div>
              </div>
              
              {/* Progress indicator */}
              <div className="mt-4">
                <div className="h-1 w-full overflow-hidden rounded-full bg-slate-700">
                  <div 
                    className={`h-full transition-all duration-700 ease-out ${
                      card.title === "Total Revenue" ? "bg-accent-green w-3/4" :
                      card.title === "Events Created" ? "bg-accent-blue w-2/3" :
                      card.title === "Tickets Sold" ? "bg-accent-purple w-4/5" :
                      "bg-accent-orange w-3/5"
                    }`}
                  />
                </div>
              </div>
              
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-slate-900/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </article>
          );
        })}
      </div>

      {/* Analytics and Top Customers */}
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        {/* Analytics Overview */}
        <article className="card group min-w-0 rounded-2xl p-6 shadow-md transition-all duration-300">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-blue shadow-md">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Live Analytics</h2>
                <p className="text-sm text-slate-300">Real-time ticket performance</p>
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-accent-green-light px-3 py-1">
              <div className="h-2 w-2 rounded-full bg-accent-green animate-pulse" />
              <span className="text-xs font-medium text-accent-green">Live</span>
            </div>
          </div>
          
          <div className="space-y-6 rounded-xl border-theme-primary bg-theme-tertiary p-5">
            {/* Sell-through Rate */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-slate-800" />
                  <span className="text-sm font-medium text-slate-300">Sell-through Rate</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white">{analytics.sellThroughRate.toFixed(1)}%</span>
                  {analytics.sellThroughRate >= 70 && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                </div>
              </div>
              <div className="h-3 rounded-full bg-slate-600 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${
                    analytics.sellThroughRate >= 80 ? 'bg-accent-green' :
                    analytics.sellThroughRate >= 50 ? 'bg-accent-orange' : 'bg-slate-900'
                  }`}
                  style={{ width: `${Math.min(100, analytics.sellThroughRate)}%` }}
                />
              </div>
            </div>
            
            {/* Inventory Remaining */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium text-slate-300">Inventory Remaining</span>
                </div>
                <span className="text-lg font-bold text-white">
                  {analytics.totalListed === 0
                    ? "0%"
                    : `${((analytics.remainingTickets / analytics.totalListed) * 100).toFixed(1)}%`}
                </span>
              </div>
              <div className="h-3 rounded-full bg-slate-600 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-1000 ease-out"
                  style={{
                    width:
                      analytics.totalListed === 0
                        ? "0%"
                        : `${Math.min(100, (analytics.remainingTickets / analytics.totalListed) * 100)}%`,
                  }}
                />
              </div>
            </div>
            
            {/* Quick Stats Grid */}
            <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="group/stat min-w-0 flex items-center gap-3 rounded-xl border-theme-secondary bg-theme-tertiary px-4 py-3 shadow-sm transition-all duration-200 hover:border-purple-200 hover:bg-purple-50">
                <Ticket className="h-4 w-4 text-accent-purple" />
                <div>
                  <p className="text-xs text-slate-400">Tickets Listed</p>
                  <p className="font-bold text-white">{analytics.totalListed}</p>
                </div>
              </div>
              
              <div className="group/stat min-w-0 flex items-center gap-3 rounded-xl border-theme-secondary bg-theme-tertiary px-4 py-3 shadow-sm transition-all duration-200 hover:border-purple-200 hover:bg-purple-50">
                <TrendingUp className="h-4 w-4 text-accent-purple" />
                <div>
                  <p className="text-xs text-slate-400">Tickets Sold</p>
                  <p className="font-bold text-white">{analytics.soldTickets}</p>
                </div>
              </div>
              
              <div className="group/stat min-w-0 flex items-center gap-3 rounded-xl border-theme-secondary bg-theme-tertiary px-4 py-3 shadow-sm transition-all duration-200 hover:border-blue-200 hover:bg-blue-50">
                <Calendar className="h-4 w-4 text-accent-blue" />
                <div>
                  <p className="text-xs text-slate-400">Active Events</p>
                  <p className="font-bold text-white">{analytics.totalEvents}</p>
                </div>
              </div>
              
              <div className="group/stat min-w-0 flex items-center gap-3 rounded-xl border-theme-secondary bg-theme-tertiary px-4 py-3 shadow-sm transition-all duration-200 hover:border-orange-200 hover:bg-orange-50">
                <Users className="h-4 w-4 text-accent-orange" />
                <div>
                  <p className="text-xs text-slate-400">Total Orders</p>
                  <p className="font-bold text-white">{analytics.totalOrders}</p>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Top Customers */}
        <article className="card group min-w-0 rounded-2xl p-6 shadow-md transition-all duration-300">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-orange shadow-md">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">Top Customers</h2>
                <p className="text-sm text-slate-300">Your best supporters</p>
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-accent-orange-light px-2 py-1">
              <span className="text-xs font-bold text-accent-orange">{topCustomers.length}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {purchasesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3 rounded-xl bg-slate-100 p-3">
                    <div className="h-12 w-12 rounded-full bg-slate-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-2/3 rounded bg-slate-200" />
                      <div className="h-2 w-full rounded bg-slate-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : topCustomers.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-700">
                  <Users className="h-8 w-8 text-slate-400" />
                </div>
                <p className="font-medium text-slate-300">No customers yet</p>
                <p className="text-sm text-slate-400">Customer purchases will appear here</p>
              </div>
            ) : (
              topCustomers.map((customer, index) => (
                <div
                  key={`${customer.name}-${customer.email}`}
                  className="group/customer flex items-center gap-3 rounded-xl p-3 transition-all duration-200 hover:bg-slate-700 hover:shadow-sm"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white shadow-md transition-transform duration-200 group-hover/customer:scale-110">
                      {customer.name
                        .split(" ")
                        .slice(0, 2)
                        .map((part) => part[0]?.toUpperCase() ?? "")
                        .join("")}
                    </div>
                    {index === 0 && (
                      <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400">
                        <Crown className="h-3 w-3 text-yellow-900" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white truncate">{customer.name}</p>
                      {index < 3 && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
                    </div>
                    <p className="text-xs text-slate-400 truncate">
                      {customer.orders} order{customer.orders !== 1 ? 's' : ''} • {customer.tickets} ticket{customer.tickets !== 1 ? 's' : ''}
                    </p>
                    <p className="text-sm font-bold text-accent-green">${customer.totalAmount.toFixed(2)}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 opacity-0 transition-all duration-200 group-hover/customer:opacity-100 group-hover/customer:translate-x-1" />
                </div>
              ))
            )}
          </div>
        </article>
      </div>

      {/* Recent Ticket Sales */}
      <article className="card group min-w-0 rounded-2xl p-6 shadow-md transition-all duration-300">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-green shadow-md">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Recent Sales</h2>
              <p className="text-sm text-slate-300">Latest ticket purchases</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-accent-green-light px-3 py-1">
            <div className="h-2 w-2 rounded-full bg-accent-green animate-pulse" />
            <span className="text-xs font-medium text-accent-green">Live Updates</span>
          </div>
        </div>
        
        {purchasesLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-4 rounded-xl bg-slate-50 p-4">
                <div className="h-10 w-10 rounded-full bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 rounded bg-slate-200" />
                  <div className="h-2 w-2/3 rounded bg-slate-200" />
                </div>
                <div className="h-6 w-16 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : recentSales.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-700">
              <TrendingUp className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="mb-2 font-semibold text-slate-300">No sales yet</h3>
            <p className="text-sm text-slate-400 max-w-sm">
              Once customers start purchasing tickets, their transactions will appear here
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border-theme-primary">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-theme-tertiary">
                  <tr className="text-left">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-300">
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-accent-orange" />
                        Customer
                      </div>
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-300">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-slate-400" />
                        Contact
                      </div>
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-300">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-slate-400" />
                        Date
                      </div>
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-accent-blue" />
                        Event
                      </div>
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-300">
                      <div className="flex items-center gap-2">
                        <Ticket className="h-3 w-3 text-accent-purple" />
                        Qty
                      </div>
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-300">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-3 w-3 text-accent-green" />
                        Amount
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-primary bg-theme-secondary">
                  {recentSales.map((sale, index) => (
                    <tr 
                      key={sale.id} 
                      className="group/row transition-all duration-200 hover:bg-theme-tertiary"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white shadow-sm transition-transform duration-200 group-hover/row:scale-110">
                            {sale.buyerFullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{sale.buyerFullName}</p>
                            <p className="text-xs text-slate-400">Customer</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-slate-300">{sale.buyerEmail || "No email"}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-slate-300">
                            {sale.createdAtMs 
                              ? new Date(sale.createdAtMs).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: '2-digit'
                                })
                              : "Unknown"
                            }
                          </p>
                          {sale.createdAtMs && Date.now() - sale.createdAtMs < 24 * 60 * 60 * 1000 && (
                            <span className="rounded-full bg-accent-green-light px-2 py-0.5 text-xs font-medium text-accent-green">
                              New
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-white truncate max-w-32">{sale.eventTitle}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <span className="flex h-6 w-6 items-center justify-center rounded bg-accent-purple-light text-xs font-bold text-accent-purple">
                            {sale.ticketsCount}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-accent-green">${sale.totalAmount.toFixed(2)}</span>
                          <ArrowRight className="h-3 w-3 text-slate-400 opacity-0 transition-all duration-200 group-hover/row:opacity-100 group-hover/row:translate-x-1" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </article>
    </section>
  );
}
