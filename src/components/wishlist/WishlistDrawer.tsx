'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, ShoppingBag, ArrowRight, Heart, Sparkles, Check } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';

export default function WishlistDrawer() {
  const { wishlist, isWishlistOpen, closeWishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart, openCart } = useCart();
  const [addedItemIds, setAddedItemIds] = React.useState<string[]>([]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeWishlist();
    };
    if (isWishlistOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isWishlistOpen, closeWishlist]);

  const handleMoveToBag = (product: any) => {
    addToCart(product, product.colorways[0], product.sizes ? product.sizes[1] || product.sizes[0] : undefined, 1);
    setAddedItemIds((prev) => [...prev, product.id]);
    setTimeout(() => {
      setAddedItemIds((prev) => prev.filter((id) => id !== product.id));
    }, 1500);
  };

  const handleMoveAllToBag = () => {
    wishlist.forEach((product) => {
      addToCart(product, product.colorways[0], product.sizes ? product.sizes[1] || product.sizes[0] : undefined, 1);
    });
    closeWishlist();
    openCart();
  };

  if (!isWishlistOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-sand/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={closeWishlist}
        aria-hidden="true"
      />

      {/* Slide-over Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-full max-w-md bg-paper border-l border-line shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-line bg-[#FAF7F0] flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold-deep">
                <Heart className="w-4 h-4 fill-gold-deep text-gold-deep" />
              </div>
              <div>
                <h2 className="font-serif text-lg sm:text-xl text-ink font-semibold">
                  Saved Pieces ({wishlist.length})
                </h2>
                <span className="text-[10px] uppercase tracking-wider text-text-muted">
                  Personal Keepsake Wishlist
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={closeWishlist}
              className="p-2 text-text-muted hover:text-ink transition-colors"
              aria-label="Close Wishlist"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-line">
            {wishlist.length === 0 ? (
              /* Empty State */
              <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4 space-y-4">
                <div className="w-16 h-16 rounded-full bg-sand/60 border border-line flex items-center justify-center text-gold-deep">
                  <Heart className="w-8 h-8 text-gold-deep" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-xl text-ink font-medium">Your Wishlist is Empty</h3>
                  <p className="text-xs text-text-muted max-w-xs leading-relaxed">
                    Save your favorite bridal chokers, velvet churis, and handbags here to curate your festive ensembles.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/shop"
                    onClick={closeWishlist}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gold hover:bg-gold-light text-ink font-semibold text-xs tracking-wider uppercase rounded-xs transition-all shadow-sm"
                  >
                    <span>Explore The Edit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              /* Wishlist Items List */
              <div className="space-y-4">
                {wishlist.map((product) => {
                  const isAdded = addedItemIds.includes(product.id);
                  return (
                    <div
                      key={product.id}
                      className="pt-4 first:pt-0 flex items-start justify-between gap-3 group"
                    >
                      {/* Product Thumbnail */}
                      <Link
                        href={`/${product.category}/${product.slug}`}
                        onClick={closeWishlist}
                        className="relative w-20 h-24 bg-stone rounded-xs overflow-hidden shrink-0 border border-line"
                      >
                        <Image
                          src={product.featuredImage}
                          alt={product.name}
                          fill
                          sizes="80px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      {/* Product Info & Actions */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <span className="text-[9px] uppercase tracking-wider text-text-muted font-medium block">
                          {product.categoryLabel}
                        </span>

                        <Link
                          href={`/${product.category}/${product.slug}`}
                          onClick={closeWishlist}
                          className="font-medium text-xs sm:text-sm text-ink hover:text-gold-deep transition-colors line-clamp-1 block"
                        >
                          {product.name}
                        </Link>

                        <div className="flex items-baseline space-x-2">
                          <span className="font-semibold text-xs sm:text-sm text-ink tabular-nums">
                            ৳{product.price.toLocaleString('en-US')}
                          </span>
                          {product.originalPrice && (
                            <span className="text-[11px] text-text-muted line-through tabular-nums">
                              ৳{product.originalPrice.toLocaleString('en-US')}
                            </span>
                          )}
                        </div>

                        {/* Available Colorways */}
                        <div className="flex items-center space-x-1 pt-0.5">
                          {product.colorways.slice(0, 4).map((c) => (
                            <span
                              key={c.id}
                              className="w-2.5 h-2.5 rounded-full border border-black/20"
                              style={{ backgroundColor: c.hex }}
                              title={c.name}
                            />
                          ))}
                        </div>

                        {/* Move to Bag Action */}
                        <div className="pt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleMoveToBag(product)}
                            className="px-3 py-1.5 bg-sand hover:bg-black text-gold-deep text-[10px] font-semibold tracking-wider uppercase rounded-xs transition-colors flex items-center space-x-1.5 shadow-xs"
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-3 h-3" />
                                <span>Add to Bag</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeFromWishlist(product.id)}
                        className="p-1.5 text-text-muted hover:text-red-700 transition-colors"
                        title="Remove from Wishlist"
                        aria-label={`Remove ${product.name} from Wishlist`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {wishlist.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-line bg-[#FAF7F0] space-y-3">
              <button
                type="button"
                onClick={handleMoveAllToBag}
                className="w-full py-3.5 bg-gold hover:bg-gold-light text-ink font-semibold text-xs tracking-wider uppercase rounded-xs transition-all flex items-center justify-center space-x-2 shadow-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Move All ({wishlist.length}) to Bag</span>
              </button>

              <div className="flex items-center justify-between text-xs text-text-muted pt-1">
                <button
                  type="button"
                  onClick={clearWishlist}
                  className="hover:text-red-700 transition-colors"
                >
                  Clear Wishlist
                </button>
                <span>Cash on Delivery Available</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
