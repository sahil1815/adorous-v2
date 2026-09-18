import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllProducts, getProductBySlug } from '@/app/actions/productActions';
import { ProductCategory } from '@/types';
import ProductDetailClient from '@/components/pdp/ProductDetailClient';
import ClientProductDetailResolver from '@/components/pdp/ClientProductDetailResolver';

export const dynamicParams = true;

interface PageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

export async function generateStaticParams() {
  try {
    const products = await getAllProducts();
    return products.map((product) => ({
      category: product.category,
      slug: product.slug,
    }));
  } catch (error) {
    console.warn('Could not fetch products during generateStaticParams, dynamicParams will render them on demand:', error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found | Adorous Fashion',
    };
  }

  const title = `${product.name} | Adorous Fashion Dhaka`;
  const description = `${product.tagline}. Premium boutique South Asian accessories. Cash on Delivery across Bangladesh. Price: ৳${product.price}.`;

  return {
    title,
    description,
    keywords: [...(product.seoKeywords ? product.seoKeywords.split(',') : []), 'Adorous Fashion', 'Dhaka e-commerce', 'Cash on Delivery BD'],
    alternates: {
      canonical: `/${product.category}/${product.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://adorousfashion.com/${product.category}/${product.slug}`,
      images: [
        {
          url: product.featuredImage,
          width: 800,
          height: 1000,
          alt: `${product.name} Still Life Photography`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { category, slug } = await params;
  const productDb = await getProductBySlug(slug);
  
  if (!productDb || productDb.category !== category) {
    notFound();
  }
  
  const product = {
    ...productDb,
    category: productDb.category as ProductCategory,
    description: productDb.description ?? "",
    tagline: productDb.tagline ?? "",
    originalPrice: productDb.originalPrice ?? undefined,
    featuredRank: productDb.featuredRank ?? 999,
    details: productDb.details.map(d => d.text),
    piecesIncluded: productDb.piecesIncluded.map(pi => pi.text),
    galleryImages: productDb.galleryImages.map(gi => gi.url),
    seoKeywords: productDb.seoKeywords ? productDb.seoKeywords.split(',') : []
  };

  // Find 3-4 cross-category pairings for the "Pairs Well With" section
  const allProductsDb = await getAllProducts();
  const allProducts = allProductsDb.map(p => ({
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
  
  const pairsWellWith = allProducts.filter((p) => p.category !== product.category && p.id !== product.id).slice(0, 4);

  // JSON-LD structured data for Google Rich Results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: [`https://adorousfashion.com${product.featuredImage}`],
    description: product.description,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'Adorous Fashion',
    },
    offers: {
      '@type': 'Offer',
      url: `https://adorousfashion.com/${product.category}/${product.slug}`,
      priceCurrency: 'BDT',
      price: product.price,
      priceValidUntil: '2026-12-31',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: product.price >= 2000 ? 0 : 70,
          currency: 'BDT',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 4,
            unitCode: 'DAY',
          },
        },
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={<div className="min-h-screen bg-paper flex items-center justify-center text-xs text-text-muted">Loading product...</div>}>
        <ProductDetailClient product={product} pairsWellWith={pairsWellWith} />
      </Suspense>
    </>
  );
}
