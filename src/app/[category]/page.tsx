import React, { Suspense, cache } from 'react';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { CATEGORIES } from '@/data/catalogue';
import { getProductsByCategory } from '@/app/actions/productActions';
import { getCategoryHeroSettings } from '@/app/actions/categoryHeroActions';
import { getPageOrdering } from '@/app/actions/productOrderingActions';
import { ProductCategory } from '@/types';
import CategoryPageClient from '@/components/category/CategoryPageClient';

const getCachedCategoryHeroSettings = cache(getCategoryHeroSettings);

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export const revalidate = 300;

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const cat = CATEGORIES.find((c) => c.slug === category);

  if (!cat) {
    notFound();
  }

  const pageTitle = `${cat.name} Collection`;
  const ogTitle = `${cat.name} Collection | Adorous Fashion`;
  const description = `${cat.blurb} Premium South Asian accessories available for Cash on Delivery across Bangladesh.`;

  const heroSetting = await getCachedCategoryHeroSettings(category);
  let heroImage = heroSetting?.heroImage || cat.image;
  if (heroImage.toLowerCase().includes('.heic') && !heroImage.includes('format=')) {
    heroImage += (heroImage.includes('?') ? '&' : '?') + 'format=webp';
  }

  return {
    title: pageTitle,
    description,
    keywords: [cat.name, 'Adorous Fashion', 'boutique jewelry', 'accessories Bangladesh', 'Cash on delivery BD'],
    alternates: {
      canonical: `https://adorousfashion.store/${cat.slug}`,
    },
    openGraph: {
      title: ogTitle,
      description,
      url: `https://adorousfashion.store/${cat.slug}`,
      images: [
        {
          url: heroImage,
          width: 800,
          height: 1000,
          alt: `${cat.name} Collection Still Life`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: [heroImage],
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  if (category.toLowerCase() === 'umbrellas') {
    redirect('/more');
  }
  const cat = CATEGORIES.find((c) => c.slug === category);

  if (!cat) {
    notFound();
  }
  const [categoryProductsDb, heroSetting, orderingSetting] = await Promise.all([
    getProductsByCategory(category),
    getCachedCategoryHeroSettings(category),
    getPageOrdering(`category-${category}`),
  ]);
  const heroImage = heroSetting?.heroImage || cat.image;
  
  // Transform DB product to match the frontend type
  const categoryProducts = categoryProductsDb.map(p => ({
    ...p,
    category: p.category as ProductCategory,
    sizes: Array.isArray((p as any).sizes) ? ((p as any).sizes as string[]) : [],
    description: p.description ?? "",
    tagline: p.tagline ?? "",
    originalPrice: p.originalPrice ?? undefined,
    featuredRank: p.featuredRank ?? 999,
    details: p.details.map(d => d.text),
    piecesIncluded: p.piecesIncluded.map(pi => pi.text),
    galleryImages: p.galleryImages.map(gi => gi.url),
    seoKeywords: p.seoKeywords ? p.seoKeywords.split(',') : [],
    colorways: (p.colorways || []).map((cw: any) => ({
      id: cw.colorId || cw.id,
      name: cw.name,
      hex: cw.hex,
      inStock: cw.inStock ?? true,
      image: cw.image || null,
    })),
  }));

  // If manual order exists in database, sort categoryProducts on the server
  if (orderingSetting.sortOrder === 'manual' && orderingSetting.manualOrder.length > 0) {
    const orderMap = new Map(orderingSetting.manualOrder.map((id, idx) => [id, idx]));
    categoryProducts.sort((a, b) => {
      const aIdx = orderMap.get(a.id) ?? orderMap.get(a.slug) ?? 9999;
      const bIdx = orderMap.get(b.id) ?? orderMap.get(b.slug) ?? 9999;
      return aIdx - bIdx;
    });
  }

  const categoryJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `https://adorousfashion.store/${cat.slug}#webpage`,
        url: `https://adorousfashion.store/${cat.slug}`,
        name: `${cat.name} Collection | Adorous Fashion`,
        description: cat.blurb,
        isPartOf: {
          '@id': 'https://adorousfashion.store/#website',
        },
        breadcrumb: {
          '@id': `https://adorousfashion.store/${cat.slug}#breadcrumb`,
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `https://adorousfashion.store/${cat.slug}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://adorousfashion.store',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: cat.name,
            item: `https://adorousfashion.store/${cat.slug}`,
          },
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `https://adorousfashion.store/${cat.slug}#itemlist`,
        name: `${cat.name} Catalog`,
        numberOfItems: categoryProducts.length,
        itemListElement: categoryProducts.map((p, idx) => ({
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryJsonLd) }}
      />
      <CategoryPageClient
        categorySlug={cat.slug}
        categoryName={cat.name}
        categoryBlurb={cat.blurb}
        categoryImage={heroImage}
        products={categoryProducts}
        initialOrdering={orderingSetting}
      />
    </>
  );
}
