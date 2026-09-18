'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PRODUCTS } from '@/data/catalogue';
import { useCart } from '@/context/CartContext';
import { Gift, Sparkles, Check, ShoppingBag, MessageCircle, Heart, ShieldCheck, Box, Package } from 'lucide-react';

interface GiftBundle {
  id: string;
  name: string;
  tagline: string;
  price: number;
  originalPrice: number;
  description: string;
  boxInclusions: string[];
  productIds: string[];
  image: string;
}

const GIFT_BUNDLES: GiftBundle[] = [
  {
    id: 'gift-01',
    name: 'The Royal Trousseau Keepsake Box',
    tagline: 'Bridal Choker, Velvet Churi Stack & Heritage Jhumkas',
    price: 5850,
    originalPrice: 6850,
    description:
      'The definitive bridal gift. Includes our master Zari antique gold choker set, 24-piece emerald velvet bangles, and matching bell jhumkas, presented inside our rigid warm stone keepsake box with satin ribbon.',
    boxInclusions: [
      '1x Zari Bridal Choker & Jhumka Set',
      '1x Meher Velvet Gold Churi Stack (24 Pcs)',
      '1x Pair Shahi Royal Bell Jhumkas',
      'Adorous Signature Rigid Warm Stone Gift Box',
      'Handwritten Calligraphy Gift Note on Deckle-Edge Paper',
      'Velvet Jewelry Dust Pouches for Each Piece',
    ],
    productIds: ['jewel-01', 'churi-01', 'ear-01'],
    image: '/images/hero/hero-still-life.jpg',
  },
  {
    id: 'gift-02',
    name: 'The Mehendi Festive Hamper',
    tagline: 'Dual Velvet & Mirrored Glass Churi Stacks with Velvet Tray',
    price: 3200,
    originalPrice: 3800,
    description:
      'A celebration of sound, texture, and festive color. Features two complementary bangle stacks (emerald velvet and mirrored bridal bangles) curated for Sangeet, Holud, or Eid celebrations.',
    boxInclusions: [
      '1x Meher Velvet Gold Churi Stack (24 Pcs)',
      '1x Boshonto Mirrored Glass Churi Set (16 Pcs)',
      '1x Kundan Bangles Set (8 Pcs)',
      'Champagne Velvet Keepsake Display Tray',
      'Gold-Foil Embossed Gift Card with Wax Seal',
    ],
    productIds: ['churi-01', 'churi-02', 'churi-04'],
    image: '/images/products/churi-meher-emerald.jpg',
  },
  {
    id: 'gift-03',
    name: 'The Modern Heirloom Duo',
    tagline: 'Architectural Hasli Collar & Gulshan Top-Handle Bag',
    price: 4600,
    originalPrice: 5400,
    description:
      'For the discerning modern woman. Pairs our sculpted Noor Hasli collar choker with the structured Gulshan architectural bag in midnight charcoal.',
    boxInclusions: [
      '1x Noor Hasli Choker Set',
      '1x Gulshan Architectural Top-Handle Bag',
      'Adorous Oversized Luxury Presentation Box with Magnetic Closure',
      'Personalized Calligraphy Card',
    ],
    productIds: ['jewel-02', 'bag-01'],
    image: '/images/products/bag-gulshan-charcoal.jpg',
  },
];

