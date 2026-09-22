'use client';

import React from 'react';
import { notFound } from 'next/navigation';
import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLandingPages } from '@/context/LandingPagesContext';
import { PRODUCTS } from '@/data/catalogue';
import { Product } from '@/types';
import ProductCard from '@/components/ui/ProductCard';
import { Sparkles } from 'lucide-react';

interface PromoPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function PromoPage({ params }: PromoPageProps) {
  const { slug } = use(params);
  const { getPageBySlug } = useLandingPages();
  const page = getPageBySlug(slug);

  if (!page || !page.isActive) {
    notFound();
  }

  // Resolve the selected products from the catalogue, preserving selection order
  const products: Product[] = page.productIds
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter((p): p is Product => p !== undefined);

  return (
    <div className="min-h-screen bg-paper">
      {/* Hero Section */}
      <section className="relative bg-sand text-ink overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(198,169,110,0.3),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(198,169,110,0.15),transparent_50%)]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          {/* Small brand chip */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-gold/10 border border-gold/25 rounded-full mb-6">
            <Sparkles className="w-3 h-3 text-gold" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-gold font-medium">Adorous Exclusive</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-ink tracking-wide leading-tight">
            {page.headline}
          </h1>

          {page.subtitle && (
            <p className="mt-4 text-base sm:text-lg text-ink/60 max-w-2xl mx-auto leading-relaxed">
              {page.subtitle}
            </p>
          )}

          {/* Decorative line */}
          <div className="mt-8 mx-auto w-16 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm text-text-muted">This collection is being updated. Please check back soon.</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-10">
              <p className="text-xs uppercase tracking-[0.2em] text-text-muted">
                {products.length} curated piece{products.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Bottom CTA */}
      <section className="bg-stone border-t border-line/50 py-12 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-text-muted mb-4">
          Explore The Full Collection
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center space-x-2 px-8 py-3 bg-sand text-gold border border-gold/30 hover:bg-sand/90 hover:border-gold/50 transition-colors text-sm font-medium tracking-wider uppercase"
        >
          <span>Visit Our Shop</span>
        </Link>

        <div className="mt-8 flex flex-col items-center space-y-2">
          <p className="text-[11px] text-text-muted">
            Free delivery on orders above ৳2,000 · Cash on Delivery across Bangladesh
          </p>
        </div>
      </section>
    </div>
  );
}
