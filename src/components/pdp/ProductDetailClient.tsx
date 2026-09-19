'use client';

import React, { useState, useEffect } from 'react';
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
  Sparkles,
  Share2,
  CheckCircle2,
  Box,
  Heart,
  Zap
} from 'lucide-react';

interface ProductDetailClientProps {
  product: Product;
  pairsWellWith: Product[];
}

export default function ProductDetailClient({ product, pairsWellWith }: ProductDetailClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem, closeCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

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
  const [activeImage, setActiveImage] = useState<string>(product.featuredImage);
  const [isSizingModalOpen, setIsSizingModalOpen] = useState(false);
  const [isAddedAnimation, setIsAddedAnimation] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

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
    <div className="bg-paper min-h-screen py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs text-text-muted mb-8 overflow-x-auto whitespace-nowrap max-w-full min-w-0">
          <Link href="/" className="hover:text-ink transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-ink transition-colors">The Edit</Link>
          <span>/</span>
          <Link href={`/${product.category}`} className="hover:text-ink transition-colors">
            {product.categoryLabel}
          </Link>
          <span>/</span>
          <span className="text-ink font-medium">{product.name}</span>
        </nav>

        {/* Main PDP Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Left Column: Gallery on Warm Stone Backdrop */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Visual */}
            <div className="relative aspect-[4/5] bg-stone border border-line overflow-hidden shadow-sm">
              <Image
                src={activeImage}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover object-center transition-all duration-300"
              />

              {/* Scarcity / Drop Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNewDrop && (
                  <span className="bg-ink text-gold-light text-xs tracking-wider uppercase px-3 py-1 font-medium border border-gold/30">
                    New Drop
                  </span>
                )}
                {product.isBestseller && (
                  <span className="bg-gold text-ink text-xs tracking-wider uppercase px-3 py-1 font-semibold">
                    Bestseller
                  </span>
                )}
              </div>

              {/* Top-Right Visual Actions: Wishlist & Share */}
              <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className={`p-2.5 backdrop-blur-sm border transition-all rounded-[2px] ${
                    isSaved
                      ? 'bg-ink text-gold border-gold/40 shadow-md'
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
                <span className="absolute top-16 right-4 bg-ink text-gold-light text-[11px] px-2.5 py-1 rounded-[2px] shadow-md animate-fade-in z-20">
                  Link copied!
                </span>
              )}

              {/* Backdrop Authenticity Watermark */}
              <div className="absolute bottom-4 right-4 bg-ink/70 backdrop-blur-sm text-paper/80 text-[10px] tracking-widest uppercase px-2.5 py-1">
                Still Life · Warm Stone Plinth
              </div>
            </div>

            {/* Thumbnail Strip */}
            {product.galleryImages.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {product.galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`relative aspect-[4/5] bg-stone border transition-all overflow-hidden ${
                      activeImage === img ? 'border-ink ring-1 ring-ink' : 'border-line hover:border-gold'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} view ${idx + 1}`}
                      fill
                      className="object-cover object-center"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Purchasing & Specifications */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              {/* Category & Title */}
              <div className="text-xs font-semibold tracking-[0.2em] uppercase text-gold-ink">
                {product.categoryLabel} · Limited Edition
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-ink font-medium mt-1">
                {product.name}
              </h1>
              <p className="text-xs sm:text-sm text-text-muted mt-2 leading-relaxed">
                {product.tagline}
              </p>

              {/* Price & COD Badge */}
              <div className="mt-4 pt-4 border-t border-line flex items-baseline justify-between">
                <div className="flex items-baseline space-x-3">
                  <span className="font-semibold text-2xl sm:text-3xl text-ink tabular-nums">
                    ৳{product.price.toLocaleString('en-US')}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm sm:text-base text-text-muted line-through tabular-nums">
                      ৳{product.originalPrice.toLocaleString('en-US')}
                    </span>
                  )}
                </div>

                <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-sand border border-line text-xs text-ink font-medium rounded-[2px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-success" />
                  <span>Cash on Delivery</span>
                </span>
              </div>

              {/* 1. Colorway Selector */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-ink uppercase tracking-wider">
                    Colourway: <strong className="text-gold-deep">{selectedColor.name}</strong>
                  </span>
                  <span className="text-text-muted">
                    {product.colorways.length} Finishes Available
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {product.colorways.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleColorChange(c)}
                      className={`flex items-center space-x-2 px-3 py-1.5 border rounded-[2px] text-xs transition-all ${
                        selectedColor.id === c.id
                          ? 'border-ink bg-sand/60 ring-1 ring-ink font-semibold'
                          : 'border-line hover:border-ink/60 bg-paper'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Sizing Selector (For Churi / Bangles) */}
              {product.sizes && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-ink uppercase tracking-wider">
                      Hand Size (Bangladesh Standard):
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsSizingModalOpen(true)}
                      className="text-gold-ink font-medium hover:underline flex items-center gap-1"
                    >
                      <Ruler className="w-3.5 h-3.5" /> Sizing Guide
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={`py-2 px-3 text-center border text-xs font-medium rounded-[2px] transition-all ${
                          selectedSize === s
                            ? 'border-ink bg-ink text-gold-light'
                            : 'border-line bg-sand/30 text-ink hover:border-ink/60'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-text-muted italic">
                    Most customers order <strong>2-6</strong>. Sizing exchange is free within 7 days.
                  </p>
                </div>
              )}

              {/* 3. Quantity & CTAs */}
              <div className="mt-8 space-y-3.5">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {/* Quantity Counter */}
                  <div className="flex items-center border border-line rounded-[2px] bg-sand/50 h-12 shrink-0">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-2.5 sm:px-3 text-ink hover:bg-sand transition-colors h-full flex items-center justify-center font-medium"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="px-2 sm:px-3 text-sm font-semibold tabular-nums text-ink">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="px-2.5 sm:px-3 text-ink hover:bg-sand transition-colors h-full flex items-center justify-center font-medium"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Bag Button */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 h-12 bg-sand/80 hover:bg-sand border border-gold/60 hover:border-gold text-ink font-semibold text-[11px] sm:text-xs tracking-wider uppercase rounded-[2px] transition-all flex items-center justify-center space-x-1.5 sm:space-x-2 px-2 sm:px-3 active:scale-[0.99]"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-gold-deep" />
                    <span className="truncate">{isAddedAnimation ? 'Added!' : 'Add to Bag'}</span>
                  </button>

                  {/* Order Now Button */}
                  <button
                    type="button"
                    onClick={handleOrderNow}
                    disabled={isOrdering}
                    className="flex-1 h-12 bg-gold hover:bg-gold-light text-ink font-semibold text-[11px] sm:text-xs tracking-wider uppercase rounded-[2px] transition-all flex items-center justify-center space-x-1.5 sm:space-x-2 px-2 sm:px-3 shadow-sm active:scale-[0.99]"
                  >
                    <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-ink shrink-0" />
                    <span className="truncate">{isOrdering ? 'Proceeding...' : 'Order Now'}</span>
                  </button>

                  {/* Wishlist Button */}
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product)}
                    className={`h-12 w-11 sm:w-12 border rounded-[2px] flex items-center justify-center transition-all shrink-0 ${
                      isSaved
                        ? 'bg-ink text-gold border-gold/40 shadow-sm'
                        : 'bg-paper border-line text-ink hover:border-gold hover:text-gold-deep'
                    }`}
                    title={isSaved ? 'Saved in Wishlist' : 'Save to Wishlist'}
                    aria-label={isSaved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
                  >
                    <Heart className={`w-4 h-4 transition-transform active:scale-125 ${isSaved ? 'fill-gold text-gold' : ''}`} />
                  </button>
                </div>

                {/* Direct WhatsApp Instant Checkout */}
                <a
                  href={generateDirectWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-12 bg-ink hover:bg-ink-soft text-gold-light border border-gold/40 font-medium text-xs tracking-wider uppercase rounded-[2px] transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-4 h-4 text-whatsapp" />
                  <span>Order Directly on WhatsApp</span>
                </a>
              </div>

              {/* 4. Bangladesh Logistics & Trust Box */}
              <div className="mt-8 p-4 bg-sand/60 border border-line space-y-3 text-xs">
                <div className="flex items-start space-x-2.5">
                  <Truck className="w-4 h-4 text-gold-deep shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold text-ink block">Delivery Rates & Timeline:</strong>
                    <span className="text-text-muted block">
                      • Dhaka & Gazipur: ৳80 (1–2 Days)
                    </span>
                    <span className="text-text-muted block">
                      • All Other Districts Nationwide: ৳130 (2–4 Days via Courier)
                    </span>
                    <span className="text-gold-deep font-medium block mt-0.5">
                      • Free Delivery on orders over ৳2,000
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-line/60 flex items-center space-x-2 text-text-muted">
                  <RotateCcw className="w-4 h-4 text-gold-deep shrink-0" />
                  <span>7-Day Doorstep Size & Style Exchange Guarantee</span>
                </div>
              </div>

              {/* 5. What's in the Box (Transparency Section) */}
              {product.piecesIncluded && (
                <div className="mt-6 border border-line p-4 bg-paper space-y-3">
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

              {/* 6. Product Description & Craftsmanship Details */}
              <div className="mt-6 pt-6 border-t border-line space-y-4">
                <h3 className="font-serif text-base font-semibold uppercase tracking-wider text-ink">
                  Details & Specifications
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  {product.description}
                </p>
                <ul className="space-y-2 text-xs text-ink">
                  {product.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0 mt-1.5" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <ReviewSection product={product} />

        {/* Pairs Well With Cross-Category Rail */}
        {pairsWellWith.length > 0 && (
          <section className="mt-20 pt-12 border-t border-line">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
              <div>
                <div className="text-xs font-semibold tracking-[0.2em] uppercase text-gold-ink">
                  Curated Coordination
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl text-ink font-medium mt-1">
                  Pairs Well With
                </h2>
                <p className="text-xs text-text-muted mt-1">
                  Styles designed to be worn alongside the {product.name}.
                </p>
              </div>
              <Link
                href="/shop"
                className="mt-3 sm:mt-0 text-xs font-semibold uppercase tracking-wider text-ink hover:text-gold-deep transition-colors"
              >
                View The Entire Edit →
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
    </div>
  );
}
