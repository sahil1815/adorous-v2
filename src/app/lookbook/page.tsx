import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { getLookbookLooks, getLookbookSettings } from '@/app/actions/lookbookActions';
import { getAllProducts } from '@/app/actions/productActions';
import { ProductCategory, Product } from '@/types';
import { PRODUCTS } from '@/data/catalogue';
import LookbookClient from '@/components/lookbook/LookbookClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getLookbookSettings();
  return {
    title: `${settings.pageTitle} | Adorous Fashion Dhaka`,
    description: settings.pageDescription,
  };
}

export default async function LookbookPage() {
  const [looks, settings, rawProducts] = await Promise.all([
    getLookbookLooks(false),
    getLookbookSettings(),
    getAllProducts(),
  ]);

  const allAvailable: Product[] =
    rawProducts && rawProducts.length > 0
      ? rawProducts.map((p: any) => ({
          ...p,
          category: p.category as ProductCategory,
          description: p.description ?? '',
          tagline: p.tagline ?? '',
          originalPrice: p.originalPrice ?? undefined,
          featuredRank: p.featuredRank ?? 999,
          details: Array.isArray(p.details)
            ? p.details.map((d: any) => (typeof d === 'string' ? d : d.text))
            : [],
          piecesIncluded: Array.isArray(p.piecesIncluded)
            ? p.piecesIncluded.map((pi: any) => (typeof pi === 'string' ? pi : pi.text))
            : [],
          galleryImages: Array.isArray(p.galleryImages)
            ? p.galleryImages.map((gi: any) => (typeof gi === 'string' ? gi : gi.url))
            : [p.featuredImage],
          seoKeywords: p.seoKeywords
            ? typeof p.seoKeywords === 'string'
              ? p.seoKeywords.split(',')
              : p.seoKeywords
            : [],
          colorways: (p.colorways || []).map((cw: any) => ({
            id: cw.colorId || cw.id,
            name: cw.name,
            hex: cw.hex,
            inStock: cw.inStock ?? true,
            image: cw.image || null,
          })),
        }))
      : PRODUCTS;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-paper flex items-center justify-center text-xs text-text-muted">
          Loading Atelier Lookbook...
        </div>
      }
    >
      <LookbookClient looks={looks} settings={settings} products={allAvailable} />
    </Suspense>
  );
}
