"use client";

import Image from "next/image";

export function LandingPageEmpty() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="relative h-16 w-32 animate-pulse">
            <Image
              src="/KSN_LOGO.png"
              alt="KSN Logo"
              fill
              priority
              className="object-contain opacity-90"
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-2 w-24 bg-slate-300 rounded-full mx-auto animate-pulse" />
          <div className="text-sm text-slate-500 font-medium">Loading...</div>
        </div>
      </div>
    </main>
  );
}