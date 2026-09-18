'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, ShieldCheck, Truck } from 'lucide-react';

const MESSAGES = [
  { text: "Cash on Delivery across all 64 districts in Bangladesh", icon: ShieldCheck },
  { text: "Complimentary door-to-door delivery on orders over ৳2,000", icon: Truck },
  { text: "Curated limited pieces · WhatsApp order confirmation before dispatch", icon: Sparkles },
];

export default function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const isDismissed = localStorage.getItem('adorous_announcement_dismissed');
    if (isDismissed === 'true') {
      setIsVisible(false);
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('adorous_announcement_dismissed', 'true');
  };

  if (!isVisible) return null;

  const current = MESSAGES[currentIndex];
  const Icon = current.icon;

  return (
    <div className="bg-ink text-gold-light text-xs tracking-wider uppercase border-b border-gold/20 relative z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 py-2 sm:py-2.5 flex items-center justify-between">
        <div className="flex-1 flex items-center justify-center space-x-2 text-center overflow-hidden">
          <Icon className="w-3.5 h-3.5 text-gold shrink-0 animate-pulse" />
          <span className="font-medium text-[11px] sm:text-xs truncate transition-opacity duration-300">
            {current.text}
          </span>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gold/60 hover:text-gold p-1 shrink-0 ml-2 transition-colors focus:outline-none"
          aria-label="Dismiss announcement"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
