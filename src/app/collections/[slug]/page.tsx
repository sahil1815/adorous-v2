'use client';

import React, { useMemo } from 'react';
import { notFound } from 'next/navigation';
import { use } from 'react';
import Link from 'next/link';
import { useLandingPages } from '@/context/LandingPagesContext';
import { useInventory } from '@/context/InventoryContext';
import { useOrders } from '@/context/OrdersContext';
import { useReviews } from '@/context/ReviewsContext';
import { PRODUCTS } from '@/data/catalogue';
import { Product } from '@/types';
import ProductCard from '@/components/ui/ProductCard';
import { Sparkles } from 'lucide-react';

interface CollectionLandingPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function CollectionLandingPage({ params }: CollectionLandingPageProps) {
  const { slug } = use(params);
  const { getPageBySlug } = useLandingPages();
  const { allProducts, getEffectiveProduct } = useInventory();
  const { orders } = useOrders();
  const { reviews } = useReviews();
  const page = getPageBySlug(slug);

  if (!page || !page.isActive) {
    notFound();
  }

  // Extract stable values from the page to avoid reference instability
  const sortOrder = page.sortOrder || 'manual';
  const productIds = page.productIds;

  const pool = allProducts.length > 0 ? allProducts : PRODUCTS;

  // Resolve the selected products from inventory
  const resolvedProducts: Product[] = useMemo(() => {
    return productIds
      .map((id) => {
        const match = pool.find((p) => p.id === id || p.slug === id);
        return match ? getEffectiveProduct(match) : undefined;
      })
      .filter((p): p is Product => p !== undefined);
  }, [productIds, pool, getEffectiveProduct]);

  // Build purchase count map from orders
  const purchaseCountMap = useMemo(() => {
    const counts = new Map<string, number>();
    orders.forEach((order) => {
      if (order.status === 'cancelled') return;
      order.items.forEach((item) => {
        const pid = item.product.id;
        counts.set(pid, (counts.get(pid) || 0) + item.quantity);
      });
    });
    return counts;
  }, [orders]);

  // Build average rating map from reviews
  const avgRatingMap = useMemo(() => {
    const ratings = new Map<string, number>();
    resolvedProducts.forEach((p) => {
      const productReviews = reviews.filter(
        (r) => r.productId === p.id && r.status === 'approved'
      );
      if (productReviews.length > 0) {
        const avg =
          productReviews.reduce((sum, r) => sum + r.rating, 0) /
          productReviews.length;
        ratings.set(p.id, avg);
      } else {
        ratings.set(p.id, 0);
      }
    });
    return ratings;
  }, [resolvedProducts, reviews]);

  // Apply sort order
  const products = useMemo(() => {
    const list = [...resolvedProducts];

    switch (sortOrder) {
      case 'most-purchased':
        list.sort(
          (a, b) =>
            (purchaseCountMap.get(b.id) || 0) -
            (purchaseCountMap.get(a.id) || 0)
        );
        break;
      case 'newest':
        list.sort((a, b) => {
          if (a.isNewDrop && !b.isNewDrop) return -1;
          if (!a.isNewDrop && b.isNewDrop) return 1;
          return a.featuredRank - b.featuredRank;
        });
        break;
      case 'oldest':
        list.sort((a, b) => {
          if (a.isNewDrop && !b.isNewDrop) return 1;
          if (!a.isNewDrop && b.isNewDrop) return -1;
          return b.featuredRank - a.featuredRank;
        });
        break;
      case 'best-rating':
        list.sort(
          (a, b) =>
            (avgRatingMap.get(b.id) || 0) - (avgRatingMap.get(a.id) || 0)
        );
        break;
      case 'manual':
      default:
        // Keep the order from productIds (already resolved in order)
        break;
    }

    return list;
  }, [resolvedProducts, sortOrder, purchaseCountMap, avgRatingMap]);

  return (
    <div className="min-h-screen bg-paper">
      {/* Hero Section */}
      <section className="relative bg-sand text-ink overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(198,169,110,0.3),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(198,169,110,0.15),transparent_50%)]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          {/* Small brand chip */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-gold/10 border border-gold/25 rounded-full mb-6">
            <Sparkles className="w-3 h-3 text-gold" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-gold font-medium">Adorous Exclusive</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-ink tracking-wide leading-tight">
            {page.headline}
          </h1>

          {page.subtitle && (
            <p className="mt-4 text-base sm:text-lg text-ink/60 max-w-2xl mx-auto leading-relaxed">
              {page.subtitle}
            </p>
          )}

          {/* Decorative line */}
          <div className="mt-8 mx-auto w-16 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm text-text-muted">This collection is being updated. Please check back soon.</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-10">
              <p className="text-xs uppercase tracking-[0.2em] text-text-muted">
                {products.length} curated piece{products.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Bottom CTA */}
      <section className="bg-stone border-t border-line/50 py-12 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-text-muted mb-4">
          Explore The Full Collection
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center space-x-2 px-8 py-3 bg-sand text-gold border border-gold/30 hover:bg-sand/90 hover:border-gold/50 transition-colors text-sm font-medium tracking-wider uppercase"
        >
          <span>Visit Our Shop</span>
        </Link>

        <div className="mt-8 flex flex-col items-center space-y-2">
          <p className="text-[11px] text-text-muted">
            Free delivery on orders above ৳2,000 · Cash on Delivery across Bangladesh
          </p>
        </div>
      </section>
    </div>
  );
}
