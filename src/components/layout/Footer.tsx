'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, ShieldCheck, Truck, RotateCcw, Award } from 'lucide-react';
import { CATEGORIES } from '@/data/catalogue';

export default function Footer() {
  return (
    <footer className="bg-ink text-paper pt-16 pb-24 lg:pb-16 border-t border-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Trust Pillars */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-white/10 text-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-ink-soft border border-gold/30 flex items-center justify-center text-gold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-serif text-sm tracking-wider uppercase text-gold-light">Cash on Delivery</h4>
            <p className="text-xs text-paper/70">Pay when your parcel arrives in hand across all 64 districts.</p>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-ink-soft border border-gold/30 flex items-center justify-center text-gold">
              <Truck className="w-5 h-5" />
            </div>
            <h4 className="font-serif text-sm tracking-wider uppercase text-gold-light">Fast Dispatch</h4>
            <p className="text-xs text-paper/70">Dhaka: 1–2 days (৳70) · Outside Dhaka: 2–4 days (৳130).</p>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-ink-soft border border-gold/30 flex items-center justify-center text-gold">
              <MessageCircle className="w-5 h-5 text-whatsapp" />
            </div>
            <h4 className="font-serif text-sm tracking-wider uppercase text-gold-light">WhatsApp Confirmation</h4>
            <p className="text-xs text-paper/70">Direct personal confirmation before any order ships.</p>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-ink-soft border border-gold/30 flex items-center justify-center text-gold">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h4 className="font-serif text-sm tracking-wider uppercase text-gold-light">7-Day Exchange</h4>
            <p className="text-xs text-paper/70">Hassle-free size and style exchange for complete peace of mind.</p>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 py-12">
          {/* Brand Col */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-gold/40 shrink-0 bg-ink">
                <Image
                  src="/images/logo/logo-monogram.png"
                  alt="Adorous Fashion"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="font-serif text-2xl tracking-[0.16em] text-gold font-semibold uppercase block leading-none">
                  Adorous
                </span>
                <span className="font-sans text-[10px] tracking-[0.25em] text-gold-light/80 uppercase block mt-1">
                  Fashion
                </span>
              </div>
            </div>
            <p className="text-xs text-paper/70 leading-relaxed max-w-sm">
              Premium curated accessories and jewellery for discerning women in Bangladesh. Designed to be styled together across occasions, from festive celebrations to effortless everyday wear.
            </p>
            <div className="pt-2">
              <a
                href="https://wa.me/8801577731381?text=Hello%20Adorous%20Fashion"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-ink-soft hover:bg-ink-deep border border-gold/40 text-gold-light text-xs tracking-wider uppercase rounded-[2px] transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-whatsapp" />
                <span>WhatsApp Concierge: 015-777-31381</span>
              </a>
            </div>
          </div>

          {/* Categories Col */}
          <div className="md:col-span-3 space-y-3">
            <h5 className="font-serif text-sm tracking-[0.15em] uppercase text-gold font-semibold">
              The Collections
            </h5>
            <ul className="space-y-2 text-xs text-paper/80">
              <li>
                <Link href="/shop" className="hover:text-gold transition-colors">
                  The Full Edit (All 15 Designs)
                </Link>
              </li>
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/${cat.slug}`} className="hover:text-gold transition-colors">
                    {cat.name} ({cat.count})
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/lookbook" className="hover:text-gold transition-colors text-gold-light">
                  Festive Lookbook 2026
                </Link>
              </li>
            </ul>
          </div>

          {/* Client Care Col */}
          <div className="md:col-span-2 space-y-3">
            <h5 className="font-serif text-sm tracking-[0.15em] uppercase text-gold font-semibold">
              Client Care
            </h5>
            <ul className="space-y-2 text-xs text-paper/80">
              <li>
                <Link href="/size-fit" className="hover:text-gold transition-colors">
                  Churi Sizing Guide
                </Link>
              </li>
              <li>
                <Link href="/delivery-payment" className="hover:text-gold transition-colors">
                  Delivery & COD Info
                </Link>
              </li>
              <li>
                <Link href="/returns-exchange" className="hover:text-gold transition-colors">
                  Returns & Exchange Policy
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-gold transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-gold transition-colors">
                  Track Your Parcel
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold transition-colors">
                  Contact Studio
                </Link>
              </li>
            </ul>
          </div>

          {/* VIP Drop Broadcast Col */}
          <div className="md:col-span-3 space-y-3">
            <h5 className="font-serif text-sm tracking-[0.15em] uppercase text-gold font-semibold">
              The Private Drop List
            </h5>
            <p className="text-xs text-paper/70 leading-relaxed">
              Receive private notifications when a new collection drops before public release.
            </p>
            <form className="space-y-2 pt-1" onSubmit={(e) => e.preventDefault()}>
              <input
                type="tel"
                placeholder="Your WhatsApp number (e.g. 017XXXXXXXX)"
                className="w-full bg-ink-soft/90 border border-gold/30 px-3.5 py-2 text-xs text-paper placeholder:text-paper/40 focus:outline-none focus:border-gold rounded-[2px]"
              />
              <button
                type="submit"
                className="w-full bg-gold hover:bg-gold-light text-ink font-semibold text-xs tracking-wider uppercase py-2 px-4 transition-colors rounded-[2px]"
              >
                Join Private List
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-paper/50 space-y-4 sm:space-y-0">
          <div>
            © {new Date().getFullYear()} Adorous Fashion Ltd. Rajshahi, Bangladesh.
          </div>
          <div className="flex items-center space-x-6 text-[11px]">
            <span>Cash on Delivery</span>
            <span>bKash</span>
            <span>Nagad</span>
            <span>Visa / Mastercard</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
