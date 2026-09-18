import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CATEGORIES } from '@/data/catalogue';
import { getProductsByCategory } from '@/app/actions/productActions';
import { ProductCategory } from '@/types';
import CategoryPageClient from '@/components/category/CategoryPageClient';

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({
    category: c.slug,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const cat = CATEGORIES.find((c) => c.slug === category);

  if (!cat) {
    return {
      title: 'Category Not Found | Adorous Fashion',
    };
  }

  const title = `${cat.name} Collection | Adorous Fashion Dhaka`;
  const description = `${cat.blurb} Premium South Asian accessories available for Cash on Delivery across Bangladesh.`;

  return {
    title,
    description,
    keywords: [cat.name, 'Adorous Fashion', 'Dhaka jewelry', 'accessories Bangladesh', 'Cash on delivery BD'],
    alternates: {
      canonical: `/${cat.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://adorousfashion.com/${cat.slug}`,
      images: [
        {
          url: cat.image,
          width: 800,
          height: 1000,
          alt: `${cat.name} Collection Still Life`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const cat = CATEGORIES.find((c) => c.slug === category);

  if (!cat) {
    notFound();
  }
  const categoryProductsDb = await getProductsByCategory(category);
  
  // Transform DB product to match the frontend type
  const categoryProducts = categoryProductsDb.map(p => ({
    ...p,
    category: p.category as ProductCategory,
    description: p.description ?? "",
    tagline: p.tagline ?? "",
    originalPrice: p.originalPrice ?? undefined,
    featuredRank: p.featuredRank ?? 999,
    details: p.details.map(d => d.text),
    piecesIncluded: p.piecesIncluded.map(pi => pi.text),
    galleryImages: p.galleryImages.map(gi => gi.url),
    seoKeywords: p.seoKeywords ? p.seoKeywords.split(',') : []
  }));

  return (
    <Suspense fallback={<div className="min-h-screen bg-paper flex items-center justify-center text-xs text-text-muted">Loading collection...</div>}>
      <CategoryPageClient
        categorySlug={cat.slug}
        categoryName={cat.name}
        categoryBlurb={cat.blurb}
        categoryImage={cat.image}
        products={categoryProducts}
      />
    </Suspense>
  );
}
