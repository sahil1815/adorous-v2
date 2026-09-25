'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Search, ShoppingBag, MessageCircle, ArrowRight, Heart, User, LogOut, Package, MapPin, ChevronDown } from 'lucide-react';
import MobileNav from './MobileNav';
import SearchModal from './SearchModal';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCustomerAuth } from '@/context/CustomerAuthContext';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const { openCart, totalItems } = useCart();
  const { openWishlist, totalWishlistItems } = useWishlist();
  const { customer, logout } = useCustomerAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close account menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#customer-account-menu-container')) {
        setAccountMenuOpen(false);
      }
    };
    if (accountMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [accountMenuOpen]);

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
          <div className="flex items-center justify-between gap-3 lg:gap-4 xl:gap-6">
            {/* Left: Mobile hamburger & Desktop primary navigation */}
            <div className="flex items-center space-x-4 shrink-0">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 -ml-2 text-ink hover:text-gold-ink transition-colors"
                aria-label="Open Navigation"
              >
                <Menu className="w-6 h-6" />
              </button>

              <nav className="hidden lg:flex items-center space-x-3.5 xl:space-x-6 2xl:space-x-8 text-[11px] xl:text-xs font-medium tracking-[0.1em] xl:tracking-[0.14em] uppercase text-ink whitespace-nowrap">
                <Link
                  href="/shop"
                  className="hover:text-gold-ink transition-colors py-1 relative group whitespace-nowrap shrink-0"
                >
                  Explore All
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gold transition-all duration-200 group-hover:w-full" />
                </Link>
                <Link
                  href="/jewelry"
                  className="hover:text-gold-ink transition-colors py-1 relative group whitespace-nowrap shrink-0"
                >
                  Jewelry Sets
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gold transition-all duration-200 group-hover:w-full" />
                </Link>
                <Link
                  href="/bags"
                  className="hover:text-gold-ink transition-colors py-1 relative group whitespace-nowrap shrink-0"
                >
                  Ladies' Bags
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gold transition-all duration-200 group-hover:w-full" />
                </Link>
                <Link
                  href="/churi"
                  className="hover:text-gold-ink transition-colors py-1 relative group whitespace-nowrap shrink-0"
                >
                  Churi (Bangles)
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gold transition-all duration-200 group-hover:w-full" />
                </Link>
                <Link
                  href="/more"
                  className="hover:text-gold-ink transition-colors py-1 relative group whitespace-nowrap shrink-0"
                >
                  More
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gold transition-all duration-200 group-hover:w-full" />
                </Link>
                <Link
                  href="/lookbook"
                  className="hover:text-gold-ink transition-colors py-1 text-gold-ink font-semibold relative group whitespace-nowrap shrink-0"
                >
                  Lookbook
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gold transition-all duration-200 group-hover:w-full" />
                </Link>
              </nav>
            </div>

            {/* Center: Brand Wordmark & Monogram */}
            <div className="flex flex-col items-center justify-center text-center shrink-0">
              <Link href="/" className="group flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-gold/40 shadow-sm shrink-0 bg-paper">
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
            <div className="flex items-center space-x-2.5 sm:space-x-3.5 xl:space-x-5 shrink-0">
              {/* WhatsApp direct concierge button */}
              <a
                href="https://wa.me/8801577731381?text=Hello%20Adorous%20Fashion,%20I%20would%20like%20to%20order"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-ink bg-sand/80 hover:bg-sand border border-line rounded-[2px] transition-colors whitespace-nowrap shrink-0"
                title="Direct WhatsApp Concierge"
              >
                <span className="w-2 h-2 rounded-full bg-whatsapp animate-pulse shrink-0" />
                <span className="text-[11px] tracking-wider uppercase font-medium whitespace-nowrap">WhatsApp</span>
              </a>

              {/* Customer Account Trigger & Dropdown */}
              <div id="customer-account-menu-container" className="relative">
                {customer ? (
                  <button
                    type="button"
                    onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    className="flex items-center space-x-1.5 p-1.5 text-ink hover:text-gold-ink transition-colors rounded-[2px]"
                    aria-label="My Account"
                  >
                    <div className="w-6 h-6 rounded-full bg-gold/15 text-gold-deep border border-gold/40 flex items-center justify-center text-[10px] font-semibold uppercase">
                      {customer.fullName.charAt(0)}
                    </div>
                    <span className="hidden md:inline-block text-[11px] font-medium tracking-wider uppercase max-w-[80px] truncate">
                      {customer.fullName.split(' ')[0]}
                    </span>
                    <ChevronDown className={`w-3 h-3 text-ink/60 transition-transform ${accountMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                ) : (
                  <Link
                    href="/account/login"
                    className="p-2 text-ink hover:text-gold-ink transition-colors flex items-center"
                    aria-label="Sign In / Register"
                    title="Sign In / Register"
                  >
                    <User className="w-5 h-5" />
                  </Link>
                )}

                {/* Dropdown Menu */}
                {customer && accountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-paper border border-line shadow-xl rounded-[2px] p-2 space-y-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-line/60">
                      <p className="text-xs font-semibold text-ink font-serif truncate">
                        {customer.fullName}
                      </p>
                      <p className="text-[10px] text-text-muted font-mono truncate">
                        {customer.phone || customer.email}
                      </p>
                    </div>

                    <Link
                      href="/account"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center space-x-2 px-3 py-1.5 text-xs text-ink/80 hover:text-ink hover:bg-sand/60 rounded-[2px] transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-gold-deep" />
                      <span>My Dashboard</span>
                    </Link>

                    <Link
                      href="/account/orders"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center space-x-2 px-3 py-1.5 text-xs text-ink/80 hover:text-ink hover:bg-sand/60 rounded-[2px] transition-colors"
                    >
                      <Package className="w-3.5 h-3.5 text-gold-deep" />
                      <span>My Orders</span>
                    </Link>

                    <Link
                      href="/account/addresses"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center space-x-2 px-3 py-1.5 text-xs text-ink/80 hover:text-ink hover:bg-sand/60 rounded-[2px] transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-gold-deep" />
                      <span>Saved Addresses</span>
                    </Link>

                    <div className="border-t border-line/60 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-[2px] transition-colors text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

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
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-gold text-ink text-[10px] font-bold flex items-center justify-center tabular-nums shadow-sm">
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
