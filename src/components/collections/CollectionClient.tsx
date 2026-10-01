'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useLandingPages } from '@/context/LandingPagesContext';
import { useInventory } from '@/context/InventoryContext';
import { useOrders } from '@/context/OrdersContext';
import { useReviews } from '@/context/ReviewsContext';
import { Product } from '@/types';
import ProductCard from '@/components/ui/ProductCard';
import { Sparkles } from 'lucide-react';
import { LandingPageData } from '@/app/actions/landingPageActions';

interface CollectionClientProps {
  initialPage: LandingPageData;
  initialProducts: Product[];
}

export default function CollectionClient({
  initialPage,
  initialProducts,
}: CollectionClientProps) {
  const { getPageBySlug } = useLandingPages();
  const { allProducts, getEffectiveProduct } = useInventory();
  const { orders } = useOrders();
  const { reviews } = useReviews();

  // If client-side context has updated page data (e.g. from admin edits), prefer it
  const page = getPageBySlug(initialPage.slug) || initialPage;

  const sortOrder = page.sortOrder || 'manual';
  const productIds = page.productIds || [];

  const pool = allProducts.length > 0 ? allProducts : initialProducts;

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
      <section className="relative bg-sand text-ink overflow-hidden border-b border-line">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(198,169,110,0.3),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(198,169,110,0.15),transparent_50%)]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center">
          {/* Small brand chip */}
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-gold/10 border border-gold/25 rounded-full mb-2 sm:mb-3">
            <Sparkles className="w-2.5 h-2.5 text-gold" />
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-gold font-medium">Adorous Exclusive</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-ink tracking-wide leading-tight">
            {page.headline}
          </h1>

          {page.subtitle && (
            <p className="mt-2 text-xs sm:text-sm text-ink/70 max-w-xl mx-auto leading-relaxed">
              {page.subtitle}
            </p>
          )}
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-text-muted">This collection is being updated. Please check back soon.</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6 sm:mb-8">
              <p className="text-xs uppercase tracking-[0.2em] text-text-muted">
                Curated Boutique Collection
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
      <section className="bg-[#F4F1EA] border-t border-line py-8 sm:py-10 text-center px-4">
        <h2 className="font-serif text-base sm:text-lg font-medium text-ink tracking-wide mb-3">
          Explore The Full Collection
        </h2>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center space-x-2 px-7 py-2.5 bg-ink text-paper hover:bg-gold hover:text-ink border border-ink text-xs font-semibold tracking-[0.16em] uppercase rounded-xs transition-all shadow-xs"
        >
          <span>Visit Our Shop</span>
        </Link>

        <p className="text-xs text-ink/65 font-medium mt-3.5 tracking-normal">
          Free delivery on orders above ৳2,000 · Cash on Delivery across Bangladesh
        </p>
      </section>
    </div>
  );
}
