'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  X,
  MessageCircle,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Truck,
  User,
  Package,
  Sparkles,
  Flame,
} from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const EXPLORE_ALL_LINKS = [
  { name: 'Full Collection', href: '/shop' },
  { name: 'Jewelry Sets', href: '/jewelry' },
  { name: "Ladies' Bags", href: '/bags' },
  { name: 'Churi (Bangles)', href: '/churi' },
  { name: 'Earrings', href: '/earrings' },
  { name: 'More', href: '/more' },
];

const EDITORIAL_LINKS = [
  { name: 'Festive Lookbook 2026', href: '/lookbook' },
  { name: 'Churi Hand-Sizing Guide', href: '/size-fit' },
  { name: 'Delivery & COD Rates (64 Districts)', href: '/delivery-payment' },
  { name: 'Our Story & Vision', href: '/about' },
];

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const { customer } = useCustomerAuth();
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isEditorialOpen, setIsEditorialOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-ink/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-paper shadow-2xl z-50 flex flex-col h-full border-r border-line">
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Header */}
          <div className="p-4 bg-sand text-ink flex items-center justify-between border-b border-line">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-gold/50 shrink-0">
                <Image
                  src="/images/logo/logo-monogram.png"
                  alt="Adorous Monogram"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="font-serif text-lg tracking-widest text-gold-deep font-semibold uppercase block leading-tight">
                  Adorous
                </span>
                <span className="font-sans text-[9px] tracking-[0.25em] text-gold-ink/80 uppercase block">
                  Fashion
                </span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 text-ink hover:text-gold-deep transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Customer Account Strip */}
          <div className="p-3.5 bg-paper border-b border-line">
            {customer ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-full bg-gold/20 text-gold-deep border border-gold/40 flex items-center justify-center text-xs font-semibold uppercase shrink-0">
                    {customer.fullName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-ink truncate">{customer.fullName}</p>
                    <p className="text-[10px] text-text-muted font-mono truncate">{customer.phone || customer.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                  <Link
                    href="/account"
                    onClick={onClose}
                    className="px-2.5 py-1.5 bg-sand/60 hover:bg-sand rounded-[2px] text-ink font-medium flex items-center justify-center space-x-1"
                  >
                    <User className="w-3 h-3 text-gold-deep" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/account/orders"
                    onClick={onClose}
                    className="px-2.5 py-1.5 bg-sand/60 hover:bg-sand rounded-[2px] text-ink font-medium flex items-center justify-center space-x-1"
                  >
                    <Package className="w-3 h-3 text-gold-deep" />
                    <span>My Orders</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-ink">Welcome to Adorous</p>
                  <p className="text-[10px] text-text-muted">Sign in for saved orders & addresses</p>
                </div>
                <Link
                  href="/account/login"
                  onClick={onClose}
                  className="px-3 py-1.5 bg-gold text-ink font-semibold rounded-[2px] text-xs hover:bg-gold-light transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Quick WhatsApp Support Callout */}
          <div className="p-3.5 bg-sand/60 border-b border-line flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-whatsapp animate-pulse" />
              <span className="text-ink font-medium">WhatsApp Concierge Active</span>
            </div>
            <a
              href="https://wa.me/8801577731381?text=Hello%20Adorous%20Fashion,%20I%20need%20assistance"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gold-ink font-medium hover:underline flex items-center gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5 text-whatsapp" /> Chat Now
            </a>
          </div>

          {/* The Collections Section */}
          <div className="py-2">
            <div className="px-4 py-2 text-[10px] font-semibold tracking-[0.2em] text-text-muted uppercase">
              The Collections
            </div>

            {/* Explore All Dropdown Accordion */}
            <div className="border-t border-line/60">
              <button
                type="button"
                onClick={() => setIsExploreOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-ink hover:bg-sand/40 transition-colors text-left group"
                aria-expanded={isExploreOpen}
              >
                <span className="group-hover:text-gold-deep transition-colors">Explore All</span>
                <ChevronDown
                  className={`w-4 h-4 text-text-muted group-hover:text-gold-deep transition-transform duration-300 ease-in-out ${
                    isExploreOpen ? 'rotate-180 text-gold-deep' : ''
                  }`}
                />
              </button>

              {/* Collapsible Dropdown Menu */}
              <div
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                  isExploreOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="bg-sand/25 py-1 pl-4 pr-3 border-y border-line/40 space-y-0.5">
                    {EXPLORE_ALL_LINKS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className="flex items-center justify-between py-2 px-3 text-xs text-ink/85 hover:text-gold-deep hover:bg-sand/60 rounded-[2px] transition-colors group"
                      >
                        <span className="group-hover:translate-x-0.5 transition-transform">{item.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-text-muted/60 group-hover:text-gold-deep transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Subsection: New Arrivals & Best Sellers */}
            <div className="border-t border-line/60 pt-2 pb-1">
              <div className="px-4 pb-1 text-[9px] font-semibold tracking-[0.2em] text-gold-deep uppercase">
                Curated
              </div>
              <div className="divide-y divide-line/30">
                <Link
                  href="/shop?filter=new-arrivals"
                  onClick={onClose}
                  className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-sand/40 transition-colors group"
                >
                  <div className="flex items-center space-x-2.5">
                    <Sparkles className="w-4 h-4 text-gold-deep shrink-0" />
                    <span className="font-medium text-ink group-hover:text-gold-deep transition-colors">
                      New Arrivals
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 bg-gold/15 text-gold-deep rounded-[2px]">
                    New Drop
                  </span>
                </Link>
                <Link
                  href="/shop?filter=bestsellers"
                  onClick={onClose}
                  className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-sand/40 transition-colors group"
                >
                  <div className="flex items-center space-x-2.5">
                    <Flame className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-medium text-ink group-hover:text-gold-deep transition-colors">
                      Best Sellers
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-[2px]">
                    Popular
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Editorial & Guides Dropdown Accordion */}
          <div className="border-t border-line">
            <button
              type="button"
              onClick={() => setIsEditorialOpen((prev) => !prev)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-sand/40 transition-colors group"
              aria-expanded={isEditorialOpen}
            >
              <span className="text-[10px] font-semibold tracking-[0.2em] text-text-muted uppercase group-hover:text-gold-deep transition-colors">
                Editorial & Guides
              </span>
              <ChevronDown
                className={`w-4 h-4 text-text-muted group-hover:text-gold-deep transition-transform duration-300 ease-in-out ${
                  isEditorialOpen ? 'rotate-180 text-gold-deep' : ''
                }`}
              />
            </button>

            {/* Collapsible Dropdown Menu */}
            <div
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                isEditorialOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <div className="space-y-0.5 px-3 py-1.5 bg-sand/20 border-t border-line/40">
                  {EDITORIAL_LINKS.map((guide) => (
                    <Link
                      key={guide.href}
                      href={guide.href}
                      onClick={onClose}
                      className="block px-3 py-2 text-xs text-ink-soft hover:text-gold-ink rounded-[2px] hover:bg-sand/40 transition-colors"
                    >
                      {guide.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Bottom Details */}
        <div className="p-4 bg-sand border-t border-line text-xs space-y-2.5 shrink-0">
          <div className="flex items-center space-x-2 text-text-muted">
            <Truck className="w-3.5 h-3.5 text-gold-ink shrink-0" />
            <span>Dhaka: 1–2 Days (৳80) | Nationwide: 2–4 Days (৳130)</span>
          </div>
          <div className="flex items-center space-x-2 text-text-muted">
            <ShieldCheck className="w-3.5 h-3.5 text-success shrink-0" />
            <span>Cash on Delivery · Pay on Hand</span>
          </div>
          <div className="pt-2 border-t border-line/60 flex items-center justify-between text-[11px] text-text-muted">
            <span>© {new Date().getFullYear()} Adorous Fashion</span>
            <span className="text-gold-ink font-medium">Rajshahi, Bangladesh</span>
          </div>
        </div>
      </div>
    </div>
  );
}
