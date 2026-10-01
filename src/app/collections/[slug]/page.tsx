import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getLandingPageBySlug } from '@/app/actions/landingPageActions';
import { getAllProducts } from '@/app/actions/productActions';
import { ProductCategory, Product } from '@/types';
import CollectionClient from '@/components/collections/CollectionClient';

export const dynamic = 'force-dynamic';

interface CollectionPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getLandingPageBySlug(slug);

  if (!page || !page.isActive) {
    return {
      title: 'Collection Not Found | Adorous Fashion',
    };
  }

  const title = `${page.title} | Adorous Fashion`;
  const description = page.subtitle || page.headline;

  return {
    title,
    description,
    openGraph: {
      title: page.headline,
      description,
      type: 'website',
      url: `https://www.adorousfashion.store/collections/${page.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: page.headline,
      description,
    },
  };
}

export default async function CollectionLandingPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const page = await getLandingPageBySlug(slug);

  if (!page || !page.isActive) {
    notFound();
  }

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
    <CollectionClient
      initialPage={page}
      initialProducts={initialProducts}
    />
  );
}
