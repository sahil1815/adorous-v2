'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PRODUCTS } from '@/data/catalogue';
import { useCart } from '@/context/CartContext';
import { Sparkles, ShoppingBag, ArrowRight, Check, ShieldCheck, Heart } from 'lucide-react';

interface LookbookLook {
  id: string;
  numeral: string;
  title: string;
  tagline: string;
  description: string;
  heroImage: string;
  palette: { name: string; hex: string }[];
  itemIds: string[];
}

const LOOKBOOK_LOOKS: LookbookLook[] = [
  {
    id: 'look-01',
    numeral: 'LOOK I',
    title: 'The Regal Zamindar Suite',
    tagline: '22k Antique Filigree on Architectural Limestone Plinths',
    description:
      'Inspired by the grand zamindar palaces of Bengal. Heavy antique gold choker with hand-strung micro-pearls pairs with our signature imperial emerald velvet bangles and an architectural charcoal top-handle.',
    heroImage: '/images/hero/hero-still-life.jpg',
    palette: [
      { name: 'Antique Gold', hex: '#C6A96E' },
      { name: 'Imperial Emerald', hex: '#1A5632' },
      { name: 'Charcoal Black', hex: '#22262B' },
      { name: 'Limestone Sand', hex: '#DDD6CB' },
    ],
    itemIds: ['jewel-01', 'churi-01', 'bag-01'],
  },
  {
    id: 'look-02',
    numeral: 'LOOK II',
    title: 'Old Dhaka Twilight Baithak',
    tagline: 'Heritage Hasli Collars on Midnight Velvet Pedestals',
    description:
      'Rigid geometric collar chokers cast in lightweight hollow core hug the collarbone, flanked by multi-tiered chandelier jhumkas and midnight charcoal accessories.',
    heroImage: '/images/products/jewelry-zari-choker.jpg',
    palette: [
      { name: 'Matte Brass', hex: '#B89758' },
      { name: 'Pearl Ivory', hex: '#F3EDE2' },
      { name: 'Warm Stone', hex: '#DDD6CB' },
    ],
    itemIds: ['jewel-02', 'ear-01', 'bag-02'],
  },
  {
    id: 'look-03',
    numeral: 'LOOK III',
    title: 'Monsoon Serenade in Gulshan',
    tagline: 'Hand-Turned Chestnut Wood & Rainproof High-Density Silk',
    description:
      'Rainy days in Dhaka demand unapologetic elegance. Our UV50+ windproof umbrella with hand-turned chestnut curved handle pairs seamlessly with our structured tote.',
    heroImage: '/images/products/bag-gulshan-charcoal.jpg',
    palette: [
      { name: 'Chestnut Wood', hex: '#5A321E' },
      { name: 'Midnight Charcoal', hex: '#22262B' },
      { name: 'Champagne Gold', hex: '#DFCC9F' },
    ],
    itemIds: ['umb-01', 'bag-01', 'jewel-03'],
  },
  {
    id: 'look-04',
    numeral: 'LOOK IV',
    title: 'Mehendi & Sangeet Emeralds',
    tagline: 'Plush Velvet Stacks & Bell Jhumkas on Suede Trays',
    description:
      'The rhythmic clinking of velvet and gold churis. Paired with ornate bell jhumkas weighted for graceful movement without earlobe fatigue.',
    heroImage: '/images/products/churi-meher-emerald.jpg',
    palette: [
      { name: 'Emerald Velvet', hex: '#164A2B' },
      { name: 'Antique 22k Gold', hex: '#C6A96E' },
      { name: 'Crimson Ruby', hex: '#7B1925' },
    ],
    itemIds: ['churi-01', 'ear-01', 'churi-02'],
  },
];

