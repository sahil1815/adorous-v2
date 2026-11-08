'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useOrders } from '@/context/OrdersContext';
import { useReviews } from '@/context/ReviewsContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminQuickSearchModal from '@/components/admin/AdminQuickSearchModal';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, adminUser, logout, isLoading } = useAdminAuth();
  const { orders } = useOrders();
  const { reviews } = useReviews();

  const isLoginPage = pathname === '/admin/login';

  // Responsive Navigation State
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Restore sidebar collapse preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('adorous_admin_sidebar_collapsed');
      if (saved !== null) {
        setIsSidebarCollapsed(saved === 'true');
      }
    } catch {
      // LocalStorage access may fail in restricted environments
    }
  }, []);

  const handleToggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('adorous_admin_sidebar_collapsed', String(next));
      } catch {
        // Safe ignore
      }
      return next;
    });
  };

  // Close mobile nav on route change
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  // Global keyboard shortcut for Command Bar (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Protect all /admin routes
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      router.replace('/admin/login');
    }
  }, [isAuthenticated, isLoading, isLoginPage, router]);

  // If on login page, just render the login view without admin shell
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
    <div className="min-h-screen bg-[#0E0E0E] text-paper flex admin-theme">
      {/* Collapsible Domain Sidebar */}
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebarCollapse}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
        pendingOrdersCount={pendingCount}
        pendingReviewsCount={pendingReviewCount}
        adminUser={adminUser}
        onLogout={logout}
      />

      {/* Main Viewport Container */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          isSidebarCollapsed ? 'md:pl-[70px]' : 'md:pl-64'
        }`}
      >
        {/* Top Executive Header Bar */}
        <AdminHeader
          onOpenMobileNav={() => setMobileNavOpen(true)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebarCollapse={handleToggleSidebarCollapse}
          onOpenSearch={() => setIsSearchModalOpen(true)}
          pendingOrdersCount={pendingCount}
          adminUser={adminUser}
        />

        {/* Page Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>
      </div>

      {/* Global Command & Search Modal (Cmd+K) */}
      <AdminQuickSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </div>
  );
}
