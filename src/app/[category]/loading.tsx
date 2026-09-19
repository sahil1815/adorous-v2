import React from 'react';

export default function CategoryLoading() {
  return (
    <div className="bg-paper min-h-screen">
      {/* Category Hero Skeleton */}
      <section className="border-b border-line bg-sand/30 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Skeleton */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="h-3 w-10 bg-stone/60 luxury-shimmer" />
            <span className="text-stone">/</span>
            <div className="h-3 w-16 bg-stone/80 luxury-shimmer" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content Skeleton */}
            <div className="lg:col-span-7 space-y-3 sm:space-y-4">
              <div className="h-3 w-28 bg-gold/25 luxury-shimmer" />
              <div className="h-9 sm:h-12 w-3/4 max-w-md bg-stone luxury-shimmer" />
              <div className="space-y-2 max-w-xl pt-1">
                <div className="h-4 w-full bg-stone/70 luxury-shimmer" />
                <div className="h-4 w-5/6 bg-stone/50 luxury-shimmer" />
              </div>
              <div className="pt-2 flex items-center gap-4">
                <div className="h-4 w-32 bg-stone/60 luxury-shimmer" />
                <div className="h-4 w-48 bg-stone/60 luxury-shimmer" />
              </div>
            </div>

            {/* Right Still Life Image Banner Skeleton */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[16/9] sm:aspect-[21/9] lg:aspect-[4/3] rounded-[2px] border border-line bg-stone luxury-shimmer overflow-hidden">
                <div className="absolute bottom-3 left-3 right-3 flex justify-between">
                  <div className="h-3 w-28 bg-paper/40" />
                  <div className="h-3 w-24 bg-paper/40" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Toolbar Skeleton */}
      <div className="border-b border-line py-3 bg-paper">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-6 w-12 rounded-full bg-stone/80 luxury-shimmer" />
            <div className="h-5 w-5 rounded-full bg-stone/70 luxury-shimmer" />
            <div className="h-5 w-5 rounded-full bg-stone/70 luxury-shimmer" />
            <div className="h-5 w-5 rounded-full bg-stone/70 luxury-shimmer" />
          </div>
          <div className="h-6 w-28 bg-stone/60 luxury-shimmer" />
        </div>
      </div>

      {/* Product Cards Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div
              key={item}
              className="flex flex-col bg-paper border border-line/70 overflow-hidden"
            >
              {/* Warm Stone Plinth Placeholder */}
              <div className="relative aspect-[4/5] bg-stone luxury-shimmer">
                {/* Subtle Luxury Corner Accent */}
                <div className="absolute top-2.5 left-2.5 w-14 h-4 bg-paper/40" />
              </div>

              {/* Details Skeleton */}
              <div className="p-3.5 sm:p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="h-2.5 w-16 bg-stone/60 luxury-shimmer" />
                  <div className="h-4 w-4/5 bg-stone luxury-shimmer" />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="h-4 w-16 bg-stone luxury-shimmer" />
                  <div className="flex gap-1">
                    <div className="w-3.5 h-3.5 rounded-full bg-stone/70 luxury-shimmer" />
                    <div className="w-3.5 h-3.5 rounded-full bg-stone/70 luxury-shimmer" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
