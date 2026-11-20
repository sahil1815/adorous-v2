import React, { Suspense, cache } from 'react';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';
import { getAllProducts, getProductBySlug } from '@/app/actions/productActions';
import { prisma } from '@/lib/db';
import { PRODUCTS } from '@/data/catalogue';
import { Product, ProductCategory } from '@/types';
import ProductDetailClient from '@/components/pdp/ProductDetailClient';
import ClientProductDetailResolver from '@/components/pdp/ClientProductDetailResolver';
import { getTrustPolicyById } from '@/app/actions/trustPolicyActions';
import { resolveTrustPolicy } from '@/lib/trustPolicies';
import { EyeOff } from 'lucide-react';

const getCachedProductBySlug = cache(getProductBySlug);

export const dynamicParams = true;
export const revalidate = 300;

interface ProductPageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const product = await getCachedProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const pageTitle = product.name;
  const ogTitle = `${product.name} | Adorous Fashion`;
  const description = `${product.tagline}. Boutique artisan jewelry and accessories. Cash on Delivery across Bangladesh. Price: ৳${product.price}.`;

  let featuredImg = product.featuredImage.startsWith('http')
    ? product.featuredImage
    : `https://adorousfashion.store${product.featuredImage}`;
  if (featuredImg.toLowerCase().includes('.heic') && !featuredImg.includes('format=')) {
    featuredImg += (featuredImg.includes('?') ? '&' : '?') + 'format=webp';
  }

  return {
    title: pageTitle,
    description,
    keywords: [...(product.seoKeywords ? product.seoKeywords.split(',') : []), 'Adorous Fashion', 'Bangladesh boutique', 'Cash on Delivery BD'],
    alternates: {
      canonical: `https://adorousfashion.store/${product.category}/${product.slug}`,
    },
    openGraph: {
      title: ogTitle,
      description,
      url: `https://adorousfashion.store/${product.category}/${product.slug}`,
      images: [
        {
          url: featuredImg,
          width: 1200,
          height: 630,
          alt: `${product.name} Still Life Photography`,
        },
        {
          url: featuredImg,
          width: 800,
          height: 1000,
          alt: `${product.name} Still Life Photography`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: [featuredImg],
    },
    other: {
      'product:price:amount': String(Math.round(product.price)),
      'product:price:currency': 'BDT',
      'product:availability': (product.inStock && (product.stockQty === null || product.stockQty > 0)) ? 'in stock' : 'out of stock',
      'product:condition': 'new',
      'product:brand': 'Adorous Fashion',
      'product:retailer_item_id': product.id,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { category, slug } = await params;
  if (category.toLowerCase() === 'umbrellas') {
    redirect(`/more/${slug}`);
  }
  let productDb = await getCachedProductBySlug(slug, false);
  let isPreviewForAdmin = false;

  if (!productDb) {
    try {
      const cookieStore = await cookies();
      const sessionToken = cookieStore.get('adorous_admin_session')?.value;
      if (sessionToken) {
        const session = await decrypt(sessionToken);
        if (session) {
          productDb = await getCachedProductBySlug(slug, true);
          if (productDb) {
            isPreviewForAdmin = true;
          }
        }
      }
    } catch {}
  }
  
  if (productDb && (productDb.slug !== slug || productDb.category.toLowerCase() !== category.toLowerCase())) {
    redirect(`/${productDb.category}/${productDb.slug}`);
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
    sizes: Array.isArray((productDb as any).sizes) ? ((productDb as any).sizes as string[]) : [],
    description: productDb.description ?? "",
    tagline: productDb.tagline ?? "",
    originalPrice: productDb.originalPrice ?? undefined,
    featuredRank: productDb.featuredRank ?? 999,
    details: productDb.details.map(d => d.text),
    piecesIncluded: productDb.piecesIncluded.map(pi => pi.text),
    galleryImages: productDb.galleryImages.map(gi => gi.url),
    seoKeywords: productDb.seoKeywords ? productDb.seoKeywords.split(',') : []
  };

  // Find 3-4 cross-category pairings for the "Pairs Well With" section (targeted query)
  let pairsWellWith: Product[] = [];
  try {
    const pairingsDb = await prisma.product.findMany({
      where: {
        category: { not: product.category },
        isHidden: false,
        id: { not: product.id },
      },
      take: 4,
      include: {
        colorways: true,
        galleryImages: true,
        details: true,
        piecesIncluded: true,
      },
      orderBy: { featuredRank: 'asc' },
    });

    pairsWellWith = pairingsDb.map((p) => ({
      ...p,
      category: p.category as ProductCategory,
      sizes: Array.isArray((p as any).sizes) ? ((p as any).sizes as string[]) : [],
      description: p.description ?? '',
      tagline: p.tagline ?? '',
      originalPrice: p.originalPrice ?? undefined,
      featuredRank: p.featuredRank ?? 999,
      details: p.details.map((d: any) => d.text),
      piecesIncluded: p.piecesIncluded.map((pi: any) => pi.text),
      galleryImages: p.galleryImages.map((gi: any) => gi.url),
      seoKeywords: p.seoKeywords ? p.seoKeywords.split(',') : [],
      colorways: (p.colorways || []).map((cw: any) => ({
        id: cw.colorId || cw.id,
        name: cw.name,
        hex: cw.hex,
        inStock: cw.inStock ?? true,
        image: cw.image || null,
      })),
    }));
  } catch {
    pairsWellWith = PRODUCTS.filter((p) => p.category !== product.category && p.id !== product.id).slice(0, 4);
  }

  // Dynamic stock and expiration calculation
  const isInStock = (product.inStock ?? true) && (product.stockQty === null || product.stockQty === undefined || product.stockQty > 0);
  const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // JSON-LD structured data for Google Rich Results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: [product.featuredImage.startsWith('http') ? product.featuredImage : `https://adorousfashion.store${product.featuredImage}`],
    description: product.description || product.tagline,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'Adorous Fashion',
    },
    offers: {
      '@type': 'Offer',
      url: `https://adorousfashion.store/${product.category}/${product.slug}`,
      priceCurrency: 'BDT',
      price: Math.round(product.price),
      priceValidUntil: nextYear,
      availability: isInStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'Adorous Fashion',
        url: 'https://adorousfashion.store',
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'BD',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: product.price >= 2000 ? 0 : 80,
          currency: 'BDT',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'BD',
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

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
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
        name: product.categoryLabel || product.category,
        item: `https://adorousfashion.store/${product.category}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: `https://adorousfashion.store/${product.category}/${product.slug}`,
      },
    ],
  };

  // Resolve dynamic trust, guarantee & exchange policy for this category & piece
  const [categoryPolicy, globalPolicy] = await Promise.all([
    getTrustPolicyById(product.category),
    getTrustPolicyById('global'),
  ]);
  const resolvedTrustPolicy = resolveTrustPolicy(product, categoryPolicy, globalPolicy);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
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
        <ProductDetailClient
          product={product}
          pairsWellWith={pairsWellWith}
          trustPolicy={resolvedTrustPolicy}
        />
      </Suspense>
    </>
  );
}
