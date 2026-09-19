'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileStickyBar from '@/components/layout/MobileStickyBar';
import CartDrawer from '@/components/cart/CartDrawer';
import WishlistDrawer from '@/components/wishlist/WishlistDrawer';
import NavigationProgress from '@/components/layout/NavigationProgress';

export default function StorefrontLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    return <main className="flex-1 min-h-screen">{children}</main>;
  }

  return (
    <>
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>
      <AnnouncementBar />
      <Header />
      <main className="flex-1 w-full max-w-full overflow-x-hidden">{children}</main>
      <Footer />
      <MobileStickyBar />
      <CartDrawer />
      <WishlistDrawer />
    </>
  );
}
