'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileStickyBar from '@/components/layout/MobileStickyBar';
import NavigationProgress from '@/components/layout/NavigationProgress';
import OfferCountdownBadge from '@/components/layout/OfferCountdownBadge';

const CartDrawer = dynamic(() => import('@/components/cart/CartDrawer'), {
  ssr: false,
});
const WishlistDrawer = dynamic(() => import('@/components/wishlist/WishlistDrawer'), {
  ssr: false,
});
const WelcomeOfferModal = dynamic(() => import('@/components/layout/WelcomeOfferModal'), {
  ssr: false,
});

export default function StorefrontLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const isCheckoutRoute = pathname === '/checkout';

  // Identify product detail page (e.g. /earrings/traditional-filigree-bell-jhumka)
  const segments = pathname ? pathname.split('/').filter(Boolean) : [];
  const isProductRoute =
    segments.length === 2 &&
    !['account', 'admin', 'order-success', 'promo', 'collections', 'api'].includes(segments[0]);

  if (isAdminRoute) {
    return <main className="flex-1 min-h-screen">{children}</main>;
  }

  return (
    <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-clip relative">
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>
      {!isProductRoute && <AnnouncementBar />}
      <Header />
      <main className="flex-1 w-full max-w-full min-w-0 overflow-x-clip">{children}</main>
      
      {!isCheckoutRoute && (
        <>
          <Footer />
          <MobileStickyBar />
        </>
      )}
      
      <CartDrawer />
      <WishlistDrawer />
      <WelcomeOfferModal />
      <OfferCountdownBadge />
    </div>
  );
}
