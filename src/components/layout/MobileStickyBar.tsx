'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Grid, MessageCircle, ShoppingBag, Heart } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { CATEGORIES } from '@/data/catalogue';

export default function MobileStickyBar() {
  const { openCart, totalItems } = useCart();
  const { openWishlist, totalWishlistItems } = useWishlist();
  const pathname = usePathname();

  // Check if current route is a Product Detail Page (PDP)
  const isPDP = React.useMemo(() => {
    if (!pathname) return false;
    const segments = pathname.split('/').filter(Boolean);
    // PDP paths are typically /[category]/[slug]
    if (segments.length === 2) {
      return CATEGORIES.some(cat => cat.slug === segments[0]);
    }
    return false;
  }, [pathname]);

  if (isPDP) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-paper/95 backdrop-blur-md border-t border-line lg:hidden py-2 px-4 safe-area-pb shadow-lg">
      <div className="flex items-center justify-around">
        <Link
          href="/"
          className="flex flex-col items-center justify-center text-ink hover:text-gold-ink transition-colors"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] tracking-wider uppercase font-medium mt-1">Home</span>
        </Link>

        <Link
          href="/shop"
          className="flex flex-col items-center justify-center text-ink hover:text-gold-ink transition-colors"
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px] tracking-wider uppercase font-medium mt-1">Explore All</span>
        </Link>

        <button
          type="button"
          onClick={openWishlist}
          className="flex flex-col items-center justify-center text-ink hover:text-gold-ink transition-colors relative"
        >
          <div className="relative">
            <Heart className="w-5 h-5" />
            {totalWishlistItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gold-deep text-paper text-[9px] font-bold flex items-center justify-center tabular-nums">
                {totalWishlistItems}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-wider uppercase font-medium mt-1">Saved</span>
        </button>

        <a
          href="https://wa.me/8801577731381?text=Hello%20Adorous%20Fashion,%20I%20have%20an%20inquiry"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center text-whatsapp hover:opacity-80 transition-opacity"
        >
          <div className="relative">
            <MessageCircle className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-whatsapp animate-ping" />
          </div>
          <span className="text-[10px] tracking-wider uppercase font-medium mt-1 text-ink">WhatsApp</span>
        </a>

        <button
          type="button"
          onClick={openCart}
          className="flex flex-col items-center justify-center text-ink hover:text-gold-ink transition-colors relative"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 ? (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gold text-ink text-[9px] font-bold flex items-center justify-center tabular-nums">
                {totalItems}
              </span>
            ) : (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gold" />
            )}
          </div>
          <span className="text-[10px] tracking-wider uppercase font-medium mt-1">Bag</span>
        </button>
      </div>
    </nav>
  );
}
