import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { getAllProducts } from '@/app/actions/productActions';
import { ProductCategory, Product } from '@/types';
import ShopClient from '@/components/shop/ShopClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'The Full Collection | Adorous Fashion Dhaka',
  description: 'Explore the complete boutique collection of South Asian bridal and party jewelry, handcrafted velvet bangles, luxury bags, and accessories.',
};

export default async function ShopPage() {
  const productsDb = await getAllProducts();

  const initialProducts: Product[] = productsDb.map((p) => ({
    ...p,
    category: p.category as ProductCategory,
    description: p.description ?? '',
    tagline: p.tagline ?? '',
    originalPrice: p.originalPrice ?? undefined,
    featuredRank: p.featuredRank ?? 999,
    details: p.details.map((d: any) => (typeof d === 'string' ? d : d.text)),
    piecesIncluded: p.piecesIncluded.map((pi: any) => (typeof pi === 'string' ? pi : pi.text)),
    galleryImages: p.galleryImages.map((gi: any) => (typeof gi === 'string' ? gi : gi.url)),
    seoKeywords: p.seoKeywords
      ? (typeof p.seoKeywords === 'string' ? p.seoKeywords.split(',') : p.seoKeywords)
      : [],
    colorways: (p.colorways || []).map((cw: any) => ({
      id: cw.colorId || cw.id,
      name: cw.name,
      hex: cw.hex,
      inStock: cw.inStock ?? true,
      image: cw.image || null,
    })),
  }));

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-paper flex items-center justify-center text-xs text-text-muted">
          Loading collection...
        </div>
      }
    >
      <ShopClient initialProducts={initialProducts} />
    </Suspense>
  );
}
