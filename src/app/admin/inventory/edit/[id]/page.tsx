'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProductById, updateProductAction, updateStockAction } from '@/app/actions/productActions';
import { ProductCategory, Colorway } from '@/types';
import {
  ArrowLeft, Sparkles, Upload, Image as ImageIcon, CheckCircle2, AlertCircle,
  Plus, Trash2, ShieldAlert, Tag, Loader2, Package, Infinity,
} from 'lucide-react';

const CATEGORY_OPTIONS: { slug: ProductCategory; label: string }[] = [
  { slug: 'jewelry', label: 'Fine Jewelry Sets' },
  { slug: 'bags', label: "Ladies' Handbags" },
  { slug: 'churi', label: 'Bangles & Churi' },
  { slug: 'earrings', label: 'Chandbalis & Jhumkas' },
  { slug: 'more', label: 'More' },
];

const STILL_LIFE_PRESETS = [
  { name: 'Warm Stone Bridal Plinth', url: '/images/products/zari-bridal-choker-set/featured.png' },
  { name: 'Velvet Keepsake Hasli Tray', url: '/images/products/noor-filigree-hasli-set/featured.png' },
  { name: 'Polki Pendant Stone Pedestal', url: '/images/products/roshni-polki-pendant-set/featured.png' },
  { name: 'Plush Velvet Churi Stack', url: '/images/products/velvet-mehendi-churi-stack/featured.png' },
  { name: 'Carved Antique Karas on Stone', url: '/images/products/zamindar-antique-gold-kara/featured.png' },
  { name: 'Emerald Polki Bangles Stand', url: '/images/products/emerald-twilight-polki-churi/featured.png' },
  { name: 'Architectural Top-Handle Bag', url: '/images/products/jamdani-weave-leather-tote/featured.png' },
  { name: 'Gold Clasp Evening Box Bag', url: '/images/products/zamindar-gold-clasp-clutch/featured.png' },
  { name: 'Bell Jhumkas on Marble Stand', url: '/images/products/gulshan-bell-jhumka/featured.png' },
  { name: 'Royal Navratan Chandbalis', url: '/images/products/navratan-regal-chandbali/featured.png' },
];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Basic Details
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugCustomized, setIsSlugCustomized] = useState(false);
  const [category, setCategory] = useState<ProductCategory>('jewelry');
  const [tagline, setTagline] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [description, setDescription] = useState('');

  // Image
  const [imageMode, setImageMode] = useState<'preset' | 'upload' | 'url'>('preset');
  const [featuredImage, setFeaturedImage] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Details & Pieces
  const [details, setDetails] = useState<string[]>([]);
  const [newDetailText, setNewDetailText] = useState('');
  const [piecesIncluded, setPiecesIncluded] = useState<string[]>([]);
  const [newPieceText, setNewPieceText] = useState('');

  // Colorways
  const [colorways, setColorways] = useState<Colorway[]>([]);
  const [colorName, setColorName] = useState('');
  const [colorHex, setColorHex] = useState('#B3804A');

  // Badges
  const [isNewDrop, setIsNewDrop] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [isGiftPick, setIsGiftPick] = useState(false);
  const [inStock, setInStock] = useState(true);
  const [includeSizes, setIncludeSizes] = useState(false);

  // Stock management
  const [stockMode, setStockMode] = useState<'unlimited' | 'tracked'>('unlimited');
  const [stockQty, setStockQty] = useState<number>(0);
  const [stockSaving, setStockSaving] = useState(false);
  const [stockSaved, setStockSaved] = useState(false);

  // Form state
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      const product = await getProductById(productId);
      if (!product) { setNotFound(true); setLoading(false); return; }

      setName(product.name);
      setSlug(product.slug);
      setCategory(product.category as ProductCategory);
      setTagline(product.tagline || '');
      setPrice(product.price);
      setOriginalPrice(product.originalPrice || 0);
      setDescription(product.description || '');
      setFeaturedImage(product.featuredImage);
      setDetails(product.details.map((d: any) => d.text || d));
      setPiecesIncluded(product.piecesIncluded.map((p: any) => p.text || p));
      setColorways(product.colorways.map((cw: any) => ({
        id: cw.colorId || cw.id,
        name: cw.name,
        hex: cw.hex,
        inStock: cw.inStock,
      })));
      setIsNewDrop(product.isNewDrop);
      setIsBestseller(product.isBestseller);
      setIsGiftPick(product.isGiftPick);
      setInStock(product.inStock);

      if (product.stockQty === null || product.stockQty === undefined) {
        setStockMode('unlimited');
        setStockQty(0);
      } else {
        setStockMode('tracked');
        setStockQty(product.stockQty as number);
      }

      setLoading(false);
    }
    loadProduct();
  }, [productId]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isSlugCustomized) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setErrorMsg('Please select a valid image file.'); return; }
    const reader = new FileReader();
    reader.onload = () => setFeaturedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveStock = async () => {
    setStockSaving(true);
    const qty = stockMode === 'unlimited' ? null : stockQty;
    await updateStockAction(productId, qty);
    setStockSaving(false);
    setStockSaved(true);
    setTimeout(() => setStockSaved(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!name.trim()) { setErrorMsg('Please enter a product title.'); return; }
    if (!slug.trim()) { setErrorMsg('Please specify a URL slug.'); return; }
    if (!featuredImage) { setErrorMsg('Please select a featured image.'); return; }
    if (price <= 0) { setErrorMsg('Price must be greater than 0.'); return; }

    setIsSaving(true);
    const selectedCat = CATEGORY_OPTIONS.find((c) => c.slug === category);

    const res = await updateProductAction(productId, {
      name: name.trim(),
      slug,
      category,
      categoryLabel: selectedCat?.label || 'Luxury Accessories',
      tagline: tagline.trim() || undefined,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      description: description.trim() || undefined,
      featuredImage,
      isNewDrop,
      isBestseller,
      isGiftPick,
      inStock,
      seoKeywords: [name.trim(), category, 'premium jewelry', 'Dhaka boutique'],
      details,
      piecesIncluded,
      colorways,
      galleryImages: [featuredImage],
    });

    if (!res.success) {
      setIsSaving(false);
      setErrorMsg(res.error || 'Failed to save changes.');
      return;
    }

    setSavedSuccess(true);
    setTimeout(() => router.push('/admin/inventory'), 1200);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <h1 className="font-serif text-2xl text-paper">Product Not Found</h1>
        <p className="text-xs text-paper/60">This product does not exist in the database. Only admin-created products can be edited.</p>
        <Link href="/admin/inventory" className="inline-flex items-center space-x-2 text-gold text-xs hover:underline">
          <ArrowLeft className="w-4 h-4" /><span>Back to Inventory</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/inventory"
            className="p-2 bg-[#1C1C1C] hover:bg-[#252525] border border-white/10 text-paper/70 hover:text-paper rounded-xs transition-colors"
            title="Back to Inventory"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl text-paper font-normal">Edit Product</h1>
            <p className="text-xs text-paper/60 mt-0.5 font-mono">{slug}</p>
          </div>
        </div>
        {savedSuccess && (
          <div className="flex items-center space-x-1.5 text-emerald-400 text-xs">
            <CheckCircle2 className="w-4 h-4" /><span>Saved! Redirecting…</span>
          </div>
        )}
      </div>

      {/* Mandate Banner */}
      <div className="p-4 bg-amber-950/30 border border-amber-600/40 rounded-xs flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-200 leading-relaxed">
          <strong className="text-amber-300 uppercase tracking-wider text-[11px] block mb-1">Strict Still-Life Mandate</strong>
          All product images must be 100% still-life photography on warm stone plinths, velvet jewelry busts, or keepsake trays.
          <strong> No human faces, hands, or models.</strong>
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-950/60 border border-red-700/40 rounded-xs flex items-center space-x-2 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0" /><span>{errorMsg}</span>
        </div>
      )}

      {/* ── Stock Management ─────────────────────────────────────────────── */}
      <div className="bg-[#141414] border border-gold/20 p-5 sm:p-6 rounded-xs space-y-4">
        <h2 className="font-serif text-base text-paper font-normal flex items-center space-x-2 border-b border-white/10 pb-3">
          <Package className="w-4 h-4 text-gold" />
          <span>Stock Management</span>
        </h2>

        <div className="flex items-center space-x-1 bg-[#1C1C1C] p-0.5 rounded-xs border border-white/10 text-[11px] w-fit">
          <button
            type="button"
            onClick={() => setStockMode('unlimited')}
            className={`px-4 py-1.5 rounded-xs transition-colors flex items-center space-x-1.5 ${stockMode === 'unlimited' ? 'bg-gold text-ink font-semibold' : 'text-paper/70 hover:text-paper'}`}
          >
            <Infinity className="w-3.5 h-3.5" />
            <span>Unlimited</span>
          </button>
          <button
            type="button"
            onClick={() => setStockMode('tracked')}
            className={`px-4 py-1.5 rounded-xs transition-colors ${stockMode === 'tracked' ? 'bg-gold text-ink font-semibold' : 'text-paper/70 hover:text-paper'}`}
          >
            Track Quantity
          </button>
        </div>

        {stockMode === 'unlimited' ? (
          <p className="text-xs text-paper/50">
            ∞ Stock is not tracked — customers can always order this product regardless of quantity.
          </p>
        ) : (
          <div className="space-y-3">
            <label className="block text-paper/70 uppercase tracking-widest text-[10px] font-semibold">
              Available Units
            </label>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setStockQty(Math.max(0, stockQty - 1))}
                className="w-8 h-8 bg-[#1C1C1C] border border-white/15 rounded-xs text-paper/70 hover:text-paper flex items-center justify-center text-lg leading-none transition-colors"
              >
                −
              </button>
              <input
                type="number"
                min="0"
                value={stockQty}
                onChange={(e) => setStockQty(Math.max(0, Number(e.target.value)))}
                className="w-24 bg-[#1C1C1C] border border-white/15 focus:border-gold px-3 py-1.5 text-paper rounded-xs text-sm font-mono font-semibold focus:outline-none text-center"
              />
              <button
                type="button"
                onClick={() => setStockQty(stockQty + 1)}
                className="w-8 h-8 bg-[#1C1C1C] border border-white/15 rounded-xs text-paper/70 hover:text-paper flex items-center justify-center text-lg leading-none transition-colors"
              >
                +
              </button>
              <span className="text-xs text-paper/50 ml-1">units</span>
            </div>
            {stockQty === 0 && (
              <div className="flex items-center space-x-1.5 text-[11px] text-red-400">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Stock is 0 — product will be marked as Out of Stock on the storefront</span>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={handleSaveStock}
          disabled={stockSaving}
          className="px-4 py-2 bg-[#252525] hover:bg-[#303030] border border-white/10 text-paper/80 hover:text-gold rounded-xs text-xs transition-colors flex items-center space-x-2"
        >
          {stockSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : stockSaved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Package className="w-3.5 h-3.5" />}
          <span>{stockSaved ? 'Stock Saved!' : 'Save Stock Setting'}</span>
        </button>
      </div>

      {/* ── Main Form ──────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="space-y-8 text-xs">
        {/* Section 1: Identity */}
        <div className="bg-[#141414] border border-gold/20 p-5 sm:p-6 rounded-xs space-y-4">
          <h2 className="font-serif text-base text-paper font-normal flex items-center space-x-2 border-b border-white/10 pb-3">
            <Tag className="w-4 h-4 text-gold" />
            <span>1. Identity & Classification</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-paper/70 uppercase tracking-widest text-[10px] mb-1 font-semibold">Piece Title *</label>
              <input
                type="text" required value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full bg-[#1C1C1C] border border-white/15 focus:border-gold px-3 py-2 text-paper rounded-xs text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-paper/70 uppercase tracking-widest text-[10px] mb-1 font-semibold">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full bg-[#1C1C1C] border border-white/15 focus:border-gold px-3 py-2 text-paper rounded-xs text-xs focus:outline-none"
              >
                {CATEGORY_OPTIONS.map((cat) => <option key={cat.slug} value={cat.slug}>{cat.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-paper/70 uppercase tracking-widest text-[10px] mb-1 font-semibold">URL Slug *</label>
              <div className="flex items-center space-x-1">
                <span className="text-paper/40 font-mono text-[11px]">/{category}/</span>
                <input
                  type="text" required value={slug}
                  onChange={(e) => { setSlug(e.target.value); setIsSlugCustomized(true); }}
                  className="flex-1 bg-[#1C1C1C] border border-white/15 focus:border-gold px-2.5 py-1.5 text-paper rounded-xs font-mono text-xs focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-paper/70 uppercase tracking-widest text-[10px] mb-1 font-semibold">Subtitle / Tagline</label>
              <input
                type="text" value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-[#1C1C1C] border border-white/15 focus:border-gold px-3 py-2 text-paper rounded-xs text-xs focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Pricing */}
        <div className="bg-[#141414] border border-gold/20 p-5 sm:p-6 rounded-xs space-y-4">
          <h2 className="font-serif text-base text-paper font-normal flex items-center space-x-2 border-b border-white/10 pb-3">
            <Sparkles className="w-4 h-4 text-gold" />
            <span>2. BDT (৳) Pricing & Merchandising</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-paper/70 uppercase tracking-widest text-[10px] mb-1 font-semibold">Selling Price (৳) *</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gold font-sans font-semibold">৳</span>
                <input
                  type="number" required min="1" value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full bg-[#1C1C1C] border border-white/15 focus:border-gold pl-7 pr-3 py-2 text-paper rounded-xs text-xs focus:outline-none font-semibold text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-paper/70 uppercase tracking-widest text-[10px] mb-1 font-semibold">Compare Price (৳)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-paper/40 font-sans font-semibold">৳</span>
                <input
                  type="number" min="0" value={originalPrice}
                  onChange={(e) => setOriginalPrice(Number(e.target.value))}
                  className="w-full bg-[#1C1C1C] border border-white/15 focus:border-gold pl-7 pr-3 py-2 text-paper rounded-xs text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-6">
            {[
              { label: 'Flag as "New Drop"', checked: isNewDrop, set: setIsNewDrop },
              { label: 'Flag as "Bestseller"', checked: isBestseller, set: setIsBestseller },
              { label: 'Feature in "Curated Gifting"', checked: isGiftPick, set: setIsGiftPick },
              { label: 'Mark as In Stock', checked: inStock, set: setInStock },
            ].map(({ label, checked, set }) => (
              <label key={label} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox" checked={checked}
                  onChange={(e) => set(e.target.checked)}
                  className="rounded-xs text-gold focus:ring-gold bg-[#1C1C1C] border-white/20"
                />
                <span className="text-paper/80 font-medium">{label}</span>
              </label>
            ))}
            {category === 'churi' && (
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" checked={includeSizes} onChange={(e) => setIncludeSizes(e.target.checked)}
                  className="rounded-xs text-gold focus:ring-gold bg-[#1C1C1C] border-white/20" />
                <span className="text-paper/80 font-medium">Enable Bangle Sizes</span>
              </label>
            )}
          </div>
        </div>

        {/* Section 3: Image */}
        <div className="bg-[#141414] border border-gold/20 p-5 sm:p-6 rounded-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <h2 className="font-serif text-base text-paper font-normal flex items-center space-x-2">
              <ImageIcon className="w-4 h-4 text-gold" /><span>3. Still-Life Photography</span>
            </h2>
            <div className="flex items-center space-x-1 bg-[#1C1C1C] p-0.5 rounded-xs border border-white/10 text-[11px]">
              {(['preset', 'upload', 'url'] as const).map((mode) => (
                <button key={mode} type="button" onClick={() => setImageMode(mode)}
                  className={`px-3 py-1 rounded-xs capitalize transition-colors ${imageMode === mode ? 'bg-gold text-ink font-semibold' : 'text-paper/70 hover:text-paper'}`}>
                  {mode === 'preset' ? 'Atelier Presets' : mode === 'upload' ? 'Local Upload' : 'Custom URL'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            <div className="sm:col-span-4">
              <div className="relative aspect-[4/5] bg-[#DDD6CB] rounded-xs overflow-hidden border-2 border-gold/40 shadow-lg flex items-center justify-center">
                {featuredImage ? (
                  featuredImage.startsWith('data:') || featuredImage.startsWith('http') ? (
                    <img src={featuredImage} alt="Preview" className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; setErrorMsg('Could not load image URL.'); }} />
                  ) : (
                    <Image src={featuredImage} alt="Preview" fill sizes="200px" className="object-cover" />
                  )
                ) : (
                  <div className="text-center p-4 text-[#4A4036]">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <span className="text-[10px] font-medium uppercase tracking-wider block">No image</span>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-xs text-gold text-[9px] px-2 py-1 rounded-xs uppercase tracking-widest text-center">
                  Still-Life Plinth Preview
                </div>
              </div>
            </div>

            <div className="sm:col-span-8 space-y-3">
              {imageMode === 'preset' && (
                <div className="space-y-2">
                  <span className="text-[11px] text-paper/70 font-semibold block">Choose from Verified Atelier Photos:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                    {STILL_LIFE_PRESETS.map((preset, idx) => (
                      <button key={idx} type="button" onClick={() => setFeaturedImage(preset.url)}
                        className={`p-2 bg-[#1C1C1C] border rounded-xs text-left transition-all flex flex-col space-y-1.5 ${featuredImage === preset.url ? 'border-gold ring-1 ring-gold/50' : 'border-white/10 hover:border-white/30'}`}>
                        <div className="relative aspect-square w-full bg-[#DDD6CB] rounded-xs overflow-hidden">
                          <Image src={preset.url} alt={preset.name} fill sizes="80px" className="object-cover" />
                        </div>
                        <span className="text-[10px] text-paper/80 line-clamp-1 block">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {imageMode === 'upload' && (
                <div className="space-y-3 p-4 bg-[#1C1C1C] border border-white/10 rounded-xs">
                  <span className="text-[11px] text-paper/80 font-semibold block">Upload High-Resolution Still-Life Photo:</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload}
                    className="block w-full text-xs text-paper/70 file:mr-4 file:py-2 file:px-4 file:rounded-xs file:border-0 file:text-xs file:font-semibold file:bg-gold file:text-ink hover:file:bg-gold-light cursor-pointer" />
                  {featuredImage.startsWith('data:') && (
                    <div className="flex items-center space-x-1.5 text-[10px] text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /><span>Image loaded — preview updated</span>
                    </div>
                  )}
                </div>
              )}

              {imageMode === 'url' && (
                <div className="space-y-3 p-4 bg-[#1C1C1C] border border-white/10 rounded-xs">
                  <span className="text-[11px] text-paper/80 font-semibold block">Direct Image URL (ImageKit, Cloudinary, etc.):</span>
                  <div className="flex space-x-2">
                    <input type="url" placeholder="https://ik.imagekit.io/your-id/image.jpg"
                      value={customImageUrl}
                      onChange={(e) => {
                        setCustomImageUrl(e.target.value);
                        if (e.target.value.trim().startsWith('http')) { setFeaturedImage(e.target.value.trim()); setErrorMsg(null); }
                      }}
                      className="flex-1 bg-[#141414] border border-white/15 px-3 py-2 text-paper rounded-xs focus:border-gold focus:outline-none" />
                    <button type="button" onClick={() => { if (customImageUrl.trim()) { setFeaturedImage(customImageUrl.trim()); setErrorMsg(null); } }}
                      className="px-4 py-2 bg-gold text-ink font-semibold rounded-xs whitespace-nowrap">Apply</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Colorways */}
        <div className="bg-[#141414] border border-gold/20 p-5 sm:p-6 rounded-xs space-y-4">
          <h2 className="font-serif text-base text-paper font-normal flex items-center space-x-2 border-b border-white/10 pb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-gold inline-block" />
            <span>4. Colorways & Finishes ({colorways.length})</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {colorways.map((cw, idx) => (
              <div key={idx} className="flex items-center space-x-2 px-3 py-1.5 bg-[#1C1C1C] border border-white/10 rounded-xs">
                <span className="w-3.5 h-3.5 rounded-full border border-black/40 shrink-0" style={{ backgroundColor: cw.hex }} />
                <span className="text-paper/90 font-medium">{cw.name}</span>
                <span className="text-[10px] text-paper/40 font-mono">{cw.hex}</span>
                <button type="button" onClick={() => setColorways(colorways.filter((_, i) => i !== idx))}
                  className="text-paper/40 hover:text-red-400 ml-1 transition-colors">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
            <input type="text" placeholder="Color Name (e.g. Royal Ruby)" value={colorName}
              onChange={(e) => setColorName(e.target.value)}
              className="bg-[#1C1C1C] border border-white/15 px-3 py-1.5 text-paper rounded-xs focus:border-gold focus:outline-none text-xs" />
            <div className="flex items-center space-x-1.5 bg-[#1C1C1C] border border-white/15 px-2 py-1 rounded-xs">
              <input type="color" value={colorHex} onChange={(e) => setColorHex(e.target.value)} className="w-6 h-6 bg-transparent cursor-pointer border-0 p-0" />
              <span className="font-mono text-paper/70 text-[10px]">{colorHex}</span>
            </div>
            <button type="button"
              onClick={() => {
                if (!colorName.trim()) return;
                const id = colorName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
                setColorways([...colorways, { id, name: colorName.trim(), hex: colorHex, inStock: true }]);
                setColorName('');
              }}
              className="px-3 py-1.5 bg-[#252525] hover:bg-[#303030] border border-white/10 text-gold rounded-xs transition-colors flex items-center space-x-1 font-medium">
              <Plus className="w-3.5 h-3.5" /><span>Add Colorway</span>
            </button>
          </div>
        </div>

        {/* Section 5: Story & Specs */}
        <div className="bg-[#141414] border border-gold/20 p-5 sm:p-6 rounded-xs space-y-5">
          <h2 className="font-serif text-base text-paper font-normal flex items-center space-x-2 border-b border-white/10 pb-3">
            <span>5. Story, Craft Specifications & Piece Breakdown</span>
          </h2>

          <div>
            <label className="block text-paper/70 uppercase tracking-widest text-[10px] mb-1 font-semibold">Craft Story / Description</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#1C1C1C] border border-white/15 focus:border-gold px-3 py-2 text-paper rounded-xs text-xs focus:outline-none leading-relaxed" />
          </div>

          <div className="space-y-2">
            <label className="block text-paper/70 uppercase tracking-widest text-[10px] font-semibold">Craft Specifications ({details.length})</label>
            <div className="space-y-1.5">
              {details.map((d, idx) => (
                <div key={idx} className="flex items-center justify-between bg-[#1C1C1C] p-2 rounded-xs border border-white/5">
                  <span className="text-paper/80 flex-1">{d}</span>
                  <button type="button" onClick={() => setDetails(details.filter((_, i) => i !== idx))}
                    className="text-paper/40 hover:text-red-400 transition-colors ml-2"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
            <div className="flex space-x-2 pt-1">
              <input type="text" placeholder="e.g. 22k antique gold electroplated brass" value={newDetailText}
                onChange={(e) => setNewDetailText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (newDetailText.trim()) { setDetails([...details, newDetailText.trim()]); setNewDetailText(''); } } }}
                className="flex-1 bg-[#1C1C1C] border border-white/15 px-3 py-1.5 text-paper rounded-xs focus:border-gold focus:outline-none" />
              <button type="button" onClick={() => { if (newDetailText.trim()) { setDetails([...details, newDetailText.trim()]); setNewDetailText(''); } }}
                className="px-3 py-1.5 bg-[#252525] hover:bg-[#303030] text-gold rounded-xs border border-white/10">Add</button>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/5">
            <label className="block text-paper/70 uppercase tracking-widest text-[10px] font-semibold">What's in the Box ({piecesIncluded.length})</label>
            <div className="space-y-1.5">
              {piecesIncluded.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between bg-[#1C1C1C] p-2 rounded-xs border border-white/5">
                  <span className="text-paper/80 flex-1">{p}</span>
                  <button type="button" onClick={() => setPiecesIncluded(piecesIncluded.filter((_, i) => i !== idx))}
                    className="text-paper/40 hover:text-red-400 transition-colors ml-2"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
            <div className="flex space-x-2 pt-1">
              <input type="text" placeholder="e.g. 1x Choker Necklace" value={newPieceText}
                onChange={(e) => setNewPieceText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (newPieceText.trim()) { setPiecesIncluded([...piecesIncluded, newPieceText.trim()]); setNewPieceText(''); } } }}
                className="flex-1 bg-[#1C1C1C] border border-white/15 px-3 py-1.5 text-paper rounded-xs focus:border-gold focus:outline-none" />
              <button type="button" onClick={() => { if (newPieceText.trim()) { setPiecesIncluded([...piecesIncluded, newPieceText.trim()]); setNewPieceText(''); } }}
                className="px-3 py-1.5 bg-[#252525] hover:bg-[#303030] text-gold rounded-xs border border-white/10">Add</button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-white/10">
          <Link href="/admin/inventory"
            className="px-5 py-2.5 bg-[#1C1C1C] hover:bg-[#252525] border border-white/10 text-paper/70 rounded-xs text-xs transition-colors">
            Discard Changes
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-gold hover:bg-gold-light text-ink font-semibold rounded-xs text-xs transition-colors flex items-center space-x-2 shadow-sm disabled:opacity-60"
          >
            {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Saving…</span></> : <><CheckCircle2 className="w-4 h-4" /><span>Save Changes</span></>}
          </button>
        </div>
      </form>
    </div>
  );
}