export default function GiftingPage() {
  const { addToCart } = useCart();
  const [addedBundleId, setAddedBundleId] = useState<string | null>(null);

  const handleAddBundleToBag = (bundle: GiftBundle) => {
    const productsToAdd = PRODUCTS.filter((p) => bundle.productIds.includes(p.id));
    productsToAdd.forEach((p) => {
      addToCart(p, p.colorways[0], p.sizes ? p.sizes[1] || p.sizes[0] : undefined, 1);
    });

    setAddedBundleId(bundle.id);
    setTimeout(() => setAddedBundleId(null), 2200);
  };

  return (
    <div className="bg-paper min-h-screen">
      {/* Editorial Gifting Header */}
      <section className="border-b border-line bg-[#F8F5EE] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <nav className="flex items-center justify-center space-x-2 text-xs text-text-muted tracking-wider uppercase mb-2">
            <Link href="/" className="hover:text-ink transition-colors">Home</Link>
            <span>/</span>
            <span className="text-ink font-medium">Gifting & Bridal Trousseau</span>
          </nav>

          <span className="text-[11px] font-semibold tracking-[0.25em] text-gold-ink uppercase">
            Luxury Presentation & Concierge
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif text-ink font-normal tracking-tight">
            Curated Gifting & Trousseau
          </h1>
          <p className="text-xs sm:text-sm text-text-muted max-w-2xl mx-auto leading-relaxed">
            Whether for an impending bride, an Eid blessing, or customized Holud favours, Adorous gift suites are delivered in rigid warm stone presentation boxes with champagne satin ribbons and handwritten calligraphy notes.
          </p>
        </div>
      </section>

      {/* The Unboxing Experience Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-b border-line">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[11px] font-semibold tracking-[0.2em] text-gold-ink uppercase">
            Signature Presentation
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif text-ink mt-1">
            The Adorous Unboxing Experience
          </h2>
          <p className="text-xs text-text-muted mt-2">
            Every order is treated as a presentation piece, packed with museum-grade care.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-sand/40 border border-line/80 space-y-3">
            <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center text-gold-deep">
              <Box className="w-4 h-4" />
            </div>
            <h3 className="font-medium text-sm text-ink">Rigid Warm Stone Box</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Crafted from 1200gsm rigid paperboard with tactile textured finish and gold-embossed AF crest.
            </p>
          </div>

          <div className="p-6 bg-sand/40 border border-line/80 space-y-3">
            <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center text-gold-deep">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-medium text-sm text-ink">Velvet Dust Pouches</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Each piece rests inside an anti-tarnish micro-suede pouch with braided gold drawstrings.
            </p>
          </div>

          <div className="p-6 bg-sand/40 border border-line/80 space-y-3">
            <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center text-gold-deep">
              <Heart className="w-4 h-4" />
            </div>
            <h3 className="font-medium text-sm text-ink">Calligraphy Gift Note</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Tell us your message at checkout. We handwrite each card on deckle-edged handmade cotton paper.
            </p>
          </div>

          <div className="p-6 bg-sand/40 border border-line/80 space-y-3">
            <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center text-gold-deep">
              <Package className="w-4 h-4" />
            </div>
            <h3 className="font-medium text-sm text-ink">Discreet Courier Outer</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Reinforced shock-absorbing transit carton prevents any crushing or transit tampering across 64 districts.
            </p>
          </div>
        </div>
      </section>

      {/* Curated Gift Suites */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16 sm:space-y-24">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-[11px] font-semibold tracking-[0.2em] text-gold-ink uppercase">
            Curated Bundles
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif text-ink mt-1">
            Ready-to-Gift Trousseau Suites
          </h2>
          <p className="text-xs text-text-muted mt-2">
            Pre-assembled collections with complimentary gift packaging and free doorstep delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {GIFT_BUNDLES.map((bundle) => {
            const bundleProducts = PRODUCTS.filter((p) => bundle.productIds.includes(p.id));

            return (
              <div
                key={bundle.id}
                className="bg-paper border border-line/80 hover:border-gold/60 transition-all duration-300 flex flex-col justify-between shadow-xs"
              >
                {/* Visual */}
                <div className="relative aspect-[4/3] bg-stone overflow-hidden border-b border-line">
                  <Image
                    src={bundle.image}
                    alt={bundle.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover object-center hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-ink text-gold-light text-[10px] tracking-wider uppercase px-2.5 py-1 font-semibold border border-gold/30">
                    Complimentary Luxury Packaging
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="text-[10px] tracking-wider uppercase font-semibold text-gold-ink">
                      {bundle.tagline}
                    </div>
                    <h3 className="font-serif text-xl text-ink">
                      {bundle.name}
                    </h3>
                    <p className="text-xs text-text-muted leading-relaxed">
                      {bundle.description}
                    </p>

                    {/* Price */}
                    <div className="pt-2 flex items-baseline space-x-2">
                      <span className="text-xl font-semibold text-ink tabular-nums">
                        ৳{bundle.price.toLocaleString('en-US')}
                      </span>
                      <span className="text-xs text-text-muted line-through tabular-nums">
                        ৳{bundle.originalPrice.toLocaleString('en-US')}
                      </span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 font-semibold">
                        Save ৳{(bundle.originalPrice - bundle.price).toLocaleString('en-US')}
                      </span>
                    </div>

                    {/* Inclusions list */}
                    <div className="pt-4 space-y-1.5 border-t border-line">
                      <span className="text-[10px] font-semibold tracking-wider uppercase text-text-muted block mb-1">
                        Keepsake Box Inclusions:
                      </span>
                      {bundle.boxInclusions.map((inc, i) => (
                        <div key={i} className="flex items-start space-x-2 text-[11px] text-ink/80">
                          <Check className="w-3.5 h-3.5 text-gold-ink shrink-0 mt-0.5" />
                          <span>{inc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add Bundle Button */}
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => handleAddBundleToBag(bundle)}
                      className="w-full py-3 bg-gold hover:bg-gold-light text-ink font-semibold text-xs tracking-wider uppercase rounded-xs transition-all flex items-center justify-center space-x-2 shadow-sm"
                    >
                      {addedBundleId === bundle.id ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-700" />
                          <span>Added to Bag!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>Order Gift Suite (৳{bundle.price.toLocaleString('en-US')})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Event & Bulk Favours Concierge */}
        <section className="bg-ink text-paper p-8 sm:p-12 rounded-[2px] border border-gold/30">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <span className="text-[11px] font-semibold text-gold tracking-[0.2em] uppercase">
                Custom Favours & Corporate Gifting
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif text-paper">
                Hosting a Holud, Sangeet, or Corporate Gala?
              </h3>
              <p className="text-xs sm:text-sm text-paper/75 leading-relaxed max-w-2xl">
                We craft personalized bangle bundles, custom velvet trays, and monogrammed presentation boxes in quantities of 20 to 500+ sets. Delivered directly to your venue in Dhaka, Chittagong, Sylhet, or any district with advance coordination.
              </p>
              <div className="pt-2 flex flex-wrap gap-4 text-xs text-gold-light">
                <span>✓ Custom velvet ribbon colors</span>
                <span>✓ Custom wax seal monograms</span>
                <span>✓ Bulk tiered pricing</span>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-start lg:justify-end">
              <a
                href="https://wa.me/8801577731381?text=Hi%20Adorous%20Fashion,%20I%20am%20inquiring%20about%20custom%20wedding%20favours%20/%20bulk%20gifting."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 bg-gold hover:bg-gold-light text-ink font-semibold text-xs tracking-wider uppercase rounded-xs transition-all flex items-center justify-center space-x-2 shadow-lg"
              >
                <MessageCircle className="w-4 h-4 text-emerald-900" />
                <span>Consult Gift Concierge</span>
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
