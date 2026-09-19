'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface LandingPage {
  id: string;
  slug: string;
  title: string;
  headline: string;
  subtitle?: string;
  productIds: string[];
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
}

const LandingPagesContext = createContext<LandingPagesContextType | undefined>(undefined);

const STORAGE_KEY = 'adorous_landing_pages_db';

function generateId(): string {
  return `lp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

export function LandingPagesProvider({ children }: { children: React.ReactNode }) {
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPages(JSON.parse(stored));
      }
    } catch {
      console.warn('[LandingPagesContext] Failed to read from localStorage');
    }
    setIsHydrated(true);
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
    return newPage;
  }, []);

  const updatePage = useCallback((id: string, updates: LandingPageUpdateInput) => {
    setPages((prev) =>
      prev.map((page) =>
        page.id === id
          ? { ...page, ...updates, updatedAt: new Date().toISOString() }
          : page
      )
    );
  }, []);

  const deletePage = useCallback((id: string) => {
    setPages((prev) => prev.filter((page) => page.id !== id));
  }, []);

  const togglePageStatus = useCallback((id: string) => {
    setPages((prev) =>
      prev.map((page) =>
        page.id === id
          ? { ...page, isActive: !page.isActive, updatedAt: new Date().toISOString() }
          : page
      )
    );
  }, []);

  const getPageBySlug = useCallback(
    (slug: string) => pages.find((page) => page.slug === slug),
    [pages]
  );

  const isSlugAvailable = useCallback(
    (slug: string, excludeId?: string) =>
      !pages.some((page) => page.slug === slug && page.id !== excludeId),
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
