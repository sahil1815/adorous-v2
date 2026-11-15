import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { PRODUCTS, CATEGORIES } from '@/data/catalogue';
import { getAllProducts } from '@/app/actions/productActions';
import { formatPrice } from '@/lib/formatPrice';
import { Tag, ShieldCheck, Truck, MessageCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Official Pricing & Product Catalogue | Adorous Fashion Dhaka',
  description: 'Complete itemized price list in Bangladeshi Taka (৳ BDT) for luxury Pakistani jewelry suites, velvet churi bangles, and ladies satchels. Cash on Delivery across Bangladesh.',
  alternates: {
    canonical: '/pricing',
  },
};

export default async function PricingPage() {
  const dbProductsRaw = await getAllProducts(false);
  const products = (dbProductsRaw && dbProductsRaw.length > 0)
    ? dbProductsRaw.map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        category: p.category,
        categoryLabel: p.categoryLabel || 'Boutique Collection',
        tagline: p.tagline || '',
        price: Math.round(Number(p.price)),
        originalPrice: p.originalPrice ? Math.round(Number(p.originalPrice)) : null,
        inStock: p.inStock ?? true,
        featuredImage: p.featuredImage,
        piecesIncluded: Array.isArray(p.piecesIncluded)
          ? p.piecesIncluded.map((pi: any) => (typeof pi === 'string' ? pi : pi.text))
          : [],
      }))
    : PRODUCTS.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        category: p.category,
        categoryLabel: p.categoryLabel,
        tagline: p.tagline,
        price: Math.round(p.price),
        originalPrice: p.originalPrice ? Math.round(p.originalPrice) : null,
        inStock: p.inStock ?? true,
        featuredImage: p.featuredImage,
        piecesIncluded: p.piecesIncluded || [],
      }));

  const pricingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Adorous Fashion Official Pricing & Catalogue',
    description: 'Itemized product pricing in Bangladeshi Taka (৳ BDT) with Cash on Delivery nationwide.',
    numberOfItems: products.length,
    itemListElement: products.map((prod, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Product',
        name: prod.name,
        description: prod.tagline || `${prod.name} by Adorous Fashion Atelier`,
        image: prod.featuredImage.startsWith('http') ? prod.featuredImage : `https://adorousfashion.store${prod.featuredImage}`,
        url: `https://adorousfashion.store/${prod.category}/${prod.slug}`,
        sku: prod.id,
        offers: {
          '@type': 'Offer',
          price: prod.price,
          priceCurrency: 'BDT',
          availability: prod.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition',
          priceValidUntil: '2027-12-31',
          url: `https://adorousfashion.store/${prod.category}/${prod.slug}`,
          seller: {
            '@type': 'Organization',
            name: 'Adorous Fashion',
          },
        },
      },
    })),
  };

  return (
    <div className="bg-paper text-ink min-h-screen py-10 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Title */}
        <div className="border-b border-line pb-8 mb-10">
          <div className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-[0.2em] text-gold-deep mb-3">
            <Tag className="w-3.5 h-3.5" />
            <span>Direct-to-Consumer Atelier</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-ink">
            Official Pricing & Product Catalogue
          </h1>
          <p className="mt-3 text-sm sm:text-base text-ink/75 max-w-2xl leading-relaxed">
            Transparent pricing in Bangladeshi Taka (৳ BDT) across all boutique suites. Every order is confirmed personally via WhatsApp and delivered via nationwide Cash on Delivery.
          </p>
        </div>

        {/* COD & Shipping Overview Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 p-5 bg-sand/30 border border-line rounded-[2px] text-xs">
          <div className="flex items-start space-x-3">
            <ShieldCheck className="w-4 h-4 text-gold-deep shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-ink uppercase tracking-wider text-[11px]">Cash on Delivery (COD)</p>
              <p className="text-ink/70 mt-0.5">Pay upon parcel arrival in hand across all 64 districts in Bangladesh.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Truck className="w-4 h-4 text-gold-deep shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-ink uppercase tracking-wider text-[11px]">Courier Shipping Rates</p>
              <p className="text-ink/70 mt-0.5">Inside Dhaka: ৳80 (1–2 days) · Outside Dhaka: ৳130 (2–4 days).</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <MessageCircle className="w-4 h-4 text-whatsapp shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-ink uppercase tracking-wider text-[11px]">WhatsApp Order Concierge</p>
              <p className="text-ink/70 mt-0.5">
                Direct phone & WhatsApp verification (+8801577731381) before parcel dispatch.
              </p>
            </div>
          </div>
        </div>

        {/* Itemized Pricing Table (Accessible without JS) */}
        <div className="bg-white border border-line rounded-[2px] overflow-hidden shadow-xs mb-12">
          <div className="px-6 py-4 bg-sand/20 border-b border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-medium text-ink">
                Itemized Price List ({products.length} Designs)
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                All prices are stated in Bangladeshi Taka (৳ BDT) with zero hidden fees.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-gold-deep hover:text-ink transition-colors"
            >
              <span>View Visual Storefront</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-line bg-sand/10 text-[10px] font-semibold uppercase tracking-wider text-ink/70">
                  <th className="py-3 px-4 sm:px-6">Design / Piece</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 hidden md:table-cell">Set Inclusions</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Price (BDT)</th>
                  <th className="py-3 px-4 text-right">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {products.map((prod) => (
                  <tr
                    key={prod.id}
                    className="hover:bg-sand/15 transition-colors"
                    itemScope
                    itemType="https://schema.org/Product"
                  >
                    <td className="py-3.5 px-4 sm:px-6 min-w-[200px]">
                      <div className="font-medium text-ink">
                        <span itemProp="name">{prod.name}</span>
                      </div>
                      {prod.tagline && (
                        <p className="text-[11px] text-text-muted mt-0.5 line-clamp-1">{prod.tagline}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-ink/80 whitespace-nowrap">
                      {prod.categoryLabel}
                    </td>
                    <td className="py-3.5 px-4 text-ink/70 hidden md:table-cell text-[11px] max-w-xs">
                      {prod.piecesIncluded && prod.piecesIncluded.length > 0
                        ? prod.piecesIncluded.slice(0, 2).join(' · ')
                        : 'Atelier suite'}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {prod.inStock ? (
                        <span className="inline-flex items-center text-emerald-700 text-[11px] font-medium">
                          <CheckCircle2 className="w-3 h-3 mr-1 shrink-0" />
                          In Stock
                        </span>
                      ) : (
                        <span className="text-rose-700 text-[11px] font-medium">Sold Out</span>
                      )}
                    </td>
                    <td
                      className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap font-semibold text-ink text-sm"
                      itemProp="offers"
                      itemScope
                      itemType="https://schema.org/Offer"
                    >
                      <meta itemProp="priceCurrency" content="BDT" />
                      <meta itemProp="price" content={String(prod.price)} />
                      <link
                        itemProp="availability"
                        href={prod.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'}
                      />
                      <span className="tabular-nums">৳{formatPrice(prod.price)}</span>
                      {prod.originalPrice && prod.originalPrice > prod.price && (
                        <span className="text-[10px] text-text-muted line-through ml-1.5 tabular-nums">
                          ৳{formatPrice(prod.originalPrice)}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/${prod.category}/${prod.slug}`}
                        className="text-gold-deep hover:underline font-medium text-xs"
                        itemProp="url"
                      >
                        Inspect Piece →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Price Summary Badges */}
        <div className="border-t border-line pt-10">
          <h2 className="font-serif text-xl sm:text-2xl font-medium text-ink mb-4">
            Collection Price Tiers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => {
              const catProds = products.filter((p) => p.category === cat.slug);
              const prices = catProds.map((p) => p.price);
              const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
              const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
              return (
                <div key={cat.slug} className="p-4 bg-sand/30 border border-line rounded-[2px] flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-gold-deep font-semibold">
                      {cat.count}
                    </span>
                    <h3 className="font-serif text-base font-semibold text-ink mt-1">{cat.name}</h3>
                    <p className="text-xs text-ink/75 mt-1 leading-relaxed line-clamp-2">{cat.blurb}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between">
                    <span className="text-xs font-semibold text-ink">
                      {minPrice > 0 ? `৳${formatPrice(minPrice)} – ৳${formatPrice(maxPrice)}` : 'Inquire'}
                    </span>
                    <Link
                      href={`/${cat.slug}`}
                      className="text-xs text-gold-deep hover:underline font-medium"
                    >
                      Browse →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
