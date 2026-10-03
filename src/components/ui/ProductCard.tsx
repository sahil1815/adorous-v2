'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, Colorway } from '@/types';
import { ShoppingBag, Check, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useNewVisitorOffer } from '@/context/NewVisitorOfferContext';
import { formatPrice } from '@/lib/formatPrice';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Find the colorway corresponding to the featured cover image, or default to the first colorway
  const defaultColor = React.useMemo(() => {
    if (!product.colorways || product.colorways.length === 0) return undefined;
    if (product.featuredImage) {
      const match = product.colorways.find(
        (c) => c.image && (c.image === product.featuredImage || product.featuredImage.includes(c.image) || c.image.includes(product.featuredImage))
      );
      if (match) return match;
    }
    return product.colorways[0];
  }, [product.colorways, product.featuredImage]);

  const [userSelectedColor, setUserSelectedColor] = useState<Colorway | null>(null);
  const [prevProductKey, setPrevProductKey] = useState(`${product.id}-${product.featuredImage}`);

  if (prevProductKey !== `${product.id}-${product.featuredImage}`) {
    setPrevProductKey(`${product.id}-${product.featuredImage}`);
    setUserSelectedColor(null);
  }

  const activeColor = userSelectedColor || defaultColor || product.colorways?.[0];
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isOfferActive, discountPercent } = useNewVisitorOffer();

  // Price & Discount calculations (synchronized with ProductDetailClient)
  const baseOriginalPrice = product.originalPrice && product.originalPrice > product.price
    ? product.originalPrice
    : product.price;

  const existingDiscountPct = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Flat discount rule:
  // If product already has more discount than discountPercent, keep it as is (exception);
  // otherwise, make it flat discountPercent.
  const hasHigherExistingDiscount = isOfferActive && existingDiscountPct > discountPercent;
  const displayDiscountPct = isOfferActive
    ? (hasHigherExistingDiscount ? existingDiscountPct : discountPercent)
    : existingDiscountPct;

  const targetPrice = Math.round(baseOriginalPrice * (1 - discountPercent / 100) * 100) / 100;
  const sellingPrice = isOfferActive
    ? (hasHigherExistingDiscount ? product.price : Math.min(product.price, targetPrice))
    : product.price;

  const strikethroughPrice = baseOriginalPrice > sellingPrice ? baseOriginalPrice : null;

  const isSaved = isInWishlist(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (activeColor) {
      addToCart(product, activeColor, product.sizes ? product.sizes[1] || product.sizes[0] : undefined, 1);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1800);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const productHref = activeColor
    ? `/${product.category}/${product.slug}?colour=${activeColor.id}`
    : `/${product.category}/${product.slug}`;

  const displayImage = userSelectedColor
    ? (userSelectedColor.image || product.featuredImage || '')
    : (product.featuredImage || defaultColor?.image || activeColor?.image || '');

  return (
    <div className="group flex flex-col bg-paper border border-line/70 hover:border-gold/60 transition-all duration-300 w-full min-w-0 overflow-hidden">
      {/* Image Container with Warm Stone Backdrop */}
      <Link
        href={productHref}
        scroll={true}
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
        <div className="absolute top-2.5 left-2.5 flex flex-col items-start gap-1.5 z-10 pointer-events-none">
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
          {displayDiscountPct > 0 && (
            <span className="bg-[#9E2A2B] text-white text-[9px] sm:text-[10px] tracking-[0.1em] uppercase px-2 py-0.5 font-semibold shadow-xs">
              {displayDiscountPct}% OFF
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

        {/* Pieces Count or Quick Specs (including box / complimentary gift item) */}
        {(() => {
          const namePieceMatch = product.name?.match(/\((\d+)[- ]*(?:piece|pcs|pc)/i);
          const nameCount = namePieceMatch ? parseInt(namePieceMatch[1], 10) : 0;
          const piecesCount = (product.piecesIncluded?.length || 0) + (product.complimentaryItem ? 1 : 0);
          const displayPieces = Math.max(piecesCount, nameCount);
          if (displayPieces <= 0) return null;
          return (
            <div className="absolute bottom-2.5 right-2.5 bg-sand/80 backdrop-blur-sm text-ink text-[10px] tracking-wider uppercase px-2 py-0.5 font-medium">
              {displayPieces} Pcs Set
            </div>
          );
        })()}

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
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between space-y-2 min-w-0">
        <div className="min-w-0">
          {/* Eyebrow / Category */}
          <div className="text-[10px] tracking-[0.16em] uppercase text-text-muted font-medium truncate">
            {product.categoryLabel}
          </div>

          {/* Title */}
          <Link
            href={productHref}
            scroll={true}
            className="block mt-1 font-medium text-xs sm:text-sm text-ink group-hover:text-gold-deep transition-colors line-clamp-1"
          >
            {product.name}
          </Link>
        </div>

        {/* Price, Swatches, and Mobile Quick Add */}
        <div className="pt-1 flex flex-wrap sm:flex-nowrap items-center justify-between gap-1.5 sm:gap-2 min-w-0">
          <div className="flex items-baseline flex-wrap gap-x-1.5 gap-y-0.5 shrink-0 min-w-0">
            <span className="font-semibold text-sm sm:text-base text-ink tabular-nums">
              ৳{formatPrice(sellingPrice)}
            </span>
            {strikethroughPrice && strikethroughPrice > sellingPrice && (
              <>
                <span className="text-[10px] sm:text-xs text-text-muted line-through tabular-nums">
                  ৳{formatPrice(strikethroughPrice)}
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#9E2A2B] tracking-tight">
                  ({displayDiscountPct}% off)
                </span>
              </>
            )}
          </div>

          {/* Right: Color Swatches & Mobile Add Icon */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0 min-w-0">
            {/* Colour Swatch Dots */}
            <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
              {product.colorways.slice(0, 3).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setUserSelectedColor(c);
                  }}
                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border transition-all ${
                    activeColor?.id === c.id
                      ? 'border-ink scale-125 shadow-sm'
                      : 'border-black/20 hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                  aria-label={c.name}
                />
              ))}
              {product.colorways.length > 3 && (
                <span className="text-[9px] sm:text-[10px] text-text-muted font-medium">
                  +{product.colorways.length - 3}
                </span>
              )}
            </div>

            {/* Mobile-only Quick Add button */}
            <button
              type="button"
              onClick={handleQuickAdd}
              className="sm:hidden p-1 rounded bg-sand hover:bg-stone text-ink transition-colors shrink-0"
              aria-label={`Add ${product.name} to bag`}
            >
              {isAdded ? (
                <Check className="w-3 h-3 text-emerald-600" />
              ) : (
                <ShoppingBag className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
