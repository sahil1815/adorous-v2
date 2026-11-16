'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  ExternalLink,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { ADMIN_NAV_SECTIONS, AdminNavItem } from './adminNavConfig';

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  pendingOrdersCount: number;
  pendingReviewsCount: number;
  adminUser?: { username: string; role?: string } | null;
  onLogout: () => void;
}

export default function AdminSidebar({
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  pendingOrdersCount,
  pendingReviewsCount,
  adminUser,
  onLogout,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const isItemActive = (item: AdminNavItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  const renderBadge = (badgeKey?: 'pendingOrders' | 'pendingReviews', isActive?: boolean) => {
    if (!badgeKey) return null;
    const count = badgeKey === 'pendingOrders' ? pendingOrdersCount : pendingReviewsCount;
    if (count <= 0) return null;

    return (
      <span
        className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold leading-none transition-colors ${
          isActive
            ? 'bg-ink text-gold'
            : badgeKey === 'pendingOrders'
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            : 'bg-gold/20 text-gold-light border border-gold/40'
        }`}
      >
        {count}
      </span>
    );
  };

  const navContent = (
    <div className="flex flex-col h-full bg-[#111111] text-paper select-none border-r border-gold/20">
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 shrink-0 bg-[#141414]">
        <Link
          href="/admin"
          onClick={onCloseMobile}
          className="flex items-center space-x-3 overflow-hidden group"
          title="Adorous Atelier Admin Dashboard"
        >
          <div className="w-9 h-9 rounded-full overflow-hidden border border-gold/50 shrink-0 bg-black p-0.5 shadow-sm group-hover:border-gold transition-colors">
            <Image
              src="/images/logo/logo-monogram.png"
              alt="Adorous Monogram"
              width={36}
              height={36}
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          {(!isCollapsed || mobileOpen) && (
            <div className="min-w-0 transition-opacity duration-200">
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-sm tracking-[0.18em] uppercase text-gold leading-none truncate">
                  Adorous
                </span>
                <span className="bg-gold/15 text-gold text-[8px] uppercase px-1.5 py-0.5 rounded-xs font-bold border border-gold/30 tracking-wider shrink-0">
                  Admin
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mt-1 truncate">
                Operations Desk
              </span>
            </div>
          )}
        </Link>

        {/* Desktop Collapse / Mobile Close Buttons */}
        <div className="flex items-center">
          {/* Mobile close button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-zinc-400 hover:text-white rounded-xs hover:bg-white/5 transition-colors"
            aria-label="Close Navigation"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop collapse toggle */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 text-zinc-400 hover:text-gold rounded-xs hover:bg-white/5 transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gold" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Domain Navigation Body */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-5 scrollbar-thin">
        {ADMIN_NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1">
            {(!isCollapsed || mobileOpen) && (
              <div className="px-2.5 pb-1 text-[10px] uppercase font-bold tracking-[0.12em] text-zinc-500">
                {section.title}
              </div>
            )}

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isItemActive(item);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    title={item.title}
                    className={`relative flex items-center gap-2.5 px-2.5 py-2 rounded-xs text-xs transition-all group ${
                      active
                        ? 'bg-gold text-ink font-bold shadow-sm'
                        : 'text-zinc-300 hover:text-white hover:bg-white/5 font-medium'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        active
                          ? 'text-ink'
                          : 'text-zinc-400 group-hover:text-gold'
                      }`}
                    />

                    {(!isCollapsed || mobileOpen) && (
                      <span className="truncate flex-1 tracking-tight">
                        {item.title}
                      </span>
                    )}

                    {/* Badge */}
                    {(!isCollapsed || mobileOpen) &&
                      renderBadge(item.badgeKey, active)}

                    {/* Dot Indicator for collapsed mode when there's an active badge */}
                    {isCollapsed && !mobileOpen && item.badgeKey && (
                      <>
                        {item.badgeKey === 'pendingOrders' && pendingOrdersCount > 0 && (
                          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#111]" />
                        )}
                        {item.badgeKey === 'pendingReviews' && pendingReviewsCount > 0 && (
                          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-gold ring-2 ring-[#111]" />
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-white/10 space-y-2 bg-[#0E0E0E] shrink-0">
        {/* Storefront Link */}
        <Link
          href="/"
          target="_blank"
          className="w-full flex items-center justify-between px-2.5 py-2 rounded-xs bg-[#1A1A1A] hover:bg-[#222222] border border-gold/20 text-gold-light text-xs font-semibold transition-colors group"
          title="Open customer storefront in a new tab"
        >
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="w-4 h-4 text-gold shrink-0" />
            {(!isCollapsed || mobileOpen) && (
              <span className="truncate text-[11px]">View Storefront</span>
            )}
          </div>
          {(!isCollapsed || mobileOpen) && (
            <ExternalLink className="w-3.5 h-3.5 text-gold/70 group-hover:text-gold shrink-0" />
          )}
        </Link>

        {/* Staff User & Logout Strip */}
        <div className="flex items-center justify-between pt-1">
          {(!isCollapsed || mobileOpen) && (
            <div className="min-w-0 pr-2">
              <span className="text-xs font-bold text-white block truncate">
                {adminUser?.username || 'Staff'}
              </span>
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold block truncate">
                {adminUser?.role || 'Atelier Director'}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={onLogout}
            className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-800/40 rounded-xs transition-colors shrink-0"
            title="Log Out of Admin Terminal"
            aria-label="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col shrink-0 fixed top-0 bottom-0 left-0 z-40 transition-all duration-200 ${
          isCollapsed ? 'w-[70px]' : 'w-64'
        }`}
      >
        {navContent}
      </aside>

      {/* Mobile Drawer (Overlay backdrop + Off-canvas panel) */}
      {mobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 md:hidden bg-black/80 backdrop-blur-xs flex"
          onClick={onCloseMobile}
        >
          <div
            className="w-72 max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
