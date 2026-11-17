import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { getAllProducts } from '@/app/actions/productActions';
import { getPageOrdering } from '@/app/actions/productOrderingActions';
import { ProductCategory, Product } from '@/types';
import ShopClient from '@/components/shop/ShopClient';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'The Full Collection | Adorous Fashion',
  description: 'Explore the complete boutique collection of South Asian bridal and party jewelry, handcrafted velvet bangles, luxury bags, and accessories.',
  alternates: {
    canonical: '/shop',
  },
  openGraph: {
    title: 'The Full Collection | Adorous Fashion',
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
        name: 'The Full Collection | Adorous Fashion',
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
          <div className="bg-paper min-h-screen py-10 sm:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="border-b border-line pb-8 mb-8 text-center sm:text-left">
                <span className="text-[11px] font-semibold tracking-[0.25em] text-gold-ink uppercase block mb-2">
                  Atelier Catalogue
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-ink">
                  The Full Collection
                </h1>
                <p className="mt-3 text-xs sm:text-sm text-text-muted max-w-xl">
                  Handcrafted boutique jewelry, velvet churi bangles, and structured satchels.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {initialProducts.slice(0, 8).map((p) => (
                  <div key={p.id} className="border border-line p-3 rounded-xs bg-white space-y-2">
                    <div className="aspect-square bg-sand/30 rounded-xs animate-pulse" />
                    <h3 className="font-serif text-xs sm:text-sm text-ink font-medium truncate">{p.name}</h3>
                    <p className="text-xs text-gold-deep font-semibold">৳{p.price}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        }
      >
        <ShopClient initialProducts={initialProducts} initialOrdering={orderingSettings} />
      </Suspense>
    </>
  );
}
