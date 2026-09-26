'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Product, Colorway } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import ChuriSizingModal from './ChuriSizingModal';
import ProductCard from '@/components/ui/ProductCard';
import ReviewSection from './ReviewSection';
import {
  ShoppingBag,
  MessageCircle,
  Truck,
  ShieldCheck,
  RotateCcw,
  Ruler,
  Check,
  ChevronDown,
  ChevronLeft,
  Sparkles,
  Share2,
  CheckCircle2,
  Box,
  Heart,
  Zap,
  Star
} from 'lucide-react';

interface ProductDetailClientProps {
  product: Product;
  pairsWellWith: Product[];
}

export default function ProductDetailClient({ product, pairsWellWith }: ProductDetailClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem, closeCart, openCart, totalItems } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isSaved = isInWishlist(product.id);

  // Colorway state with URL synchronization
  const initialColorParam = searchParams.get('colour');
  const matchedInitialColor = product.colorways.find(
    (c) => c.id.toLowerCase() === initialColorParam?.toLowerCase()
  ) || product.colorways[0];

  const [selectedColor, setSelectedColor] = useState<Colorway>(matchedInitialColor);
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes ? product.sizes[1] || product.sizes[0] : ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImage, setActiveImage] = useState<string>(matchedInitialColor?.image || product.featuredImage);
  const [isSizingModalOpen, setIsSizingModalOpen] = useState(false);
  const [isAddedAnimation, setIsAddedAnimation] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Dynamic delivery date for Bangladeshi logistics (Screenshot 1 matching)
  const deliveryDates = React.useMemo(() => {
    const now = new Date();
    const d1 = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const d2 = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    return `${d1.getDate()}–${d2.getDate()} ${d2.toLocaleString('en-US', { month: 'short' })}`;
  }, []);

  // All unique photos across featured, gallery, and colorways
  const allDisplayImages = Array.from(
    new Set([
      product.featuredImage,
      ...(product.galleryImages || []),
      ...(product.colorways || []).map((c) => c.image).filter(Boolean) as string[],
    ])
  );

  // Sync color selection with URL without reloading
  const handleColorChange = (colorway: Colorway) => {
    setSelectedColor(colorway);
    if (colorway.image) {
      setActiveImage(colorway.image);
    }
    const url = new URL(window.location.href);
    url.searchParams.set('colour', colorway.id);
    window.history.replaceState({}, '', url.toString());
  };

  const handleThumbnailClick = (img: string) => {
    setActiveImage(img);
    const matchedColor = product.colorways.find((c) => c.image === img);
    if (matchedColor && matchedColor.id !== selectedColor.id) {
      setSelectedColor(matchedColor);
      const url = new URL(window.location.href);
      url.searchParams.set('colour', matchedColor.id);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const [isOrdering, setIsOrdering] = useState(false);

  const handleAddToCart = () => {
    addItem(product, selectedColor, selectedSize || undefined, quantity);
    setIsAddedAnimation(true);
    setTimeout(() => setIsAddedAnimation(false), 2000);
  };

  const handleOrderNow = () => {
    setIsOrdering(true);
    addItem(product, selectedColor, selectedSize || undefined, quantity);
    closeCart();
    router.push('/checkout');
  };

  // WhatsApp order link pre-filling
  const generateDirectWhatsAppLink = () => {
    let message = `Hello Adorous Fashion,\n\nI would like to place an order for:\n`;
    message += `Product: ${product.name}\n`;
    message += `Category: ${product.categoryLabel}\n`;
    message += `Selected Colour: ${selectedColor.name}\n`;
    if (selectedSize) {
      message += `Size: ${selectedSize}\n`;
    }
    message += `Quantity: ${quantity}\n`;
    message += `Total: ৳${(product.price * quantity).toLocaleString('en-US')}\n\n`;
    message += `Payment: Cash on Delivery (COD)\n`;
    message += `Please confirm my delivery details.`;
    return `https://wa.me/8801577731381?text=${encodeURIComponent(message)}`;
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="bg-paper min-h-screen pt-1 pb-24 sm:py-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation (Hidden on mobile for clean hero matching Screenshot 1) */}
        <nav className="hidden sm:flex items-center space-x-2 text-xs text-text-muted mb-8 overflow-x-auto whitespace-nowrap max-w-full min-w-0">
          <Link href="/" className="hover:text-ink transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-ink transition-colors">Explore All</Link>
          <span>/</span>
          <Link href={`/${product.category}`} className="hover:text-ink transition-colors">
            {product.categoryLabel}
          </Link>
          <span>/</span>
          <span className="text-ink font-medium">{product.name}</span>
        </nav>

        {/* Main PDP Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-6 lg:gap-14">
          {/* Left Column: Gallery with Vertical Thumbnails on Desktop (Reference Layout) */}
          <div className="lg:col-span-7 flex flex-col lg:flex-row gap-3.5 items-start">
            {/* Thumbnail Strip (Vertical on Desktop, Hidden on Mobile for Clean Hero) */}
            {allDisplayImages.length > 1 && (
              <div className="hidden lg:flex flex-col gap-2.5 overflow-y-auto shrink-0 w-[84px] max-h-[580px] scrollbar-none py-0.5">
                {allDisplayImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleThumbnailClick(img)}
                    className={`relative aspect-square w-full bg-stone border rounded-[2px] transition-all overflow-hidden shrink-0 ${
                      activeImage === img
                        ? 'border-ink ring-2 ring-gold/70 shadow-sm'
                        : 'border-line hover:border-gold/80 opacity-75 hover:opacity-100'
                    }`}
                    aria-label={`View image ${idx + 1}`}
                  >
                    {img.startsWith('data:') || img.startsWith('http') ? (
                      <img
                        src={img}
                        alt={`${product.name} thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      <Image
                        src={img}
                        alt={`${product.name} thumbnail ${idx + 1}`}
                        fill
                        className="object-cover object-center"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Primary Visual */}
            <div className="relative aspect-[4/5] lg:aspect-[4/4.5] flex-1 w-full bg-stone border border-line overflow-hidden shadow-sm rounded-[2px]">
              {/* Mobile Top-Left Back Button (Reference Screenshot 1) */}
              <button
                type="button"
                onClick={() => router.back()}
                className="lg:hidden absolute top-3.5 left-3.5 z-20 w-9 h-9 rounded-full bg-paper/90 backdrop-blur-md border border-line flex items-center justify-center text-ink shadow-sm active:scale-90 transition-transform"
                aria-label="Go back"
              >
                <ChevronLeft className="w-5 h-5 -ml-0.5" />
              </button>

              {activeImage.startsWith('data:') || activeImage.startsWith('http') ? (
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-cover object-center transition-all duration-300"
                />
              ) : (
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover object-center transition-all duration-300"
                />
              )}

              {/* Scarcity / Drop Badges on Desktop */}
              <div className="hidden lg:flex absolute top-4 left-4 flex-col gap-2">
                {product.isNewDrop && (
                  <span className="bg-gold hover:bg-gold-deep text-ink text-xs tracking-wider uppercase px-3 py-1 font-medium border border-gold/30">
                    New Drop
                  </span>
                )}
                {product.isBestseller && (
                  <span className="bg-gold text-ink text-xs tracking-wider uppercase px-3 py-1 font-semibold">
                    Bestseller
                  </span>
                )}
              </div>

              {/* Top-Right Visual Actions on Desktop: Wishlist & Share */}
              <div className="hidden lg:flex absolute top-4 right-4 items-center space-x-2 z-10">
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className={`p-2.5 backdrop-blur-sm border transition-all rounded-[2px] ${
                    isSaved
                      ? 'bg-gold text-ink border-gold/40 shadow-md'
                      : 'bg-paper/85 border-line hover:bg-paper text-ink hover:text-gold-deep'
                  }`}
                  title={isSaved ? 'Saved in Wishlist' : 'Save to Wishlist'}
                  aria-label={isSaved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
                >
                  <Heart className={`w-4 h-4 transition-transform active:scale-125 ${isSaved ? 'fill-gold text-gold' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="p-2.5 bg-paper/85 backdrop-blur-sm border border-line hover:bg-paper text-ink transition-colors rounded-[2px]"
                  title="Share link"
                  aria-label="Share link"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
              {copiedLink && (
                <span className="absolute top-16 right-4 bg-gold hover:bg-gold-deep text-ink text-[11px] px-2.5 py-1 rounded-[2px] shadow-md animate-fade-in z-20">
                  Link copied!
                </span>
              )}

              {/* Mobile Bottom-Left Rating & Stock Pill Badge (Reference Screenshot 1) */}
              <div className="lg:hidden absolute bottom-3 left-3 z-20 flex items-center gap-1.5 bg-paper/90 backdrop-blur-md border border-line px-2.5 py-1 rounded-full shadow-sm text-xs font-semibold text-ink">
                <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                  4.80 <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </span>
                <span className="text-line">|</span>
                <span className="text-emerald-700 font-medium">In Stock</span>
              </div>

              {/* Mobile Center Wishlist Heart & Slide Dots (Reference Screenshot 1) */}
              <div className="lg:hidden absolute bottom-3 inset-x-0 flex flex-col items-center justify-center pointer-events-none z-20 gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product);
                  }}
                  className="pointer-events-auto p-2 rounded-full bg-paper/95 backdrop-blur-md border border-line shadow-md text-ink hover:text-rose-500 active:scale-125 transition-all"
                  aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart className={`w-5 h-5 ${isSaved ? 'fill-rose-500 text-rose-500' : 'text-ink/80'}`} />
                </button>

                {allDisplayImages.length > 1 && (
                  <div className="flex items-center gap-1.5 bg-paper/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-line pointer-events-auto shadow-xs">
                    {allDisplayImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleThumbnailClick(img)}
                        className={`rounded-full transition-all ${
                          activeImage === img
                            ? 'w-4 h-1.5 bg-gold-deep'
                            : 'w-1.5 h-1.5 bg-ink/30 hover:bg-ink/60'
                        }`}
                        aria-label={`Jump to image ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Bottom-Right View Similar (Reference Screenshot 1) */}
              <a
                href="#similar-products"
                className="lg:hidden absolute bottom-3 right-3 z-20 flex items-center gap-1 bg-paper/90 backdrop-blur-md border border-line px-2.5 py-1 rounded-full shadow-sm text-[11px] font-medium text-ink hover:text-gold-deep transition-colors"
              >
                <Sparkles className="w-3 h-3 text-gold-deep" />
                <span>View Similar</span>
              </a>

              {/* Backdrop Authenticity Watermark on Desktop */}
              <div className="hidden lg:block absolute bottom-4 right-4 bg-sand/60 backdrop-blur-sm text-ink/80 text-[10px] tracking-widest uppercase px-2.5 py-1">
                Still Life · Warm Stone Plinth
              </div>
            </div>
          </div>

          {/* Right Column: Purchasing & Specifications */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-3 sm:space-y-6">
            <div>
              {/* Category & Title with Share Icon (Screenshot 1 matching) */}
              <div className="flex items-start justify-between gap-2 sm:gap-3">
                <div>
                  <div className="text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] uppercase text-gold-ink">
                    {product.categoryLabel} · Limited Edition
                  </div>
                  <h1 className="font-serif text-lg sm:text-2xl lg:text-3xl text-ink font-semibold mt-0.5 leading-snug">
                    {product.name}
                  </h1>
                </div>
                <button
                  type="button"
                  onClick={handleShare}
                  className="p-1.5 sm:p-2 text-ink hover:text-gold-deep hover:bg-sand/60 transition-colors shrink-0 rounded-full"
                  title="Share product"
                  aria-label="Share product"
                >
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Tagline hidden on mobile for clean luxury look, visible on desktop */}
              {product.tagline && (
                <p className="hidden sm:block text-xs sm:text-sm text-text-muted mt-2 leading-relaxed">
                  {product.tagline}
                </p>
              )}

              {/* Price & COD Badge with Discount Percentage (Screenshot 1 matching) */}
              <div className="mt-2 sm:mt-3.5 pt-2 sm:pt-3 border-t border-line flex items-center justify-between flex-wrap gap-1.5">
                <div className="flex items-baseline space-x-2 sm:space-x-2.5">
                  <span className="font-bold text-xl sm:text-3xl text-ink tabular-nums">
                    ৳{product.price.toLocaleString('en-US')}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="text-xs sm:text-base text-text-muted line-through tabular-nums">
                        ৳{product.originalPrice.toLocaleString('en-US')}
                      </span>
                      <span className="text-[10px] sm:text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-[2px] border border-amber-200/60">
                        ({Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF)
                      </span>
                    </>
                  )}
                </div>

                <span className="inline-flex items-center space-x-1 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-sand/70 border border-line text-[11px] sm:text-xs text-ink font-medium rounded-[2px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-success" />
                  <span>Cash on Delivery</span>
                </span>
              </div>

              {/* 1. Select Color (Screenshot 1 matching) */}
              <div className="mt-2 sm:mt-4 space-y-1.5 sm:space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-ink text-xs sm:text-sm">
                    Select Color
                  </span>
                  <span className="text-text-muted text-[11px] sm:text-xs">
                    {selectedColor.name}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {product.colorways.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleColorChange(c)}
                      className={`flex items-center space-x-1.5 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-[4px] text-xs transition-all ${
                        selectedColor.id === c.id
                          ? 'border-2 border-ink bg-paper font-semibold shadow-xs'
                          : 'border border-line hover:border-ink/50 bg-paper text-ink/80'
                      }`}
                    >
                      <span
                        className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-[11px] sm:text-xs">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Sizing Selector (For Churi / Bangles) */}
              {product.sizes && (
                <div className="mt-2.5 sm:mt-5 space-y-1.5 sm:space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-ink uppercase tracking-wider text-[11px] sm:text-xs">
                      Hand Size:
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsSizingModalOpen(true)}
                      className="text-gold-ink font-medium hover:underline flex items-center gap-1 text-[11px] sm:text-xs"
                    >
                      <Ruler className="w-3 h-3" /> Guide
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={`py-1.5 px-2.5 text-center border text-xs font-medium rounded-[2px] transition-all ${
                          selectedSize === s
                            ? 'border-ink bg-gold hover:bg-gold-deep text-ink'
                            : 'border-line bg-sand/30 text-ink hover:border-ink/60'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Dedicated Quantity Stepper Row (Screenshot 1 matching) */}
              <div className="mt-2 sm:mt-4 flex items-center justify-between">
                <span className="font-semibold text-ink text-xs sm:text-sm">
                  Quantity
                </span>
                <div className="flex items-center border border-line rounded-[4px] bg-paper h-8 sm:h-9 shrink-0 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 sm:w-9 h-full text-ink hover:bg-sand transition-colors flex items-center justify-center font-medium text-sm sm:text-base select-none"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="w-9 sm:w-10 text-center text-xs font-semibold tabular-nums text-ink select-none">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 sm:w-9 h-full text-ink hover:bg-sand transition-colors flex items-center justify-center font-medium text-sm sm:text-base select-none"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Low-stock warning */}
              {typeof (product as any).stockQty === 'number' && (product as any).stockQty > 0 && (product as any).stockQty <= 3 && (
                <div className="mt-3 flex items-center space-x-2 px-3 py-2 bg-amber-950/40 border border-amber-600/40 rounded-xs text-xs text-amber-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                  <span>Only <strong>{(product as any).stockQty}</strong> {(product as any).stockQty === 1 ? 'piece' : 'pieces'} left in stock</span>
                </div>
              )}

              {/* Desktop-only action buttons */}
              <div className="hidden lg:flex items-center gap-3 w-full pt-4">
                {/* Buy Now Button (Primary Accent) */}
                {(product as any).stockQty === 0 || product.inStock === false ? (
                  <div className="flex-1 h-12 bg-sand/20 border border-line text-ink/40 font-semibold text-xs tracking-wider uppercase rounded-[3px] flex items-center justify-center space-x-2 cursor-not-allowed">
                    <Zap className="w-4 h-4 shrink-0" />
                    <span>Unavailable</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleOrderNow}
                    disabled={isOrdering}
                    className="flex-1 h-12 bg-gold hover:bg-gold-light text-ink font-semibold text-xs tracking-wider uppercase rounded-[3px] transition-all flex items-center justify-center space-x-2 px-4 shadow-sm active:scale-[0.99]"
                  >
                    <Zap className="w-4 h-4 fill-ink shrink-0" />
                    <span>{isOrdering ? 'Proceeding...' : 'Buy Now'}</span>
                  </button>
                )}

                {/* Add to Bag Button (Secondary Luxury Brand Button) */}
                {(product as any).stockQty === 0 || product.inStock === false ? (
                  <button
                    type="button"
                    disabled
                    className="flex-1 h-12 bg-[#F0EDE8] border border-line text-ink/40 font-semibold text-xs tracking-wider uppercase rounded-[3px] flex items-center justify-center space-x-2 cursor-not-allowed opacity-80"
                  >
                    <ShoppingBag className="w-4 h-4 shrink-0 text-ink/40" />
                    <span>Out of Stock</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 h-12 bg-sand/80 hover:bg-sand border border-gold/60 hover:border-gold text-ink font-semibold text-xs tracking-wider uppercase rounded-[3px] transition-all flex items-center justify-center space-x-2 px-4 shadow-sm active:scale-[0.99]"
                  >
                    <ShoppingBag className="w-4 h-4 shrink-0 text-gold-deep" />
                    <span>{isAddedAnimation ? 'Added!' : 'Add to Bag'}</span>
                  </button>
                )}

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className={`h-12 w-12 border rounded-[3px] flex items-center justify-center transition-all shrink-0 ${
                    isSaved
                      ? 'bg-gold text-ink border-gold/40 shadow-sm'
                      : 'bg-paper border-line text-ink hover:border-gold hover:text-gold-deep'
                  }`}
                  title={isSaved ? 'Saved in Wishlist' : 'Save to Wishlist'}
                  aria-label={isSaved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
                >
                  <Heart className={`w-4 h-4 transition-transform active:scale-125 ${isSaved ? 'fill-gold text-gold' : ''}`} />
                </button>
              </div>

              {/* Direct WhatsApp Instant Checkout on Desktop */}
              <a
                href={generateDirectWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:flex w-full h-11 mt-3 bg-sand/70 hover:bg-sand border border-line/80 text-ink hover:text-gold-deep font-medium text-xs tracking-wider uppercase rounded-[3px] transition-colors items-center justify-center space-x-2 shadow-xs"
              >
                <MessageCircle className="w-4 h-4 text-whatsapp" />
                <span>Order Directly on WhatsApp</span>
              </a>

              {/* Trust, Delivery & Shop Card (Screenshot 1 matching) */}
              <div className="mt-6 p-3.5 bg-paper border border-line rounded-lg flex items-center justify-between gap-3 shadow-xs">
                {/* Left: 4 logistics bullets */}
                <div className="space-y-1.5 text-xs text-ink/90 flex-1">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-3.5 h-3.5 text-gold-deep shrink-0" />
                    <span><strong>Return :</strong> 7 Days Exchange</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-3.5 h-3.5 text-gold-deep shrink-0" />
                    <span><strong>Exchange :</strong> Size & Finish Exchangeable</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-gold-deep shrink-0" />
                    <span><strong>Promised Delivery by</strong> {deliveryDates}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-success shrink-0" />
                    <span><strong>Payment :</strong> COD Available</span>
                  </div>
                </div>

                {/* Right: Boutique / Shop Badge */}
                <div className="shrink-0 p-3 bg-sand/40 border border-line rounded-md text-xs flex flex-col items-center justify-center text-center min-w-[105px]">
                  <div className="flex items-center gap-1 text-gold-ink font-semibold text-xs">
                    <span>🏪</span>
                    <span>Shop</span>
                  </div>
                  <div className="font-serif font-bold text-ink text-xs mt-1">
                    Adorous Shop
                  </div>
                  <span className="text-[10px] text-text-muted mt-0.5">Dhaka Flagship</span>
                </div>
              </div>

              {/* Collapsible Highlights & Details Card with Overlapping See More (Screenshot 1 & 2 matching) */}
              <div className="mt-6 mb-7 border border-line rounded-lg p-4 bg-paper relative shadow-xs">
                <div className={`space-y-2 text-xs text-ink transition-all duration-300 ${
                  !isDescriptionExpanded ? 'max-h-40 overflow-hidden' : 'max-h-[1200px]'
                }`}>
                  <ul className="space-y-2 list-none">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-deep mt-1.5 shrink-0" />
                      <span><strong>Craftsmanship:</strong> 100% Solid Brass with Micron Gold Plating</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-deep mt-1.5 shrink-0" />
                      <span><strong>Finish:</strong> Anti-tarnish dual lacquer protective coating</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-deep mt-1.5 shrink-0" />
                      <span><strong>Safety:</strong> Skin-safe, hypoallergenic, cadmium & nickel-free</span>
                    </li>
                    {product.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-deep mt-1.5 shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                    {product.description && (
                      <li className="pt-2 text-text-muted leading-relaxed border-t border-line/60">
                        {product.description}
                      </li>
                    )}
                  </ul>
                </div>

                {/* Fade overlay when collapsed */}
                {!isDescriptionExpanded && (
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-paper via-paper/80 to-transparent pointer-events-none rounded-b-lg" />
                )}

                {/* Overlapping See More Button on the bottom border */}
                <button
                  type="button"
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 px-5 py-1 rounded-full text-xs font-semibold bg-gold-deep hover:bg-gold-ink text-paper shadow-md transition-all z-10 flex items-center gap-1 active:scale-95"
                >
                  <span>{isDescriptionExpanded ? 'See Less' : 'See More'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDescriptionExpanded ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* What's in Your Package (Transparency Section) */}
              {product.piecesIncluded && (
                <div className="mt-8 border border-line p-4 bg-paper space-y-3 rounded-lg">
                  <div className="flex items-center space-x-2 text-ink">
                    <Box className="w-4 h-4 text-gold-deep" />
                    <h3 className="font-serif text-sm font-semibold uppercase tracking-wider">
                      What's in Your Package:
                    </h3>
                  </div>
                  <ul className="space-y-1.5 text-xs text-ink/90 divide-y divide-line/40">
                    {product.piecesIncluded.map((piece, i) => (
                      <li key={i} className="pt-1.5 flex items-center justify-between">
                        <span className="flex items-center space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                          <span>{piece}</span>
                        </span>
                        <span className="text-text-muted text-[11px]">Included</span>
                      </li>
                    ))}
                    <li className="pt-1.5 flex items-center justify-between text-gold-ink font-medium">
                      <span className="flex items-center space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-gold-deep shrink-0" />
                        <span>Adorous Signature Keepsake Box & Velvet Pouch</span>
                      </span>
                      <span className="text-[11px]">Complimentary</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <ReviewSection product={product} />

        {/* Similar Products (Screenshot 3 matching) */}
        {pairsWellWith.length > 0 && (
          <section id="similar-products" className="mt-16 pt-8 border-t border-line scroll-mt-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl text-ink font-semibold">
                  Similar Products
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Curated pieces handcrafted to complement the {product.name}.
                </p>
              </div>
              <Link
                href="/shop"
                className="mt-2 sm:mt-0 text-xs font-semibold uppercase tracking-wider text-ink hover:text-gold-deep transition-colors"
              >
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {pairsWellWith.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sizing Modal */}
      <ChuriSizingModal
        isOpen={isSizingModalOpen}
        onClose={() => setIsSizingModalOpen(false)}
      />

      {/* Mobile PDP Sticky Checkout Bar (Screenshot 1, 2, 3 matching) */}
      {isMounted && createPortal(
        <div className="fixed bottom-0 inset-x-0 z-[100] bg-paper/95 backdrop-blur-md border-t border-line py-2 px-3 shadow-2xl lg:hidden pb-[calc(env(safe-area-inset-bottom)+0.625rem)]">
          <div className="flex items-center gap-2 w-full max-w-lg mx-auto">
            {/* Cart Icon */}
            <button
              type="button"
              onClick={openCart}
              className="flex flex-col items-center justify-center shrink-0 w-11 relative text-ink hover:text-gold-deep transition-colors"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" strokeWidth={1.75} />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center tabular-nums shadow-xs">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium mt-0.5">Cart</span>
            </button>

            {/* Vertical Divider */}
            <div className="w-px h-7 bg-line shrink-0" />

            {/* WhatsApp / Chat Icon */}
            <a
              href={generateDirectWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center shrink-0 w-11 relative text-ink hover:text-whatsapp transition-colors"
            >
              <div className="relative">
                <MessageCircle className="w-5 h-5 text-whatsapp" strokeWidth={1.75} />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-whatsapp animate-ping" />
              </div>
              <span className="text-[10px] font-medium mt-0.5">Chat</span>
            </a>

            {/* Action Buttons: Buy Now & Add to Cart full pills */}
            <div className="flex flex-1 items-center gap-2 pl-1">
              {/* Buy Now Button (Warm Amber / Orange) */}
              <button
                type="button"
                onClick={handleOrderNow}
                disabled={isOrdering || (product as any).stockQty === 0 || product.inStock === false}
                className="flex-1 py-2.5 px-3 bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold text-xs sm:text-sm rounded-full shadow-sm active:scale-95 transition-all text-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isOrdering ? 'Wait...' : 'Buy Now'}
              </button>

              {/* Add to Cart Button (Primary Brand Accent) */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={(product as any).stockQty === 0 || product.inStock === false}
                className="flex-1 py-2.5 px-3 bg-gold-deep hover:bg-gold-ink text-paper font-semibold text-xs sm:text-sm rounded-full shadow-sm active:scale-95 transition-all text-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddedAnimation ? 'Added!' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
