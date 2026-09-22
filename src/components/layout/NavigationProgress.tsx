'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [showMicroBadge, setShowMicroBadge] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const badgeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentUrlRef = useRef<string>('');

  // Start the loading animation immediately
  const startLoading = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current);

    setVisible(true);
    setProgress(20);

    // If loading takes > 300ms, show subtle floating Atelier micro-badge
    badgeTimerRef.current = setTimeout(() => {
      setShowMicroBadge(true);
    }, 300);

    // Gradually tick forward with decelerating steps towards 85%
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev < 50) return prev + 12;
        if (prev < 70) return prev + 6;
        if (prev < 85) return prev + 2;
        return prev;
      });
    }, 180);
  }, []);

  // Complete the loading animation smoothly
  const completeLoading = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current);

    setProgress(100);
    setShowMicroBadge(false);

    // Fade out after reaching 100%
    const fadeTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setProgress(0);
      }, 300);
    }, 220);

    return () => clearTimeout(fadeTimer);
  }, []);

  // Track route changes
  useEffect(() => {
    const fullUrl = `${pathname}${searchParams ? '?' + searchParams.toString() : ''}`;
    
    // On first mount, set current url without starting animation
    if (!currentUrlRef.current) {
      currentUrlRef.current = fullUrl;
      return;
    }

    // When route changes, finish animation
    if (currentUrlRef.current !== fullUrl) {
      currentUrlRef.current = fullUrl;
      completeLoading();
    }
  }, [pathname, searchParams, completeLoading]);

  // Global click listener to intercept internal link clicks with 0ms delay
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Ignore right clicks or modifier keys (opening in new tab)
      if (
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        e.defaultPrevented
      ) {
        return;
      }

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest('a') as HTMLAnchorElement | null;

      if (!anchor) return;

      const href = anchor.getAttribute('href');
      const targetAttr = anchor.getAttribute('target');
      const download = anchor.getAttribute('download');

      // Ignore downloads, external targets, or empty links
      if (!href || targetAttr === '_blank' || download !== null) return;

      // Ignore external protocols
      if (
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:') ||
        href.startsWith('whatsapp:')
      ) {
        return;
      }

      // Check if it is an internal link
      const isInternal =
        href.startsWith('/') ||
        (href.startsWith('http') && href.startsWith(window.location.origin));

      if (!isInternal) return;

      // Extract target pathname and search
      try {
        const targetUrl = new URL(href, window.location.href);
        const currentUrl = new URL(window.location.href);

        // Ignore if clicking on anchor on the same page (#something)
        if (
          targetUrl.pathname === currentUrl.pathname &&
          targetUrl.search === currentUrl.search &&
          targetUrl.hash
        ) {
          return;
        }

        // Ignore if navigating to identical exact path and query
        if (
          targetUrl.pathname === currentUrl.pathname &&
          targetUrl.search === currentUrl.search
        ) {
          return;
        }

        // Start loading instantly (0ms)
        startLoading();
      } catch {
        // Safe fallback
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [startLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current);
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <>
      {/* Top Metallic Gold Progress Bar */}
      <div
        className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-[2.5px] overflow-hidden"
        style={{
          opacity: visible ? 1 : 0,
          transition: 'opacity 300ms ease-out',
        }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-label="Page loading progress"
      >
        <div
          className="h-full relative"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #9C7F45 0%, #C6A96E 50%, #E4D2A8 100%)',
            boxShadow: '0 0 12px rgba(198, 169, 110, 0.8), 0 0 4px rgba(228, 210, 168, 0.95)',
            transition: 'width 220ms cubic-bezier(0.1, 0.9, 0.2, 1)',
          }}
        >
          {/* Subtle leading sparkle glow */}
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/60 blur-[1px]" />
        </div>
      </div>

      {/* Floating Atelier Monogram Micro-Badge (fades in gracefully if load exceeds 300ms) */}
      <div
        className={`fixed bottom-6 right-6 z-[99998] pointer-events-none transition-all duration-300 transform ${
          showMicroBadge && visible
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-2 scale-95'
        }`}
      >
        <div className="flex items-center gap-2.5 px-3.5 py-2 bg-paper/90 backdrop-blur-md border border-gold/40 shadow-2xl text-ink rounded-none">
          {/* Spinning gold hairline ring */}
          <div className="relative w-3.5 h-3.5 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-gold/30 border-t-gold-light gold-ring-spin" />
          </div>
          <span className="text-[11px] tracking-[0.16em] uppercase font-serif text-gold-light">
            Adorous Atelier
          </span>
        </div>
      </div>
    </>
  );
}
