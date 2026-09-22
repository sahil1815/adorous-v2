'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, MessageCircle, ChevronRight, Phone, ShieldCheck, Truck } from 'lucide-react';
import { CATEGORIES } from '@/data/catalogue';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-ink/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-paper shadow-2xl z-50 flex flex-col justify-between overflow-y-auto border-r border-line">
        <div>
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

          {/* Category Navigation Links */}
          <div className="py-2">
            <div className="px-4 py-2 text-[10px] font-medium tracking-[0.2em] text-text-muted uppercase">
              The Collections
            </div>
            <nav className="divide-y divide-line/60">
              <Link
                href="/shop"
                onClick={onClose}
                className="flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-sand/40 transition-colors"
              >
                <span>Explore All (All 15 Designs)</span>
                <ChevronRight className="w-4 h-4 text-text-muted" />
              </Link>
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/${cat.slug}`}
                  onClick={onClose}
                  className="flex items-center justify-between px-4 py-3 text-sm hover:bg-sand/40 transition-colors"
                >
                  <div>
                    <span className="font-medium text-ink block">{cat.name}</span>
                    <span className="text-[11px] text-text-muted">{cat.count}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Editorial & Trust Links */}
          <div className="py-3 border-t border-line">
            <div className="px-4 py-1.5 text-[10px] font-medium tracking-[0.2em] text-text-muted uppercase">
              Editorial & Guides
            </div>
            <div className="space-y-1 px-2">
              <Link
                href="/lookbook"
                onClick={onClose}
                className="block px-3 py-2 text-xs text-ink-soft hover:text-gold-ink rounded hover:bg-sand/40"
              >
                Festive Lookbook 2026
              </Link>
              <Link
                href="/size-fit"
                onClick={onClose}
                className="block px-3 py-2 text-xs text-ink-soft hover:text-gold-ink rounded hover:bg-sand/40"
              >
                Churi Hand-Sizing Guide
              </Link>
              <Link
                href="/delivery-payment"
                onClick={onClose}
                className="block px-3 py-2 text-xs text-ink-soft hover:text-gold-ink rounded hover:bg-sand/40"
              >
                Delivery & COD Rates (64 Districts)
              </Link>
              <Link
                href="/about"
                onClick={onClose}
                className="block px-3 py-2 text-xs text-ink-soft hover:text-gold-ink rounded hover:bg-sand/40"
              >
                Our Story & Vision
              </Link>
            </div>
          </div>
        </div>

        {/* Drawer Bottom Details */}
        <div className="p-4 bg-sand border-t border-line text-xs space-y-2.5">
          <div className="flex items-center space-x-2 text-text-muted">
            <Truck className="w-3.5 h-3.5 text-gold-ink shrink-0" />
            <span>Dhaka: 1–2 Days (৳70) | Nationwide: 2–4 Days (৳130)</span>
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
