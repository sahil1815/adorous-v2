'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { ShoppingBag, Check, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [activeColor, setActiveColor] = useState(product.colorways[0]);
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const isSaved = isInWishlist(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart(product, activeColor, product.sizes ? product.sizes[1] || product.sizes[0] : undefined, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const productHref = `/${product.category}/${product.slug}?colour=${activeColor.id}`;

  const displayImage = activeColor?.image || product.featuredImage;

  return (
    <div className="group flex flex-col bg-paper border border-line/70 hover:border-gold/60 transition-all duration-300">
      {/* Image Container with Warm Stone Backdrop */}
      <Link
        href={productHref}
        className="relative block aspect-[4/5] bg-stone overflow-hidden active:opacity-90 active:scale-[0.99] transition-all"
      >
        {displayImage.startsWith('data:') || displayImage.startsWith('http') ? (
          <img
            src={displayImage}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <Image
            src={displayImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.isNewDrop && (
            <span className="bg-gold hover:bg-gold-deep text-ink text-[10px] tracking-[0.14em] uppercase px-2 py-0.5 font-medium border border-gold/30">
              New Drop
            </span>
          )}
          {product.isBestseller && (
            <span className="bg-gold text-ink text-[10px] tracking-[0.14em] uppercase px-2 py-0.5 font-semibold">
              Bestseller
            </span>
          )}
        </div>

        {/* Wishlist Heart Toggle */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          className={`absolute top-2.5 right-2.5 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-md ${
            isSaved
              ? 'bg-sand/90 text-gold shadow-md ring-1 ring-gold/40'
              : 'bg-paper/85 text-ink/70 hover:text-gold-deep hover:bg-paper shadow-sm'
          }`}
          aria-label={isSaved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          title={isSaved ? 'Saved in Wishlist' : 'Save to Wishlist'}
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 active:scale-125 ${
              isSaved ? 'fill-gold text-gold' : ''
            }`}
          />
        </button>

        {/* Pieces Count or Quick Specs */}
        {product.piecesIncluded && (
          <div className="absolute bottom-2.5 right-2.5 bg-sand/80 backdrop-blur-sm text-ink text-[10px] tracking-wider uppercase px-2 py-0.5 font-medium">
            {product.piecesIncluded.length} Pcs Set
          </div>
        )}

        {/* Quick Add overlay button (desktop hover & mobile accessible) */}
        <div className="absolute inset-x-2 bottom-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto hidden sm:block">
          <button
            type="button"
            onClick={handleQuickAdd}
            className="w-full py-2.5 bg-sand/90 hover:bg-gold hover:bg-gold-deep text-ink hover:text-gold text-[11px] font-semibold tracking-wider uppercase backdrop-blur-sm transition-all flex items-center justify-center space-x-1.5 shadow-md"
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Added to Bag</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Quick Add</span>
              </>
            )}
          </button>
        </div>
      </Link>

      {/* Product Details */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between space-y-2.5">
        <div>
          {/* Eyebrow / Category */}
          <div className="text-[10px] tracking-[0.16em] uppercase text-text-muted font-medium">
            {product.categoryLabel}
          </div>

          {/* Title */}
          <Link
            href={productHref}
            className="block mt-1 font-medium text-sm text-ink group-hover:text-gold-deep transition-colors line-clamp-1"
          >
            {product.name}
          </Link>
        </div>

        {/* Price, Swatches, and Mobile Quick Add */}
        <div className="pt-1 flex items-center justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="font-semibold text-base text-ink tabular-nums">
              ৳{product.price.toLocaleString('en-US')}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-text-muted line-through tabular-nums">
                ৳{product.originalPrice.toLocaleString('en-US')}
              </span>
            )}
          </div>

          {/* Right: Color Swatches & Mobile Add Icon */}
          <div className="flex items-center space-x-2">
            {/* Colour Swatch Dots */}
            <div className="flex items-center space-x-1.5">
              {product.colorways.slice(0, 3).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveColor(c);
                  }}
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    activeColor.id === c.id
                      ? 'border-ink scale-125 shadow-sm'
                      : 'border-black/20 hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                  aria-label={c.name}
                />
              ))}
              {product.colorways.length > 3 && (
                <span className="text-[10px] text-text-muted font-medium">
                  +{product.colorways.length - 3}
                </span>
              )}
            </div>

            {/* Mobile-only Quick Add button */}
            <button
              type="button"
              onClick={handleQuickAdd}
              className="sm:hidden p-1.5 rounded bg-sand hover:bg-stone text-ink transition-colors"
              aria-label={`Add ${product.name} to bag`}
            >
              {isAdded ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <ShoppingBag className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