export default function LookbookPage() {
  const { addToCart } = useCart();
  const [addedLookId, setAddedLookId] = useState<string | null>(null);

  const handleAddLookToBag = (look: LookbookLook) => {
    const productsToAdd = PRODUCTS.filter((p) => look.itemIds.includes(p.id));
    productsToAdd.forEach((p) => {
      addToCart(p, p.colorways[0], p.sizes ? p.sizes[1] || p.sizes[0] : undefined, 1);
    });

    setAddedLookId(look.id);
    setTimeout(() => setAddedLookId(null), 2200);
  };

  return (
    <div className="bg-paper min-h-screen">
      {/* Editorial Header */}
      <section className="border-b border-line bg-[#F8F6F0] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <nav className="flex items-center justify-center space-x-2 text-xs text-text-muted tracking-wider uppercase mb-2">
            <Link href="/" className="hover:text-ink transition-colors">Home</Link>
            <span>/</span>
            <span className="text-ink font-medium">The Lookbook</span>
          </nav>

          <span className="text-[11px] font-semibold tracking-[0.25em] text-gold-ink uppercase">
            Curated Still Life Harmonies
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif text-ink font-normal tracking-tight">
            The Atelier Lookbook
          </h1>
          <p className="text-xs sm:text-sm text-text-muted max-w-2xl mx-auto leading-relaxed">
            Every ensemble is photographed as a still life study on architectural warm stone plinths, velvet neckforms, and keepsake trays. Discover how our jewelry, bangles, and boutique bags unite into harmonious festival ensembles.
          </p>
        </div>
      </section>

      {/* Looks Showcase */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-24 sm:space-y-32">
        {LOOKBOOK_LOOKS.map((look, index) => {
          const lookProducts = PRODUCTS.filter((p) => look.itemIds.includes(p.id));
          const ensembleTotal = lookProducts.reduce((sum, p) => sum + p.price, 0);
          const isReversed = index % 2 === 1;

          return (
            <article
              key={look.id}
              className="border-b border-line pb-20 sm:pb-24 last:border-b-0"
            >
              <div
                className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center ${
                  isReversed ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Visual Anchor: Large Still-Life Editorial */}
                <div className={`lg:col-span-7 ${isReversed ? 'lg:order-2' : 'lg:order-1'}`}>
                  <div className="relative aspect-[4/5] sm:aspect-[16/11] lg:aspect-[4/5] bg-stone rounded-[2px] overflow-hidden border border-line shadow-sm group">
                    <Image
                      src={look.heroImage}
                      alt={`${look.title} Still Life Ensemble`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover object-center group-hover:scale-102 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />

                    {/* Bottom Floating Bar */}
                    <div className="absolute bottom-4 left-4 right-4 text-paper flex items-end justify-between">
                      <div>
                        <span className="text-[10px] tracking-[0.2em] uppercase text-gold-light font-semibold">
                          {look.numeral}
                        </span>
                        <h2 className="text-xl sm:text-2xl font-serif text-white">
                          {look.title}
                        </h2>
                      </div>
                      <div className="bg-ink/80 backdrop-blur-sm px-3 py-1.5 rounded-xs border border-white/10 text-right">
                        <div className="text-[9px] uppercase tracking-wider text-paper/70">Ensemble Total</div>
                        <div className="text-sm font-semibold text-gold-light tabular-nums">
                          ৳{ensembleTotal.toLocaleString('en-US')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Editorial Description & Piece Breakdown */}
                <div className={`lg:col-span-5 space-y-6 ${isReversed ? 'lg:order-1' : 'lg:order-2'}`}>
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-gold-ink tracking-[0.2em] uppercase">
                      {look.numeral} · Still Life Study
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif text-ink">
                      {look.title}
                    </h2>
                    <p className="text-xs font-medium text-gold-deep tracking-wide uppercase">
                      {look.tagline}
                    </p>
                    <p className="text-xs sm:text-sm text-text-muted leading-relaxed pt-1">
                      {look.description}
                    </p>
                  </div>

                  {/* Curated Color Swatches */}
                  <div>
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-text-muted block mb-2">
                      Harmonious Tones:
                    </span>
                    <div className="flex items-center gap-2">
                      {look.palette.map((pal, pIdx) => (
                        <div key={pIdx} className="flex items-center gap-1.5 text-xs text-ink/80">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/20"
                            style={{ backgroundColor: pal.hex }}
                          />
                          <span className="text-[11px]">{pal.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Included Items Checklist */}
                  <div className="space-y-3 pt-2">
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-text-muted block">
                      Ensemble Breakdown ({lookProducts.length} Pieces):
                    </span>

                    <div className="divide-y divide-line border border-line bg-sand/30 rounded-xs">
                      {lookProducts.map((prod) => (
                        <div
                          key={prod.id}
                          className="p-3 flex items-center justify-between gap-3 hover:bg-sand/60 transition-colors"
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <div className="relative w-12 h-12 rounded-xs overflow-hidden bg-stone shrink-0 border border-line">
                              <Image
                                src={prod.featuredImage}
                                alt={prod.name}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <Link
                                href={`/${prod.category}/${prod.slug}`}
                                className="text-xs font-medium text-ink hover:text-gold-deep truncate block"
                              >
                                {prod.name}
                              </Link>
                              <span className="text-[10px] text-text-muted block">
                                {prod.categoryLabel} · {prod.colorways[0]?.name}
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-xs font-semibold text-ink tabular-nums">
                              ৳{prod.price.toLocaleString('en-US')}
                            </div>
                            <Link
                              href={`/${prod.category}/${prod.slug}`}
                              className="text-[10px] text-gold-deep hover:underline inline-flex items-center gap-0.5"
                            >
                              <span>View</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => handleAddLookToBag(look)}
                      className="flex-1 py-3 bg-gold hover:bg-gold-light text-ink font-semibold text-xs tracking-wider uppercase rounded-xs transition-all flex items-center justify-center space-x-2 shadow-sm"
                    >
                      {addedLookId === look.id ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-700" />
                          <span>All {lookProducts.length} Pieces Added!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>Add Entire Look to Bag (৳{ensembleTotal.toLocaleString('en-US')})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </main>

      {/* Still-Life Photography Promise */}
      <section className="bg-ink text-paper py-14 sm:py-16 border-t border-line">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <span className="text-[11px] font-semibold text-gold tracking-[0.25em] uppercase">
            The Adorous Aesthetic Philosophy
          </span>
          <h3 className="text-2xl sm:text-3xl font-serif text-paper">
            Purity of Craft: Pure Still Life Photography
          </h3>
          <p className="text-xs sm:text-sm text-paper/70 leading-relaxed">
            At Adorous Fashion, we celebrate the beauty of South Asian jewelry, velvet churi stacks, and curated leather accessories. By capturing every piece exclusively on warm limestone plinths, velvet neckforms, and display trays, we let the design details and textures speak with total clarity.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-gold-light">
            <span>✓ Zero Human Distractions</span>
            <span>✓ True-to-Life Color Accuracy</span>
            <span>✓ 100% Still Life Product Detail</span>
          </div>
        </div>
      </section>
    </div>
  );
}
