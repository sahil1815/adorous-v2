import React from 'react';

export default function ProductDetailLoading() {
  return (
    <div className="bg-paper min-h-screen py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs Skeleton */}
        <div className="flex items-center space-x-2 mb-8">
          <div className="h-3 w-10 bg-stone/60 luxury-shimmer" />
          <span className="text-stone">/</span>
          <div className="h-3 w-14 bg-stone/60 luxury-shimmer" />
          <span className="text-stone">/</span>
          <div className="h-3 w-16 bg-stone/60 luxury-shimmer" />
          <span className="text-stone">/</span>
          <div className="h-3 w-28 bg-stone/80 luxury-shimmer" />
        </div>

        {/* Main PDP Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Left Column: Architectural Warm Stone Plinth Showcase */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Display Plinth */}
            <div className="relative aspect-[4/5] bg-stone border border-line overflow-hidden shadow-sm luxury-shimmer">
              {/* Subtle Atelier Watermark Aura */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="w-24 h-24 rounded-full border border-gold/40" />
              </div>

              {/* Plinth Base Shadow Accent */}
              <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-stone-400/20 to-transparent" />
            </div>

            {/* Thumbnail Placeholders */}
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((idx) => (
                <div
                  key={idx}
                  className="aspect-[4/5] bg-stone/80 border border-line luxury-shimmer"
                />
              ))}
            </div>
          </div>

          {/* Right Column: Specifications & Purchasing Skeletons */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-4">
              {/* Category Eyebrow */}
              <div className="h-3 w-32 bg-gold/25 luxury-shimmer" />

              {/* Product Title */}
              <div className="space-y-2">
                <div className="h-8 sm:h-9 w-5/6 bg-stone luxury-shimmer" />
                <div className="h-4 w-4/6 bg-stone/60 luxury-shimmer" />
              </div>

              {/* Price & Guarantee Pill Row */}
              <div className="pt-4 border-t border-line flex items-baseline justify-between">
                <div className="h-8 w-32 bg-stone luxury-shimmer" />
                <div className="h-7 w-32 bg-sand border border-line luxury-shimmer" />
              </div>

              {/* Colourway Finishes Skeleton */}
              <div className="pt-4 space-y-3">
                <div className="flex justify-between">
                  <div className="h-3.5 w-28 bg-stone/70 luxury-shimmer" />
                  <div className="h-3.5 w-24 bg-stone/50 luxury-shimmer" />
                </div>
                <div className="flex gap-2.5">
                  <div className="h-9 w-24 bg-stone/70 border border-line rounded-[2px] luxury-shimmer" />
                  <div className="h-9 w-24 bg-stone/70 border border-line rounded-[2px] luxury-shimmer" />
                  <div className="h-9 w-24 bg-stone/70 border border-line rounded-[2px] luxury-shimmer" />
                </div>
              </div>

              {/* Dual CTA Buttons Skeleton */}
              <div className="pt-6 space-y-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Quantity Stepper Skeleton */}
                  <div className="h-12 w-24 bg-sand/80 border border-line rounded-[2px] luxury-shimmer shrink-0" />
                  {/* Add to Bag Skeleton */}
                  <div className="h-12 flex-1 bg-sand/90 border border-gold/40 rounded-[2px] luxury-shimmer" />
                  {/* Order Now Skeleton */}
                  <div className="h-12 flex-1 bg-gold/50 rounded-[2px] luxury-shimmer" />
                </div>
              </div>

              {/* Delivery Guarantee Pill Skeleton */}
              <div className="pt-4 p-3.5 bg-sand/40 border border-line space-y-2">
                <div className="h-3 w-48 bg-stone/70 luxury-shimmer" />
                <div className="h-3 w-full bg-stone/50 luxury-shimmer" />
              </div>

              {/* Accordion Rows Skeleton */}
              <div className="pt-4 space-y-3 border-t border-line">
                <div className="h-5 w-full bg-stone/40 luxury-shimmer" />
                <div className="h-5 w-full bg-stone/40 luxury-shimmer" />
                <div className="h-5 w-full bg-stone/40 luxury-shimmer" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
