import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';
import { getAllProducts, getProductBySlug } from '@/app/actions/productActions';
import { ProductCategory } from '@/types';
import ProductDetailClient from '@/components/pdp/ProductDetailClient';
import ClientProductDetailResolver from '@/components/pdp/ClientProductDetailResolver';
import { EyeOff } from 'lucide-react';

export const dynamicParams = true;
export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
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

export default async function ProductPage({ params }: ProductPageProps) {
  const { category, slug } = await params;
  if (category.toLowerCase() === 'umbrellas') {
    redirect(`/more/${slug}`);
  }
  let productDb = await getProductBySlug(slug, false);
  let isPreviewForAdmin = false;

  if (!productDb) {
    try {
      const cookieStore = await cookies();
      const sessionToken = cookieStore.get('adorous_admin_session')?.value;
      if (sessionToken) {
        const session = await decrypt(sessionToken);
        if (session) {
          productDb = await getProductBySlug(slug, true);
          if (productDb) {
            isPreviewForAdmin = true;
          }
        }
      }
    } catch {}
  }
  
  const categoryMatches =
    productDb &&
    (productDb.category.toLowerCase() === category.toLowerCase() ||
      (category.toLowerCase() === 'more' && productDb.category.toLowerCase() === 'umbrellas') ||
      (category.toLowerCase() === 'umbrellas' && productDb.category.toLowerCase() === 'more'));

  if (!productDb || !categoryMatches) {
    return <ClientProductDetailResolver category={category} slug={slug} />;
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
          value: product.price >= 2000 ? 0 : 80,
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
      {isPreviewForAdmin && (
        <div className="bg-amber-950/90 border-b border-amber-500/40 text-amber-200 text-xs py-2.5 px-4 text-center font-medium flex items-center justify-center gap-2 sticky top-0 z-50 backdrop-blur-xs shadow-md">
          <EyeOff className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Atelier Admin Preview:</strong> This piece is currently <span className="underline decoration-amber-400">hidden from customers</span> on the live storefront.
          </span>
        </div>
      )}
      <Suspense fallback={<div className="min-h-screen bg-paper flex items-center justify-center text-xs text-text-muted">Loading product...</div>}>
        <ProductDetailClient product={product} pairsWellWith={pairsWellWith} />
      </Suspense>
    </>
  );
}
