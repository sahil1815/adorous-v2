import React from 'react';
import Image from 'next/image';

export default function RootLoading() {
  return (
    <div
      className="min-h-[75vh] w-full flex flex-col items-center justify-center bg-paper px-4 py-20 select-none"
      aria-label="Loading Adorous Fashion"
    >
      {/* Emblem & Rotating Hairline Gold Ring */}
      <div className="relative w-28 h-28 flex items-center justify-center">
        {/* Ambient Warm Golden Glow Halo */}
        <div className="absolute inset-2 rounded-full bg-gold/10 blur-xl animate-pulse" />

        {/* Outer Rotating Hairline Gold Ring */}
        <div className="absolute inset-0 rounded-full border border-gold/25 border-t-gold border-r-gold/60 gold-ring-spin" />

        {/* Inner Subtle Secondary Concentric Ring */}
        <div className="absolute inset-3 rounded-full border border-gold-light/40 opacity-40" />

        {/* Adorous Gold "AF" Monogram with Gentle Breathing Pulse */}
        <div className="relative w-14 h-14 flex items-center justify-center gold-monogram-pulse">
          <Image
            src="/images/logo/logo-monogram.png"
            alt="Adorous Atelier Emblem"
            width={52}
            height={52}
            priority
            className="object-contain drop-shadow-sm"
          />
        </div>
      </div>

      {/* Luxury Typography */}
      <div className="mt-7 text-center">
        <h2 className="font-serif text-2xl sm:text-3xl tracking-[0.28em] uppercase gold-gradient-text font-medium">
          Adorous
        </h2>
        <p className="text-[10px] tracking-[0.32em] uppercase text-text-muted mt-2 font-medium">
          Curating Atelier Pieces
        </p>
      </div>

      {/* Indeterminate Gold Shimmer Bar */}
      <div className="mt-6 w-32 h-[1.5px] bg-line/80 gold-indeterminate-bar rounded-full" />
    </div>
  );
}
