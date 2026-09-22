'use client';

import React from 'react';
import Link from 'next/link';
import { useInventory } from '@/context/InventoryContext';
import { PRODUCTS } from '@/data/catalogue';
import ProductDetailClient from '@/components/pdp/ProductDetailClient';
import { ShoppingBag, ArrowLeft } from 'lucide-react';

interface ClientProductDetailResolverProps {
  category: string;
  slug: string;
}

export default function ClientProductDetailResolver({
  category,
  slug,
}: ClientProductDetailResolverProps) {
  const { getProductBySlug, allProducts } = useInventory();
  const product = getProductBySlug(category, slug);

  if (!product) {
    return (
      <div className="min-h-[70vh] bg-paper flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full text-center space-y-4 p-8 border border-line bg-[#FAF7F0] rounded-xs shadow-xs">
          <div className="w-12 h-12 rounded-full bg-sand flex items-center justify-center mx-auto text-ink">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-serif text-ink">Atelier Piece Not Found</h2>
          <p className="text-xs text-text-muted leading-relaxed">
            The design you are searching for may have retired from our current collection or is undergoing seasonal curation.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gold text-ink text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-black transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Explore The Complete Edit</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pairsWellWith = allProducts
    .filter((p) => p.category !== product.category && p.id !== product.id)
    .slice(0, 4);

  return <ProductDetailClient product={product} pairsWellWith={pairsWellWith} />;
}
