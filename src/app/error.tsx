'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw, Home, Sparkles } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  retry?: () => void;
}

export default function ErrorBoundary({ error, reset, retry }: ErrorProps) {
  useEffect(() => {
    // Log error securely
    console.error('[Atelier Error Boundary]', error);
  }, [error]);

  const handleRetry = () => {
    if (typeof retry === 'function') {
      retry();
    } else if (typeof reset === 'function') {
      reset();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-paper text-ink px-4 py-16 sm:py-24">
      <div className="max-w-xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sand/60 border border-gold/40 text-gold-deep mb-2 shadow-xs">
          <Sparkles className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-gold-deep font-semibold">
            Status Code 500 · Atelier Pause
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-ink tracking-tight">
            An Unforeseen Interruption
          </h1>
        </div>

        <p className="text-sm sm:text-base text-ink/75 max-w-md mx-auto leading-relaxed font-normal">
          We encountered an unexpected moment during processing. Our atelier catalog and client desk remain fully secure.
        </p>

        {error?.digest && (
          <p className="text-[10px] font-mono text-ink/40 tracking-wider">
            Ref: {error.digest}
          </p>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleRetry}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-gold hover:bg-gold-light text-ink font-semibold text-xs tracking-widest uppercase rounded-[2px] transition-all shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-transparent hover:bg-sand text-ink border border-gold font-medium text-xs tracking-widest uppercase rounded-[2px] transition-colors"
          >
            <Home className="w-4 h-4 mr-2 text-gold-deep" />
            <span>Return to Boutique</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
