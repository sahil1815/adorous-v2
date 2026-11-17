import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowLeft, Compass, ShoppingBag, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Page Not Found (404) | Adorous Fashion',
  description: 'The requested piece or collection page could not be located in our atelier catalogue.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-paper text-ink px-4 py-16 sm:py-24">
      <div className="max-w-xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sand/60 border border-gold/40 text-gold-deep mb-2 shadow-xs">
          <Compass className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-gold-deep font-semibold">
            Status Code 404 · Uncharted Route
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-ink tracking-tight">
            The Piece You Seek Has Shifted
          </h1>
        </div>

        <p className="text-sm sm:text-base text-ink/75 max-w-md mx-auto leading-relaxed font-normal">
          This URL cannot be found in our current archives. The collection may have been renamed, archived, or moved within our boutique.
        </p>

        {/* Suggested Collections */}
        <div className="pt-4 pb-2">
          <p className="text-xs font-serif uppercase tracking-widest text-ink/60 mb-3">
            Explore Curated Collections
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <Link
              href="/jewelry"
              className="px-3.5 py-1.5 bg-paper hover:bg-sand border border-line rounded-[2px] transition-colors text-ink"
            >
              Jewelry Sets
            </Link>
            <Link
              href="/churi"
              className="px-3.5 py-1.5 bg-paper hover:bg-sand border border-line rounded-[2px] transition-colors text-ink"
            >
              Churi (Bangles)
            </Link>
            <Link
              href="/bags"
              className="px-3.5 py-1.5 bg-paper hover:bg-sand border border-line rounded-[2px] transition-colors text-ink"
            >
              Ladies' Bags
            </Link>
            <Link
              href="/earrings"
              className="px-3.5 py-1.5 bg-paper hover:bg-sand border border-line rounded-[2px] transition-colors text-ink"
            >
              Earrings
            </Link>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-gold hover:bg-gold-light text-ink font-semibold text-xs tracking-widest uppercase rounded-[2px] transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>Return to Homepage</span>
          </Link>
          <Link
            href="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-transparent hover:bg-sand text-ink border border-gold font-medium text-xs tracking-widest uppercase rounded-[2px] transition-colors"
          >
            <ShoppingBag className="w-4 h-4 mr-2 text-gold-deep" />
            <span>Browse Full Catalogue</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
