'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  LandingPageData,
  getAllLandingPages,
  upsertLandingPage,
  deleteLandingPageAction,
  syncLandingPagesFromClient,
} from '@/app/actions/landingPageActions';

export type SortOrder = 'manual' | 'most-purchased' | 'newest' | 'oldest' | 'best-rating';

export interface LandingPage {
  id: string;
  slug: string;
  title: string;
  headline: string;
  subtitle?: string;
  productIds: string[];
  sortOrder: SortOrder;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type LandingPageCreateInput = Omit<LandingPage, 'id' | 'createdAt' | 'updatedAt'>;
export type LandingPageUpdateInput = Partial<Omit<LandingPage, 'id' | 'createdAt'>>;

interface LandingPagesContextType {
  pages: LandingPage[];
  createPage: (input: LandingPageCreateInput) => LandingPage;
  updatePage: (id: string, updates: LandingPageUpdateInput) => void;
  deletePage: (id: string) => void;
  togglePageStatus: (id: string) => void;
  getPageBySlug: (slug: string) => LandingPage | undefined;
  isSlugAvailable: (slug: string, excludeId?: string) => boolean;
  refreshPages: () => Promise<void>;
}

const LandingPagesContext = createContext<LandingPagesContextType | undefined>(undefined);

const STORAGE_KEY = 'adorous_landing_pages_db';

function generateId(): string {
  return `lp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

export function LandingPagesProvider({ children }: { children: React.ReactNode }) {
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const refreshPages = useCallback(async () => {
    try {
      const serverPages = await getAllLandingPages();
      if (serverPages && serverPages.length > 0) {
        setPages(serverPages as LandingPage[]);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(serverPages));
        } catch {}
      }
    } catch (err) {
      console.warn('[LandingPagesContext] Failed to fetch server pages:', err);
    }
  }, []);

  // Hydrate on mount: database is the single authoritative source of truth
  useEffect(() => {
    let mounted = true;

    async function init() {
      // 1. Instant optimistic load from localStorage for zero layout shift
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (mounted && Array.isArray(parsed) && parsed.length > 0) {
            setPages(parsed);
          }
        }
      } catch (e) {}

      // 2. Fetch authoritative records from PostgreSQL
      try {
        const dbPages = await getAllLandingPages();
        if (mounted) {
          setPages((dbPages || []) as LandingPage[]);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dbPages || []));
          } catch {}
        }
      } catch (err) {
        console.warn('[LandingPagesContext] DB load failed:', err);
      }

      if (mounted) {
        setIsHydrated(true);
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  // Persist to localStorage on change (skip initial hydration)
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
    } catch {
      console.warn('[LandingPagesContext] Failed to write to localStorage');
    }
  }, [pages, isHydrated]);

  const createPage = useCallback((input: LandingPageCreateInput): LandingPage => {
    const now = new Date().toISOString();
    const newPage: LandingPage = {
      ...input,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setPages((prev) => [newPage, ...prev]);

    // Persist to database
    upsertLandingPage({
      id: newPage.id,
      slug: newPage.slug,
      title: newPage.title,
      headline: newPage.headline,
      subtitle: newPage.subtitle,
      productIds: newPage.productIds,
      sortOrder: newPage.sortOrder,
      isActive: newPage.isActive,
    }).catch((err) => console.error('[createPage] DB error:', err));

    return newPage;
  }, []);

  const updatePage = useCallback((id: string, updates: LandingPageUpdateInput) => {
    setPages((prev) =>
      prev.map((page) => {
        if (page.id === id) {
          const updated = { ...page, ...updates, updatedAt: new Date().toISOString() };
          // Persist to database
          upsertLandingPage({
            id: updated.id,
            slug: updated.slug,
            title: updated.title,
            headline: updated.headline,
            subtitle: updated.subtitle,
            productIds: updated.productIds,
            sortOrder: updated.sortOrder,
            isActive: updated.isActive,
          }).catch((err) => console.error('[updatePage] DB error:', err));
          return updated;
        }
        return page;
      })
    );
  }, []);

  const deletePage = useCallback((id: string) => {
    setPages((prev) => {
      const pageToDelete = prev.find((p) => p.id === id);
      if (pageToDelete) {
        deleteLandingPageAction(pageToDelete.slug).catch((err) =>
          console.error('[deletePage] DB error:', err)
        );
      }
      return prev.filter((page) => page.id !== id);
    });
  }, []);

  const togglePageStatus = useCallback((id: string) => {
    setPages((prev) =>
      prev.map((page) => {
        if (page.id === id) {
          const updated = {
            ...page,
            isActive: !page.isActive,
            updatedAt: new Date().toISOString(),
          };
          upsertLandingPage({
            id: updated.id,
            slug: updated.slug,
            title: updated.title,
            headline: updated.headline,
            subtitle: updated.subtitle,
            productIds: updated.productIds,
            sortOrder: updated.sortOrder,
            isActive: updated.isActive,
          }).catch((err) => console.error('[togglePageStatus] DB error:', err));
          return updated;
        }
        return page;
      })
    );
  }, []);

  const getPageBySlug = useCallback(
    (slug: string) => {
      if (!slug) return undefined;
      const cleanSlug = slug.trim().toLowerCase();
      return pages.find((page) => page.slug.toLowerCase() === cleanSlug);
    },
    [pages]
  );

  const isSlugAvailable = useCallback(
    (slug: string, excludeId?: string) => {
      if (!slug) return false;
      const cleanSlug = slug.trim().toLowerCase();
      return !pages.some(
        (page) => page.slug.toLowerCase() === cleanSlug && page.id !== excludeId
      );
    },
    [pages]
  );

  return (
    <LandingPagesContext.Provider
      value={{
        pages,
        createPage,
        updatePage,
        deletePage,
        togglePageStatus,
        getPageBySlug,
        isSlugAvailable,
        refreshPages,
      }}
    >
      {children}
    </LandingPagesContext.Provider>
  );
}

export function useLandingPages() {
  const context = useContext(LandingPagesContext);
  if (context === undefined) {
    throw new Error('useLandingPages must be used within a LandingPagesProvider');
  }
  return context;
}
