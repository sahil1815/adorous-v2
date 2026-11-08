'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  Bell,
  ExternalLink,
  Search,
  ChevronRight,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Command,
} from 'lucide-react';
import { getBreadcrumbFromPathname } from './adminNavConfig';

interface AdminHeaderProps {
  onOpenMobileNav: () => void;
  isSidebarCollapsed: boolean;
  onToggleSidebarCollapse: () => void;
  onOpenSearch: () => void;
  pendingOrdersCount: number;
  adminUser?: { username: string; role?: string } | null;
}

export default function AdminHeader({
  onOpenMobileNav,
  isSidebarCollapsed,
  onToggleSidebarCollapse,
  onOpenSearch,
  pendingOrdersCount,
  adminUser,
}: AdminHeaderProps) {
  const pathname = usePathname();
  const breadcrumb = getBreadcrumbFromPathname(pathname);

  return (
    <header className="h-16 bg-[#141414] border-b border-gold/20 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none shadow-xs">
      {/* Left Area: Mobile Menu, Sidebar Toggle, & Breadcrumbs */}
      <div className="flex items-center space-x-3 min-w-0">
        {/* Mobile Hamburger Trigger */}
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="md:hidden p-2 text-zinc-300 hover:text-gold hover:bg-white/5 rounded-xs transition-colors shrink-0"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar Collapse Toggle */}
        <button
          type="button"
          onClick={onToggleSidebarCollapse}
          className="hidden md:flex p-2 text-zinc-400 hover:text-gold hover:bg-white/5 rounded-xs transition-colors shrink-0"
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-gold" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        <div className="h-5 w-px bg-white/10 hidden sm:block" />

        {/* Breadcrumb Trail */}
        <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs min-w-0">
          <Link
            href="/admin"
            className="text-zinc-400 hover:text-gold transition-colors font-medium shrink-0"
          >
            Admin
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
          <span className="text-zinc-400 hidden sm:inline truncate font-medium">
            {breadcrumb.sectionTitle}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600 hidden sm:inline shrink-0" />
          <span className="text-gold font-bold truncate">
            {breadcrumb.itemTitle}
          </span>
        </nav>
      </div>

      {/* Right Area: Search, Status, Storefront & Staff */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0 text-xs">
        {/* Global Quick Search Button (triggers Cmd+K modal) */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex items-center space-x-2 px-2.5 sm:px-3 py-1.5 bg-[#1C1C1C] hover:bg-[#252525] border border-white/10 hover:border-gold/40 text-zinc-400 hover:text-white rounded-xs transition-colors group cursor-pointer"
          title="Quick Search & Command Bar (Ctrl/Cmd + K)"
        >
          <Search className="w-3.5 h-3.5 text-gold group-hover:text-gold-light" />
          <span className="hidden md:inline text-[11px] font-medium text-zinc-300">
            Search or jump to...
          </span>
          <div className="hidden lg:flex items-center gap-0.5 px-1.5 py-0.2 rounded-xs bg-black/40 border border-white/10 text-[9px] font-mono text-zinc-400">
            <span>⌘K</span>
          </div>
        </button>

        {/* Real-Time Pulse Status (Desktop) */}
        <div className="hidden xl:flex items-center space-x-2 px-3 py-1 bg-[#1A1A1A] border border-white/10 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[11px] text-emerald-300 font-medium">HQ Active</span>
        </div>

        {/* Pending Orders Alert Chip */}
        {pendingOrdersCount > 0 && (
          <Link
            href="/admin?status=pending"
            className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-600/40 rounded-full text-amber-300 text-[11px] transition-colors"
            title={`${pendingOrdersCount} orders requiring verification or dispatch`}
          >
            <Bell className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="font-bold tabular-nums">{pendingOrdersCount}</span>
            <span className="hidden sm:inline font-medium">Pending</span>
          </Link>
        )}

        {/* View Storefront Link */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#1F1F1F] hover:bg-[#282828] border border-gold/25 text-gold-light rounded-xs transition-colors text-[11px] font-medium"
          title="Open live storefront in new tab"
        >
          <span>Storefront</span>
          <ExternalLink className="w-3 h-3 text-gold/80" />
        </Link>
      </div>
    </header>
  );
}
