'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useOrders } from '@/context/OrdersContext';
import { useReviews } from '@/context/ReviewsContext';
import {
  Package,
  Layers,
  Truck,
  BarChart3,
  Tag,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Bell,
  RefreshCw,
  MessageSquare
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, adminUser, logout, isLoading } = useAdminAuth();
  const { orders } = useOrders();
  const { reviews } = useReviews();

  const isLoginPage = pathname === '/admin/login';

  // Protect all /admin routes
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      router.replace('/admin/login');
    }
  }, [isAuthenticated, isLoading, isLoginPage, router]);

  // If on login page, just render the login view
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading state
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0E0E0E] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-widest text-gold font-medium">
            Verifying Admin Security Clearance...
          </p>
        </div>
      </div>
    );
  }

  const pendingCount = orders.filter((o) => o.status === 'pending' || o.status === 'verified').length;
  const pendingReviewCount = reviews.filter((r) => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-paper flex flex-col font-sans">
      {/* Top Operations Header Bar */}
      <header className="bg-[#141414] border-b border-gold/25 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Left */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-gold/40 shrink-0 bg-black p-0.5">
              <Image
                src="/images/logo/logo-monogram.png"
                alt="Adorous Monogram"
                width={36}
                height={36}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif text-lg tracking-[0.16em] uppercase text-gold font-semibold leading-none">
                  Adorous Admin
                </span>
                <span className="bg-gold/20 text-gold-light text-[9px] uppercase px-1.5 py-0.5 rounded-xs font-semibold border border-gold/30">
                  Internal
                </span>
              </div>
              <span className="text-[10px] text-paper/50 uppercase tracking-widest block mt-0.5">
                Rajshahi Headquarters Desk
              </span>
            </div>
          </div>

          {/* Center Status indicator */}
          <div className="hidden md:flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-2 px-3 py-1 bg-[#1C1C1C] border border-white/10 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] text-emerald-300 font-medium">Adorous HQ Active</span>
            </div>
            {pendingCount > 0 && (
              <div className="flex items-center space-x-1.5 px-3 py-1 bg-amber-950/60 border border-amber-600/40 rounded-full text-amber-300 text-[11px]">
                <Bell className="w-3 h-3 text-amber-400" />
                <span>{pendingCount} Pending Dispatch</span>
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-3 text-xs">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#222222] hover:bg-[#2A2A2A] border border-gold/20 text-gold-light rounded-xs transition-colors text-[11px]"
              title="Open customer storefront in a new tab"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <div className="h-6 w-px bg-white/10 hidden sm:block" />

            <div className="flex items-center space-x-2">
              <div className="text-right hidden sm:block">
                <span className="text-[11px] font-semibold text-paper block">
                  {adminUser?.username}
                </span>
                <span className="text-[9px] text-gold-light/60 uppercase tracking-wider block">
                  {adminUser?.role || 'Director'}
                </span>
              </div>

              <button
                type="button"
                onClick={logout}
                className="p-2 bg-[#222222] hover:bg-red-950/60 hover:text-red-300 border border-white/10 hover:border-red-800/40 rounded-xs text-paper/70 transition-colors"
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-1 sm:space-x-2 overflow-x-auto text-xs py-2 border-t border-white/5 scrollbar-none">
          <Link
            href="/admin"
            className={`px-3 py-1.5 rounded-xs transition-colors flex items-center space-x-1.5 shrink-0 ${
              pathname === '/admin'
                ? 'bg-gold text-ink font-semibold shadow-sm'
                : 'text-paper/70 hover:text-gold hover:bg-[#1C1C1C]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Orders & COD Desk</span>
            {pendingCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                pathname === '/admin' ? 'bg-ink text-gold' : 'bg-gold/20 text-gold'
              }`}>
                {pendingCount}
              </span>
            )}
          </Link>

          <Link
            href="/admin/inventory"
            className={`px-3 py-1.5 rounded-xs transition-colors flex items-center space-x-1.5 shrink-0 ${
              pathname === '/admin/inventory'
                ? 'bg-gold text-ink font-semibold shadow-sm'
                : 'text-paper/70 hover:text-gold hover:bg-[#1C1C1C]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Inventory & Stock</span>
          </Link>

          <Link
            href="/admin/logistics"
            className={`px-3 py-1.5 rounded-xs transition-colors flex items-center space-x-1.5 shrink-0 ${
              pathname === '/admin/logistics'
                ? 'bg-gold text-ink font-semibold shadow-sm'
                : 'text-paper/70 hover:text-gold hover:bg-[#1C1C1C]'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Steadfast Manifest</span>
          </Link>

          <Link
            href="/admin/analytics"
            className={`px-3 py-1.5 rounded-xs transition-colors flex items-center space-x-1.5 shrink-0 ${
              pathname === '/admin/analytics'
                ? 'bg-gold text-ink font-semibold shadow-sm'
                : 'text-paper/70 hover:text-gold hover:bg-[#1C1C1C]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Cash Flow</span>
          </Link>

          <Link
            href="/admin/coupons"
            className={`px-3 py-1.5 rounded-xs transition-colors flex items-center space-x-1.5 shrink-0 ${
              pathname === '/admin/coupons'
                ? 'bg-gold text-ink font-semibold shadow-sm'
                : 'text-paper/70 hover:text-gold hover:bg-[#1C1C1C]'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Coupons & Promos</span>
          </Link>

          <Link
            href="/admin/reviews"
            className={`px-3 py-1.5 rounded-xs transition-colors flex items-center space-x-1.5 shrink-0 ${
              pathname === '/admin/reviews'
                ? 'bg-gold text-ink font-semibold shadow-sm'
                : 'text-paper/70 hover:text-gold hover:bg-[#1C1C1C]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Reviews</span>
            {pendingReviewCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                pathname === '/admin/reviews' ? 'bg-ink text-gold' : 'bg-gold/20 text-gold'
              }`}>
                {pendingReviewCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Main Operations Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
