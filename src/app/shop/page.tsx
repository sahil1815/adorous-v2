import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { getAllProducts } from '@/app/actions/productActions';
import { getPageOrdering } from '@/app/actions/productOrderingActions';
import { ProductCategory, Product } from '@/types';
import ShopClient from '@/components/shop/ShopClient';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'The Full Collection | Adorous Fashion Dhaka',
  description: 'Explore the complete boutique collection of South Asian bridal and party jewelry, handcrafted velvet bangles, luxury bags, and accessories.',
  alternates: {
    canonical: '/shop',
  },
  openGraph: {
    title: 'The Full Collection | Adorous Fashion Dhaka',
    description: 'Explore the complete boutique collection of South Asian bridal and party jewelry, handcrafted velvet bangles, and luxury bags.',
    url: 'https://adorousfashion.store/shop',
    images: [
      {
        url: '/images/hero/hero-still-life.jpg',
        width: 1200,
        height: 630,
        alt: 'Adorous Fashion Atelier Still Life Collection',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default async function ShopPage() {
  const [productsDb, orderingSettings] = await Promise.all([
    getAllProducts(),
    getPageOrdering('shop-all'),
  ]);

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

  // If manual order is specified, sort initialProducts on the server
  if (orderingSettings.sortOrder === 'manual' && orderingSettings.manualOrder.length > 0) {
    const orderMap = new Map(orderingSettings.manualOrder.map((id, idx) => [id, idx]));
    initialProducts.sort((a, b) => {
      const aIdx = orderMap.get(a.id) ?? orderMap.get(a.slug) ?? 9999;
      const bIdx = orderMap.get(b.id) ?? orderMap.get(b.slug) ?? 9999;
      return aIdx - bIdx;
    });
  }

  const shopJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': 'https://adorousfashion.store/shop#webpage',
        url: 'https://adorousfashion.store/shop',
        name: 'The Full Collection | Adorous Fashion Dhaka',
        description: 'Explore the complete boutique collection of South Asian bridal and party jewelry, handcrafted velvet bangles, luxury bags, and accessories.',
        isPartOf: {
          '@id': 'https://adorousfashion.store/#website',
        },
      },
      {
        '@type': 'ItemList',
        '@id': 'https://adorousfashion.store/shop#itemlist',
        name: 'Adorous Fashion Catalogue',
        numberOfItems: initialProducts.length,
        itemListElement: initialProducts.map((p, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: p.name,
          url: `https://adorousfashion.store/${p.category}/${p.slug}`,
          item: {
            '@type': 'Product',
            name: p.name,
            description: p.tagline || p.description,
            image: p.featuredImage.startsWith('http') ? p.featuredImage : `https://adorousfashion.store${p.featuredImage}`,
            url: `https://adorousfashion.store/${p.category}/${p.slug}`,
            sku: p.id,
            offers: {
              '@type': 'Offer',
              price: Math.round(p.price),
              priceCurrency: 'BDT',
              availability: p.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              url: `https://adorousfashion.store/${p.category}/${p.slug}`,
            },
          },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(shopJsonLd) }}
      />
      <Suspense
        fallback={
          <div className="min-h-screen bg-paper flex items-center justify-center text-xs text-text-muted">
            Loading collection...
          </div>
        }
      >
        <ShopClient initialProducts={initialProducts} initialOrdering={orderingSettings} />
      </Suspense>
    </>
  );
}
