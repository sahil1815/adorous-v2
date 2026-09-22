import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Sparkles, Truck, Heart, ArrowRight, MessageCircle, Gem, Compass, Feather } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Our Story & Vision | Adorous Fashion',
  description:
    'Discover the philosophy of Adorous Fashion. Premium South Asian fine jewelry, velvet churi stacks, and curated accessories captured exclusively in high-end still-life photography.',
  keywords: ['Adorous Fashion', 'boutique jewelry Bangladesh', 'still life jewelry photography', 'velvet churi craft'],
};

export default function AboutPage() {
  return (
    <div className="bg-paper min-h-screen">
      {/* Editorial Hero Header */}
      <section className="relative border-b border-line bg-[#F7F4EC] py-14 sm:py-20 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <nav className="flex items-center justify-center space-x-2 text-xs text-text-muted tracking-wider uppercase mb-2">
            <Link href="/" className="hover:text-ink transition-colors">Home</Link>
            <span>/</span>
            <span className="text-ink font-medium">Our Story</span>
          </nav>

          <span className="text-[11px] font-semibold tracking-[0.25em] text-gold-ink uppercase block">
            Adorous Fashion · Rajshahi
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif text-ink font-normal tracking-tight">
            The Craft of Stillness
          </h1>
          <p className="text-xs sm:text-base text-text-muted max-w-2xl mx-auto leading-relaxed">
            In an era of fleeting trends and loud distraction, Adorous Fashion was founded in Rajshahi to honor the beauty and heritage of South Asian jewelry, velvet churi stacks, and curated leather accessories.
          </p>
        </div>
      </section>

      {/* Narrative Section 1: The Still-Life Philosophy */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-b border-line">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/5] bg-stone rounded-[2px] overflow-hidden border border-line shadow-sm">
              <Image
                src="/images/hero/hero-still-life.jpg"
                alt="Adorous Still Life Philosophy on Limestone Plinth"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
              <div className="absolute bottom-3 left-3 bg-sand/80 backdrop-blur-sm text-gold-deep text-[10px] tracking-widest uppercase px-3 py-1 font-semibold">
                Pure Still Life Photography
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="text-[11px] font-semibold tracking-[0.2em] text-gold-ink uppercase">
                The Sovereign Aesthetic
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif text-ink font-normal leading-snug">
                Why You Will Never See a Human Model on Adorous
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              We make an uncompromising aesthetic pledge: <strong>zero human faces, zero models, and zero distracting silhouettes</strong> anywhere across our digital storefront.
            </p>

            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              When jewelry is draped over a model, attention is stolen by posture and vanity. But when an antique gold choker rests upon a warm limestone plinth, or velvet churis stack upon a suede keepsake tray, you observe every detail of filigree work, the iridescence of polki stones, and the beauty of pearl accents.
            </p>

            <div className="pt-2 border-t border-line space-y-3">
              <div className="flex items-start space-x-3 text-xs text-ink/85">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-deep mt-1.5 shrink-0" />
                <span><strong>Architectural Warm Stone:</strong> Natural limestone and travertine plinths that reveal genuine metal undertones.</span>
              </div>
              <div className="flex items-start space-x-3 text-xs text-ink/85">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-deep mt-1.5 shrink-0" />
                <span><strong>Velvet Neckforms & Display Busts:</strong> Museum-grade presentation allowing you to gauge weight, balance, and scale.</span>
              </div>
              <div className="flex items-start space-x-3 text-xs text-ink/85">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-deep mt-1.5 shrink-0" />
                <span><strong>Macro Filigree Integrity:</strong> Uncompromising clarity on gemstone prongs, clasps, and stitching.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 4 Pillars of Adorous */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-b border-line">
        <div className="text-center max-w-xl mx-auto mb-14 space-y-2">
          <span className="text-[11px] font-semibold tracking-[0.2em] text-gold-ink uppercase">
            Quality Standards
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif text-ink font-normal">
            Four Pillars of Adorous
          </h2>
          <p className="text-xs text-text-muted">
            Selected specifically for South Asian festivities, climate, and lasting quality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-sand/30 border border-line/80 space-y-3 rounded-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold-deep">
                <Gem className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg text-ink font-medium">22k Antique Electroplating</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Brass cores coated with thick antique matte 22k gold and sealed with a hypoallergenic anti-tarnish lacquer that resists Dhaka monsoon humidity.
              </p>
            </div>
            <span className="text-[10px] text-gold-ink font-semibold tracking-wider uppercase pt-2">
              Lasting Quality
            </span>
          </div>

          <div className="p-6 bg-sand/30 border border-line/80 space-y-3 rounded-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold-deep">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg text-ink font-medium">Hand Knuckle Sizing</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Traditional churi bangles slide over the hand knuckles, not the wrist. We engineer our stacks in certified 2-4, 2-6, and 2-8 diameters with 7-day exchange.
              </p>
            </div>
            <span className="text-[10px] text-gold-ink font-semibold tracking-wider uppercase pt-2">
              Comfort Guaranteed
            </span>
          </div>

          <div className="p-6 bg-sand/30 border border-line/80 space-y-3 rounded-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold-deep">
                <Feather className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg text-ink font-medium">Architectural Leather & Brass</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Reinforced structured bases that never slump or lose geometry, lined with plush champagne microsuede and custom brushed brass hardware.
              </p>
            </div>
            <span className="text-[10px] text-gold-ink font-semibold tracking-wider uppercase pt-2">
              Structured Silhouette
            </span>
          </div>

          <div className="p-6 bg-sand/30 border border-line/80 space-y-3 rounded-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold-deep">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg text-ink font-medium">Monsoon Engineering</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Solid hand-turned curved chestnut wood handles with double-reinforced 8-rib fiberglass frames and UV50+ water-repellent pongee silk canopies.
              </p>
            </div>
            <span className="text-[10px] text-gold-ink font-semibold tracking-wider uppercase pt-2">
              60 km/h Windproof
            </span>
          </div>
        </div>
      </section>

      {/* The Rajshahi Dispatch & Courier Promise */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="bg-sand text-ink p-8 sm:p-14 rounded-[2px] border border-gold/30 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="text-[11px] font-semibold text-gold tracking-[0.2em] uppercase">
                Adorous Fashion Studio
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif text-ink">
                Premium Curation. Doorstep Cash on Delivery.
              </h2>
              <p className="text-xs sm:text-sm text-ink/75 leading-relaxed max-w-2xl">
                Every order placed with Adorous Fashion is picked, carefully inspected, and placed into our premium keepsake box with velvet dust pouches. We ship across all 64 districts with zero advance payment required.
              </p>
              <div className="pt-2 flex flex-wrap gap-6 text-xs text-gold-deep">
                <span>✓ 24-48h Delivery in Dhaka & Gazipur (৳80)</span>
                <span>✓ 48-72h Delivery Nationwide (৳130)</span>
                <span>✓ Free Delivery on ৳2,000+</span>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3 justify-center items-start lg:items-end">
              <Link
                href="/shop"
                className="w-full sm:w-auto px-8 py-3.5 bg-gold hover:bg-gold-light text-ink font-semibold text-xs tracking-wider uppercase rounded-xs transition-all flex items-center justify-center space-x-2 shadow-md"
              >
                <span>Explore The Collection</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href="https://wa.me/8801577731381?text=Hello%20Adorous%20Fashion,%20I%20would%20like%20to%20learn%20more%20about%20your%20pieces."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-3.5 bg-sand-soft hover:bg-sand-deep text-ink border border-white/20 font-medium text-xs tracking-wider uppercase rounded-xs transition-all flex items-center justify-center space-x-2"
              >
                <MessageCircle className="w-3.5 h-3.5 text-whatsapp" />
                <span>Message Our Stylist</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
