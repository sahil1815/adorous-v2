'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRight, Sparkles, Tag } from 'lucide-react';
import { useInventory } from '@/context/InventoryContext';
import { Product } from '@/types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const { allProducts, getEffectiveProduct } = useInventory();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Filter products
  const matchingProducts: Product[] = query.trim() === ''
    ? []
    : allProducts
        .map(getEffectiveProduct)
        .filter((p) => {
          const q = query.toLowerCase();
          return (
            p.name.toLowerCase().includes(q) ||
            p.tagline.toLowerCase().includes(q) ||
            p.categoryLabel.toLowerCase().includes(q) ||
            p.seoKeywords.some((k) => k.toLowerCase().includes(q)) ||
            p.colorways.some((c) => c.name.toLowerCase().includes(q))
          );
        }).slice(0, 6);

  const quickSearches = [
    'Zari Bridal Choker',
    'Velvet Churi',
    'Polki Pendant',
    'Architectural Bag',
    'Windproof Umbrella',
    'Emerald',
    'Hasli',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-start pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-sand/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-paper border border-gold/30 shadow-2xl rounded-[2px] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-line flex items-center gap-3 bg-sand/20">
          <Search className="w-5 h-5 text-gold-deep shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search jewelry, churi stacks, bags, more..."
            className="w-full bg-transparent text-sm sm:text-base text-ink placeholder:text-text-muted focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-text-muted hover:text-ink transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-2 py-1 text-[11px] uppercase tracking-wider text-text-muted hover:text-ink transition-colors border border-line rounded-xs"
            >
              ESC
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="max-h-[65vh] overflow-y-auto p-4 sm:p-6 divide-y divide-line">
          {query.trim() === '' ? (
            /* Quick Suggestions */
            <div className="space-y-4">
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                Popular Searches
              </span>
              <div className="flex flex-wrap gap-2">
                {quickSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sand/40 hover:bg-sand border border-line text-xs text-ink transition-colors rounded-xs"
                  >
                    <Tag className="w-3 h-3 text-gold-deep" />
                    <span>{term}</span>
                  </button>
                ))}
              </div>

              {/* Curated Category Shortcuts */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <Link
                  href="/jewelry"
                  onClick={onClose}
                  className="p-3 bg-paper border border-line hover:border-gold/60 text-center rounded-xs transition-colors"
                >
                  <span className="font-medium text-ink block">Jewelry Sets</span>
                  <span className="text-[10px] text-text-muted">4 Designs</span>
                </Link>
                <Link
                  href="/churi"
                  onClick={onClose}
                  className="p-3 bg-paper border border-line hover:border-gold/60 text-center rounded-xs transition-colors"
                >
                  <span className="font-medium text-ink block">Churi Stacks</span>
                  <span className="text-[10px] text-text-muted">4 Designs</span>
                </Link>
                <Link
                  href="/bags"
                  onClick={onClose}
                  className="p-3 bg-paper border border-line hover:border-gold/60 text-center rounded-xs transition-colors"
                >
                  <span className="font-medium text-ink block">Ladies' Bags</span>
                  <span className="text-[10px] text-text-muted">4 Designs</span>
                </Link>
                <Link
                  href="/more"
                  onClick={onClose}
                  className="p-3 bg-paper border border-line hover:border-gold/60 text-center rounded-xs transition-colors"
                >
                  <span className="font-medium text-ink block">More</span>
                  <span className="text-[10px] text-text-muted">Lifestyle & Accessories</span>
                </Link>
              </div>
            </div>
          ) : matchingProducts.length === 0 ? (
            /* No Results */
            <div className="text-center py-10 space-y-2">
              <p className="text-sm font-medium text-ink">No designs found for "{query}"</p>
              <p className="text-xs text-text-muted">
                Try searching for 'choker', 'emerald', 'velvet', or 'bag'.
              </p>
              <div className="pt-2">
                <Link
                  href="/shop"
                  onClick={onClose}
                  className="text-xs text-gold-deep hover:underline font-medium inline-flex items-center gap-1"
                >
                  <span>Browse all 15 designs</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ) : (
            /* Matching Results */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] text-text-muted uppercase tracking-wider">
                <span>Matching Pieces ({matchingProducts.length})</span>
                <Link
                  href={`/shop?q=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  className="text-gold-deep hover:underline lowercase tracking-normal"
                >
                  view all results
                </Link>
              </div>

              <div className="space-y-2">
                {matchingProducts.map((p) => (
                  <Link
                    key={p.id}
                    href={`/${p.category}/${p.slug}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-xs hover:bg-sand/50 transition-colors group"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="relative w-12 h-14 bg-stone rounded-xs overflow-hidden shrink-0 border border-line">
                        <Image
                          src={p.featuredImage}
                          alt={p.name}
                          fill
                          sizes="48px"
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] tracking-wider uppercase text-text-muted font-medium block">
                          {p.categoryLabel}
                        </span>
                        <h4 className="text-xs sm:text-sm font-medium text-ink group-hover:text-gold-deep transition-colors truncate">
                          {p.name}
                        </h4>
                        <p className="text-[11px] text-text-muted truncate">
                          {p.tagline}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-3">
                      <span className="text-xs font-semibold text-ink tabular-nums block">
                        ৳{p.price.toLocaleString('en-US')}
                      </span>
                      {p.originalPrice && (
                        <span className="text-[10px] text-text-muted line-through tabular-nums block">
                          ৳{p.originalPrice.toLocaleString('en-US')}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-sand/30 border-t border-line text-[11px] text-text-muted flex items-center justify-between">
          <span>Free delivery on orders over ৳2,000 across Bangladesh</span>
          <span className="font-mono text-[10px]">Adorous Search</span>
        </div>
      </div>
    </div>
  );
}
