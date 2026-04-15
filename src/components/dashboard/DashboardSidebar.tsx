"use client";

import Image from "next/image";
import { useState } from "react";
import { 
  LayoutDashboard, 
  Calendar, 
  Ticket, 
  Settings, 
  LogOut, 
  Sparkles,
  User,
  ChevronRight
} from "lucide-react";

type DashboardView = "dashboard" | "events" | "tickets";

type DashboardSidebarProps = {
  activeView: DashboardView;
  onSelectView: (view: DashboardView) => void;
  onLogout: () => void;
};

const items: Array<{ 
  id: DashboardView; 
  label: string; 
  icon: React.ComponentType<any>;
}> = [
  { 
    id: "dashboard", 
    label: "Dashboard", 
    icon: LayoutDashboard,
  },
  { 
    id: "events", 
    label: "Events", 
    icon: Calendar,
  },
  { 
    id: "tickets", 
    label: "Tickets", 
    icon: Ticket,
  },
];

export function DashboardSidebar({ activeView, onSelectView, onLogout }: DashboardSidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <aside className="card flex h-full min-h-[760px] flex-col rounded-[28px] p-6 transition-all duration-300">
      {/* Logo Section */}
      <div className="group flex items-center gap-3 border-b border-theme-primary pb-6 mb-2">
       
        <div className="flex-1">
          <Image 
            src="/ksn-logo.svg" 
            alt="KSN logo" 
            width={100} 
            height={28} 
            priority 
            className="transition-opacity group-hover:opacity-80"
          />
          <p className="text-xs text-theme-tertiary mt-1">Event Management</p>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-4 mt-2">
          <User className="h-4 w-4 text-theme-tertiary" />
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-theme-tertiary">
            Navigation
          </p>
        </div>
        
        <nav className="space-y-1">
          {items.map((item) => {
            const isActive = activeView === item.id;
            const isHovered = hoveredItem === item.id;
            const IconComponent = item.icon;
            
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(item.id)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`group/nav relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-theme-tertiary text-theme-primary shadow-md"
                    : "text-theme-secondary hover:bg-theme-quaternary hover:text-theme-primary"
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full" style={{ backgroundColor: 'var(--accent-primary)' }} />
                )}
                
                {/* Icon */}
                <div className={`relative flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
                  isActive 
                    ? "btn-primary shadow-lg" 
                    : "bg-theme-quaternary text-theme-secondary group-hover/nav:bg-theme-tertiary group-hover/nav:shadow-md"
                }`}>
                  <IconComponent className={`h-4 w-4 transition-transform duration-200 ${
                    isHovered ? "scale-110" : ""
                  }`} />
                </div>
                
                {/* Label */}
                <span className="flex-1 transition-transform duration-200 group-hover/nav:translate-x-1">
                  {item.label}
                </span>
                
                {/* Chevron for active item */}
                {isActive && (
                  <ChevronRight className="h-4 w-4 text-theme-primary transition-transform duration-200 group-hover/nav:translate-x-1" />
                )}
                
                {/* Hover effect overlay */}
                <div className={`absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200 ${
                  isHovered && !isActive ? "opacity-100" : ""
                }`} style={{ backgroundColor: isHovered && !isActive ? 'var(--hover-bg-light)' : 'transparent' }} />
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="space-y-2 border-t border-theme-primary pt-4 mt-4">
        <button
          type="button"
          className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium text-theme-secondary transition-all duration-200 hover:bg-theme-quaternary hover:text-theme-primary"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-theme-quaternary text-theme-tertiary transition-all duration-200 group-hover:bg-theme-tertiary group-hover:shadow-md group-hover:text-theme-primary">
            <Settings className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
          </div>
          <span className="flex-1 transition-transform duration-200 group-hover:translate-x-1">Settings</span>
        </button>
        
        <button
          type="button"
          onClick={onLogout}
          className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium transition-all duration-200"
          style={{ 
            color: 'var(--accent-red)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent-red-bg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 group-hover:shadow-md"
               style={{ 
                 backgroundColor: 'var(--accent-red-bg)',
                 color: 'var(--accent-red)'
               }}>
            <LogOut className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </div>
          <span className="flex-1 transition-transform duration-200 group-hover:translate-x-1">Logout</span>
        </button>
      </div>
    </aside>
  );
}
