'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Search, ShoppingBag, MessageCircle, ArrowRight, Heart } from 'lucide-react';
import MobileNav from './MobileNav';
import SearchModal from './SearchModal';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const { openCart, totalItems } = useCart();
  const { openWishlist, totalWishlistItems } = useWishlist();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-paper/95 backdrop-blur-md shadow-sm border-b border-line py-3'
            : 'bg-paper border-b border-line/80 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Left: Mobile hamburger & Desktop primary navigation */}
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 -ml-2 text-ink hover:text-gold-ink transition-colors"
                aria-label="Open Navigation"
              >
                <Menu className="w-6 h-6" />
              </button>

              <nav className="hidden lg:flex items-center space-x-8 text-xs font-medium tracking-[0.14em] uppercase text-ink">
                <Link
                  href="/shop"
                  className="hover:text-gold-ink transition-colors py-1 relative group"
                >
                  The Edit
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gold transition-all duration-200 group-hover:w-full" />
                </Link>
                <Link
                  href="/jewelry"
                  className="hover:text-gold-ink transition-colors py-1 relative group"
                >
                  Jewelry Sets
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gold transition-all duration-200 group-hover:w-full" />
                </Link>
                <Link
                  href="/bags"
                  className="hover:text-gold-ink transition-colors py-1 relative group"
                >
                  Ladies' Bags
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gold transition-all duration-200 group-hover:w-full" />
                </Link>
                <Link
                  href="/churi"
                  className="hover:text-gold-ink transition-colors py-1 relative group"
                >
                  Churi (Bangles)
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gold transition-all duration-200 group-hover:w-full" />
                </Link>
                <Link
                  href="/more"
                  className="hover:text-gold-ink transition-colors py-1 relative group"
                >
                  More
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gold transition-all duration-200 group-hover:w-full" />
                </Link>
                <Link
                  href="/lookbook"
                  className="hover:text-gold-ink transition-colors py-1 text-gold-ink font-semibold relative group"
                >
                  Lookbook
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gold transition-all duration-200 group-hover:w-full" />
                </Link>
              </nav>
            </div>

            {/* Center: Brand Wordmark & Monogram */}
            <div className="flex flex-col items-center justify-center text-center">
              <Link href="/" className="group flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-gold/40 shadow-sm shrink-0 bg-ink">
                  <Image
                    src="/images/logo/logo-monogram.png"
                    alt="AF"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="text-left">
                  <span className="font-serif text-xl sm:text-2xl tracking-[0.18em] font-semibold text-ink uppercase block leading-none group-hover:text-gold-deep transition-colors">
                    Adorous
                  </span>
                  <span className="font-sans text-[8px] sm:text-[9px] tracking-[0.3em] text-text-muted uppercase block font-medium mt-0.5">
                    Fashion
                  </span>
                </div>
              </Link>
            </div>

            {/* Right: Quick actions (WhatsApp Concierge, Search, Cart) */}
            <div className="flex items-center space-x-3 sm:space-x-5">
              {/* WhatsApp direct concierge button */}
              <a
                href="https://wa.me/8801577731381?text=Hello%20Adorous%20Fashion,%20I%20would%20like%20to%20order"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-ink bg-sand/80 hover:bg-sand border border-line rounded-[2px] transition-colors"
                title="Direct WhatsApp Order Desk"
              >
                <span className="w-2 h-2 rounded-full bg-whatsapp animate-pulse" />
                <span className="text-[11px] tracking-wider uppercase font-medium">WhatsApp Desk</span>
              </a>

              {/* Search button */}
              <button
                type="button"
                onClick={() => setSearchModalOpen(true)}
                className="p-2 text-ink hover:text-gold-ink transition-colors"
                aria-label="Search Collection"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Drawer Trigger */}
              <button
                type="button"
                onClick={openWishlist}
                className="p-2 text-ink hover:text-gold-ink transition-colors relative"
                aria-label="Open Wishlist"
              >
                <Heart className="w-5 h-5" />
                {totalWishlistItems > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-gold-deep text-paper text-[10px] font-bold flex items-center justify-center tabular-nums shadow-sm">
                    {totalWishlistItems}
                  </span>
                )}
              </button>

              {/* Cart Drawer Trigger */}
              <button
                type="button"
                onClick={openCart}
                className="p-2 text-ink hover:text-gold-ink transition-colors relative"
                aria-label="Open Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 ? (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-ink text-gold-light text-[10px] font-bold flex items-center justify-center tabular-nums shadow-sm">
                    {totalItems}
                  </span>
                ) : (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-gold" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />

      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
}
