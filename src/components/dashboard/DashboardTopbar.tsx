"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  X,
  Menu,
  Search, 
  MessageCircle, 
  Bell, 
  Home, 
  Plus, 
  ChevronDown,
  User,
  Settings,
  Crown,
  Zap
} from "lucide-react";

type DashboardView = "dashboard" | "events" | "tickets" | "manageTickets";

type DashboardTopbarProps = {
  activeView: DashboardView;
  userEmail: string | null;
  onOpenCreateEvent: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen?: boolean;
};

export function DashboardTopbar({
  activeView,
  userEmail,
  onOpenCreateEvent,
  onToggleSidebar,
  isSidebarOpen = false,
}: DashboardTopbarProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const initials = (userEmail ?? "U").slice(0, 1).toUpperCase();
  const userName = userEmail?.split('@')[0] || "User";

  return (
    <header className="card min-w-0 rounded-[24px] p-4 transition-all duration-300 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="flex w-full max-w-2xl items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-theme-secondary bg-theme-tertiary text-theme-secondary transition-all duration-200 hover:bg-theme-quaternary xl:hidden"
            aria-label={isSidebarOpen ? "Close sidebar menu" : "Open sidebar menu"}
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className={`relative w-full transition-all duration-300 ${
            searchFocused ? "transform scale-[1.02]" : ""
          }`}>
          <div className={`input-field relative px-4 py-3 transition-all duration-300 ${
            searchFocused 
              ? "shadow-lg" 
              : ""
          }`}>
            <div className="flex items-center gap-3">
              <Search className={`h-4 w-4 transition-colors duration-200 ${
                searchFocused ? "text-theme-primary" : "text-theme-tertiary"
              }`} />
              <input
                type="text"
                placeholder="Search events, tickets, customers..."
                className="flex-1 bg-transparent text-sm text-theme-primary placeholder:text-theme-tertiary focus:outline-none"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              <kbd className={`hidden rounded bg-theme-quaternary px-2 py-1 text-xs text-theme-tertiary transition-all duration-200 sm:inline-block ${
                searchFocused ? "bg-theme-tertiary text-theme-primary" : ""
              }`}>
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:gap-3">
          {/* Messages Button */}
          <button
            type="button"
            className="group relative flex h-11 w-11 items-center justify-center rounded-full border-theme-secondary bg-theme-tertiary text-theme-tertiary transition-all duration-200 hover:shadow-lg hover:scale-110"
            style={{
              // Hover styles are handled by onMouseEnter/onMouseLeave
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-blue)';
              e.currentTarget.style.backgroundColor = 'var(--accent-blue-bg)';
              e.currentTarget.style.color = 'var(--accent-blue)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-secondary)';
              e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
              e.currentTarget.style.color = 'var(--text-tertiary)';
            }}
            aria-label="Messages"
          >
            <MessageCircle className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-theme-primary" style={{ backgroundColor: 'var(--accent-blue)' }}>
              2
            </span>
          </button>

          {/* Notifications Button */}
          <button
            type="button"
            className="group relative flex h-11 w-11 items-center justify-center rounded-full border-theme-secondary bg-theme-tertiary text-theme-tertiary transition-all duration-200 hover:shadow-lg hover:scale-110"
            style={{
              // Hover styles are handled by onMouseEnter/onMouseLeave
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-yellow)';
              e.currentTarget.style.backgroundColor = 'rgba(234, 179, 8, 0.1)';
              e.currentTarget.style.color = 'var(--accent-yellow)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-secondary)';
              e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
              e.currentTarget.style.color = 'var(--text-tertiary)';
            }}
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-12" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-theme-primary animate-pulse" style={{ backgroundColor: 'var(--accent-yellow)' }}>
              5
            </span>
          </button>

          {/* User Profile */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="group flex items-center gap-3 rounded-full border border-slate-600 bg-slate-700/70 px-3 py-2 transition-all duration-200 hover:border-slate-500 hover:bg-slate-700 hover:shadow-lg"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white shadow-md transition-transform duration-200 group-hover:scale-110">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <div className="flex items-center gap-1">
                  <p className="text-sm font-semibold text-slate-300 transition-colors group-hover:text-white">
                    {userName}
                  </p>
                  <Crown className="h-3 w-3 text-yellow-500" />
                </div>
                <p className="text-xs text-slate-400">Premium Account</p>
              </div>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-all duration-200 group-hover:text-slate-600 ${
                showUserMenu ? "rotate-180" : ""
              }`} />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-600 bg-slate-800 p-2 shadow-xl animate-in slide-in-from-top-2 duration-200">
                <div className="border-b border-slate-700 pb-3 mb-2">
                  <p className="font-semibold text-white px-3 py-2">{userEmail}</p>
                  <p className="text-xs text-slate-400 px-3">Premium Account</p>
                </div>
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-700">
                  <User className="h-4 w-4" />
                  Profile Settings
                </button>
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-700">
                  <Settings className="h-4 w-4" />
                  Account Settings
                </button>
              </div>
            )}
          </div>

          {/* Home Button */}
          <Link
            href="/"
            className="group flex items-center gap-2 rounded-xl border-theme-secondary bg-theme-tertiary px-4 py-2.5 text-sm font-medium text-theme-secondary transition-all duration-200 hover:border-theme-tertiary hover:bg-theme-quaternary hover:shadow-md hover:scale-105"
          >
            <Home className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
            <span className="hidden sm:inline">Home</span>
          </Link>

          {/* Create Event Button (conditionally shown) */}
          {activeView === "events" && (
            <button
              type="button"
              onClick={onOpenCreateEvent}
              className="group flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-theme-primary shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
              style={{ 
                backgroundColor: 'var(--accent-purple)'
                // Hover styles are handled by onMouseEnter/onMouseLeave
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = 'brightness(0.9)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = 'brightness(1)';
              }}
            >
              <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
              <span className="hidden sm:inline">Create Event</span>
              <Zap className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}