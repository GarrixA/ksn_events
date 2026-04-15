"use client";

import Image from "next/image";

export function DashboardSidebarSkeleton() {
  return (
    <aside className="flex h-full min-h-[760px] flex-col rounded-[28px] border border-slate-700/70 bg-slate-800 p-6 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.3)]">
      {/* Logo Section with KSN Logo */}
      <div className="flex items-center gap-3 border-b border-slate-200/70 pb-6 mb-2">
        <div className="flex-1">
          <div className="relative h-7 w-24 mb-1 opacity-60">
            <Image 
              src="/KSN_LOGO.png" 
              alt="KSN logo" 
              fill
              priority 
              className="object-contain opacity-80"
            />
          </div>
          <div className="h-3 w-32 bg-slate-100 rounded animate-pulse" />
        </div>
      </div>

      {/* Navigation Section Skeleton */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-4 mt-2">
          <div className="h-4 w-4 bg-slate-200 rounded animate-pulse" />
          <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
        </div>
        
        <nav className="space-y-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3"
            >
              <div className="h-8 w-8 bg-slate-200 rounded-lg animate-pulse" />
              <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Actions Skeleton */}
      <div className="space-y-2 border-t border-slate-200/70 pt-4 mt-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex w-full items-center gap-3 rounded-xl px-4 py-3">
            <div className="h-8 w-8 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </aside>
  );
}

export function DashboardTopbarSkeleton() {
  return (
    <header className="rounded-[24px] border border-slate-700/70 bg-slate-800 p-5 shadow-[0_15px_40px_-34px_rgba(0,0,0,0.6)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Search Bar Skeleton */}
        <div className="relative w-full max-w-2xl">
          <div className="relative rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 bg-slate-200 rounded animate-pulse" />
              <div className="flex-1 h-4 bg-slate-200 rounded animate-pulse" />
              <div className="h-6 w-8 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Right Side Actions Skeleton */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Action Buttons Skeleton */}
          <div className="h-11 w-11 bg-slate-200 rounded-full animate-pulse" />
          <div className="h-11 w-11 bg-slate-200 rounded-full animate-pulse" />
          
          {/* User Profile Skeleton */}
          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50/70 px-3 py-2">
            <div className="h-9 w-9 bg-slate-200 rounded-full animate-pulse" />
            <div className="hidden sm:block">
              <div className="h-4 w-16 bg-slate-200 rounded animate-pulse mb-1" />
              <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="h-4 w-4 bg-slate-200 rounded animate-pulse" />
          </div>

          {/* Home Button Skeleton */}
          <div className="h-10 w-20 bg-slate-200 rounded-xl animate-pulse" />
        </div>
      </div>
    </header>
  );
}

export function DashboardLoadingScreen() {
  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="relative h-20 w-40 animate-pulse">
            <Image
              src="/KSN_LOGO.png"
              alt="KSN Logo"
              fill
              priority
              className="object-contain opacity-95"
            />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-3 w-32 bg-slate-300 rounded-full mx-auto animate-pulse" />
          <div className="text-sm text-slate-300 font-medium">Loading Dashboard...</div>
        </div>
      </div>
    </main>
  );
}

export function DashboardOverviewSkeleton() {
  return (
    <section className="space-y-6 rounded-[24px] border border-slate-700/60 bg-slate-800 p-6 shadow-[0_16px_45px_-35px_rgba(0,0,0,0.6)]">
      {/* Dashboard Header with KSN Logo */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900/80">
          <div className="relative h-6 w-6 opacity-80">
            <Image 
              src="/KSN_LOGO.png" 
              alt="KSN logo" 
              fill
              className="object-contain brightness-0 invert opacity-90"
            />
          </div>
        </div>
        <div>
          <div className="h-8 w-32 bg-slate-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-64 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <article key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-10 w-10 bg-slate-200 rounded-xl animate-pulse" />
                  <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                </div>
                <div className="h-8 w-16 bg-slate-200 rounded animate-pulse mb-2" />
                <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
              </div>
              <div className="flex items-center gap-1">
                <div className="h-4 w-4 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-8 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="mt-4">
              <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-slate-200 rounded-full animate-pulse" />
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Analytics and Top Customers Skeleton */}
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        {/* Analytics Overview Skeleton */}
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-slate-200 rounded-xl animate-pulse" />
              <div>
                <div className="h-6 w-32 bg-slate-200 rounded animate-pulse mb-1" />
                <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-6 w-12 bg-slate-200 rounded-full animate-pulse" />
          </div>
          
          <div className="space-y-6 rounded-xl border border-slate-200 bg-slate-50/50 p-5">
            {/* Progress bars */}
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i}>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-slate-200 rounded animate-pulse" />
                    <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                  </div>
                  <div className="h-5 w-12 bg-slate-200 rounded animate-pulse" />
                </div>
                <div className="h-3 w-full bg-slate-200 rounded-full animate-pulse" />
              </div>
            ))}
            
            {/* Quick Stats Grid */}
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <div className="h-4 w-4 bg-slate-200 rounded animate-pulse" />
                  <div>
                    <div className="h-3 w-16 bg-slate-200 rounded animate-pulse mb-1" />
                    <div className="h-4 w-8 bg-slate-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>

        {/* Top Customers Skeleton */}
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-slate-200 rounded-xl animate-pulse" />
              <div>
                <div className="h-5 w-28 bg-slate-200 rounded animate-pulse mb-1" />
                <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-6 w-6 bg-slate-200 rounded-full animate-pulse" />
          </div>
          
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl p-3">
                <div className="h-12 w-12 bg-slate-200 rounded-full animate-pulse" />
                <div className="flex-1 min-w-0">
                  <div className="h-4 w-20 bg-slate-200 rounded animate-pulse mb-1" />
                  <div className="h-3 w-32 bg-slate-200 rounded animate-pulse mb-1" />
                  <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      {/* Recent Sales Table Skeleton */}
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-slate-200 rounded-xl animate-pulse" />
            <div>
              <div className="h-6 w-32 bg-slate-200 rounded animate-pulse mb-1" />
              <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="h-6 w-20 bg-slate-200 rounded-full animate-pulse" />
        </div>
        
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <th key={i} className="px-4 py-3">
                      <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-slate-200 rounded-full animate-pulse" />
                        <div>
                          <div className="h-4 w-20 bg-slate-200 rounded animate-pulse mb-1" />
                          <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-6 w-6 bg-slate-200 rounded animate-pulse" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </article>
    </section>
  );
}