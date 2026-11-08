'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  Package,
  Layers,
  Users,
  ShoppingBag,
  Truck,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Command,
} from 'lucide-react';
import { ADMIN_NAV_SECTIONS, AdminNavItem } from './adminNavConfig';

interface AdminQuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminQuickSearchModal({
  isOpen,
  onClose,
}: AdminQuickSearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Flatten all items with section context
  const allNavItems = useMemo(() => {
    const list: { section: string; item: AdminNavItem }[] = [];
    ADMIN_NAV_SECTIONS.forEach((section) => {
      section.items.forEach((item) => {
        list.push({ section: section.title, item });
      });
    });
    return list;
  }, []);

  // Filter items based on query
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allNavItems;

    return allNavItems.filter(({ section, item }) => {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchSection = section.toLowerCase().includes(q);
      const matchPath = item.href.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchSection || matchPath;
    });
  }, [allNavItems, query]);

  // Determine if query looks like an order ID or phone
  const isOrderOrPhoneQuery = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return false;
    return q.startsWith('AF') || /^\d{3,}/.test(q) || q.includes('-');
  }, [query]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems, query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Global keydown listener for Escape and Arrow keys
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalCount = filteredItems.length + (isOrderOrPhoneQuery ? 2 : 0);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, totalCount));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + totalCount) % Math.max(1, totalCount));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelectActive();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const handleSelectActive = () => {
    const cleanQ = query.trim();

    if (isOrderOrPhoneQuery && selectedIndex === 0) {
      // Action 1: Search Orders
      router.push(`/admin?q=${encodeURIComponent(cleanQ)}`);
      onClose();
      return;
    }

    if (isOrderOrPhoneQuery && selectedIndex === 1) {
      // Action 2: Search Customers
      router.push(`/admin/customers?search=${encodeURIComponent(cleanQ)}`);
      onClose();
      return;
    }

    const itemIndex = isOrderOrPhoneQuery ? selectedIndex - 2 : selectedIndex;
    const target = filteredItems[itemIndex];
    if (target) {
      router.push(target.item.href);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#141414] border border-gold/30 rounded-xs shadow-2xl overflow-hidden flex flex-col text-paper animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3 bg-[#171717]">
          <Search className="w-5 h-5 text-gold shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type page name, order ID (AF-...), phone, or section..."
            className="w-full bg-transparent text-sm text-paper placeholder:text-paper/40 focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-paper/40 hover:text-paper transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-xs bg-white/5 border border-white/10 text-[10px] text-paper/40 font-mono">
              <span>ESC</span>
            </div>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1 divide-y divide-white/5 scrollbar-thin">
          {/* Direct Order / Customer Search Quick Actions */}
          {isOrderOrPhoneQuery && (
            <div className="pb-2 space-y-1">
              <button
                type="button"
                onClick={() => {
                  router.push(`/admin?q=${encodeURIComponent(query.trim())}`);
                  onClose();
                }}
                className={`w-full px-3 py-2.5 rounded-xs text-left text-xs flex items-center justify-between transition-colors ${
                  selectedIndex === 0
                    ? 'bg-gold text-ink font-bold shadow-sm'
                    : 'bg-gold/10 hover:bg-gold/20 text-gold-light'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4" />
                  <span>
                    Search Orders for <strong className="font-mono">"{query.trim()}"</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono uppercase opacity-75">
                  <span>Jump</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  router.push(`/admin/customers?search=${encodeURIComponent(query.trim())}`);
                  onClose();
                }}
                className={`w-full px-3 py-2.5 rounded-xs text-left text-xs flex items-center justify-between transition-colors ${
                  selectedIndex === 1
                    ? 'bg-gold text-ink font-bold shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 text-paper/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4" />
                  <span>
                    Search Customers for <strong className="font-mono">"{query.trim()}"</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono uppercase opacity-75">
                  <span>Jump</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            </div>
          )}

          {/* Nav Items List */}
          {filteredItems.length === 0 && !isOrderOrPhoneQuery ? (
            <div className="py-10 text-center text-paper/40 text-xs">
              No matching admin tools found for "{query}".
            </div>
          ) : (
            filteredItems.map(({ section, item }, idx) => {
              const adjustedIndex = isOrderOrPhoneQuery ? idx + 2 : idx;
              const isSelected = selectedIndex === adjustedIndex;
              const Icon = item.icon;

              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => {
                    router.push(item.href);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(adjustedIndex)}
                  className={`w-full px-3 py-2.5 rounded-xs text-left transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-gold text-ink font-semibold shadow-sm'
                      : 'hover:bg-white/5 text-paper/80'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-1.5 rounded-xs shrink-0 ${
                        isSelected
                          ? 'bg-ink/15 text-ink'
                          : 'bg-[#1F1F1F] text-gold border border-gold/20'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold tracking-tight block">
                          {item.title}
                        </span>
                        <span
                          className={`text-[9px] uppercase px-1.5 py-0.2 rounded-xs font-mono font-medium ${
                            isSelected
                              ? 'bg-ink/20 text-ink'
                              : 'bg-white/5 text-paper/40 border border-white/10'
                          }`}
                        >
                          {section}
                        </span>
                      </div>
                      {item.description && (
                        <p
                          className={`text-[11px] truncate mt-0.5 ${
                            isSelected ? 'text-ink/80' : 'text-paper/40'
                          }`}
                        >
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <ArrowRight
                    className={`w-3.5 h-3.5 shrink-0 ml-2 ${
                      isSelected ? 'text-ink' : 'text-paper/30'
                    }`}
                  />
                </button>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="px-4 py-2.5 bg-[#101010] border-t border-white/10 flex items-center justify-between text-[11px] text-paper/40">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded-xs bg-white/5 border border-white/10 text-[9px] font-mono">
                ↑
              </kbd>
              <kbd className="px-1 py-0.5 rounded-xs bg-white/5 border border-white/10 text-[9px] font-mono">
                ↓
              </kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded-xs bg-white/5 border border-white/10 text-[9px] font-mono">
                ↵
              </kbd>
              <span>Select</span>
            </span>
          </div>
          <span className="text-[10px] text-gold-light/60">Adorous Atelier Command Bar</span>
        </div>
      </div>
    </div>
  );
}
