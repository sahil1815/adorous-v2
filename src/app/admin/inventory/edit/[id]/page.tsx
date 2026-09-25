'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProductById, updateProductAction, updateStockAction } from '@/app/actions/productActions';
import { useInventory } from '@/context/InventoryContext';
import { ProductCategory, Colorway } from '@/types';
import {
  ArrowLeft, Sparkles, Upload, Image as ImageIcon, CheckCircle2, AlertCircle,
  Plus, Trash2, ShieldAlert, Tag, Loader2, Package, Infinity, Star, Layers, Palette, X,
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
  const { updateProduct } = useInventory();

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

  // Image Showcase & Gallery
  const [imageMode, setImageMode] = useState<'preset' | 'upload' | 'url'>('preset');
  const [featuredImage, setFeaturedImage] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [activePreviewImage, setActivePreviewImage] = useState<string>('');
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
  const [selectedColorImage, setSelectedColorImage] = useState<string>('');

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

      const gallery = (product.galleryImages && product.galleryImages.length > 0)
        ? product.galleryImages.map((g: any) => typeof g === 'string' ? g : g.url)
        : [product.featuredImage];

      setName(product.name);
      setSlug(product.slug);
      setCategory(product.category as ProductCategory);
      setTagline(product.tagline || '');
      setPrice(product.price);
      setOriginalPrice(product.originalPrice || 0);
      setDescription(product.description || '');
      setFeaturedImage(product.featuredImage);
      setGalleryImages(gallery);
      setActivePreviewImage(product.featuredImage);
      setDetails(product.details.map((d: any) => d.text || d));
      setPiecesIncluded(product.piecesIncluded.map((p: any) => p.text || p));
      setColorways(product.colorways.map((cw: any) => ({
        id: cw.colorId || cw.id,
        name: cw.name,
        hex: cw.hex,
        inStock: cw.inStock,
        image: cw.image || undefined,
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
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.startsWith('image/')) {
        validFiles.push(files[i]);
      }
    }

    if (validFiles.length === 0) {
      setErrorMsg('Please select valid image files (PNG, JPG, or WEBP).');
      return;
    }

    let loadedCount = 0;
    const newImages: string[] = [];

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        newImages.push(result);
        loadedCount++;
        if (loadedCount === validFiles.length) {
          setGalleryImages((prev) => [...prev, ...newImages]);
          setActivePreviewImage(newImages[0]);
          if (!featuredImage) {
            setFeaturedImage(newImages[0]);
          }
          setErrorMsg(null);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleAddCustomUrl = () => {
    const trimmed = customImageUrl.trim();
    if (!trimmed) return;
    if (!galleryImages.includes(trimmed)) {
      setGalleryImages((prev) => [...prev, trimmed]);
    }
    setActivePreviewImage(trimmed);
    if (!featuredImage) {
      setFeaturedImage(trimmed);
    }
    setCustomImageUrl('');
    setErrorMsg(null);
  };

  const handleSelectPreset = (url: string) => {
    if (!galleryImages.includes(url)) {
      setGalleryImages((prev) => [...prev, url]);
    }
    setActivePreviewImage(url);
    if (!featuredImage) {
      setFeaturedImage(url);
    }
  };

  const handleSetFeatured = (url: string) => {
    setFeaturedImage(url);
    setActivePreviewImage(url);
  };

  const handleRemoveImage = (urlToRemove: string) => {
    if (galleryImages.length <= 1) {
      setErrorMsg('Product must have at least one image in the gallery.');
      return;
    }
    const updated = galleryImages.filter((img) => img !== urlToRemove);
    setGalleryImages(updated);
    if (featuredImage === urlToRemove) {
      setFeaturedImage(updated[0]);
    }
    if (activePreviewImage === urlToRemove) {
      setActivePreviewImage(updated[0]);
    }
    setColorways((prev) =>
      prev.map((cw) => (cw.image === urlToRemove ? { ...cw, image: undefined } : cw))
    );
  };

  const handleAddColorway = () => {
    if (!colorName.trim()) return;
    const colorId = colorName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    setColorways([
      ...colorways,
      {
        id: colorId,
        name: colorName.trim(),
        hex: colorHex,
        inStock: true,
        image: selectedColorImage ? selectedColorImage : undefined,
      },
    ]);
    setColorName('');
    setSelectedColorImage('');
  };

  const handleRemoveColorway = (index: number) => {
    if (colorways.length <= 1) {
      setErrorMsg('Product must have at least one colorway.');
      return;
    }
    setColorways(colorways.filter((_, i) => i !== index));
  };

  const handleColorwayImageChange = (index: number, imgUrl: string | undefined) => {
    setColorways((prev) =>
      prev.map((cw, i) => (i === index ? { ...cw, image: imgUrl || undefined } : cw))
    );
    if (imgUrl) {
      setActivePreviewImage(imgUrl);
    }
  };

  const handleSelectColorwayForPreview = (cw: Colorway) => {
    if (cw.image) {
      setActivePreviewImage(cw.image);
    } else {
      setActivePreviewImage(featuredImage);
    }
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
      colorways: colorways.map(cw => ({
        id: cw.id,
        name: cw.name,
        hex: cw.hex,
        inStock: cw.inStock,
        image: cw.image || undefined,
      })),
      galleryImages: galleryImages.length > 0 ? galleryImages : [featuredImage],
    });

    if (!res.success) {
      setIsSaving(false);
      setErrorMsg(res.error || 'Failed to save changes.');
      return;
    }

    // Also update client inventory context for local fallback
    updateProduct({
      id: productId,
      slug,
      name: name.trim(),
      category,
      categoryLabel: selectedCat?.label || 'Luxury Accessories',
      tagline: tagline.trim(),
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      description: description.trim(),
      details,
      piecesIncluded,
      colorways,
      featuredImage,
      galleryImages: galleryImages.length > 0 ? galleryImages : [featuredImage],
      isNewDrop,
      isBestseller,
      isGiftPick,
      inStock,
      featuredRank: 1,
      seoKeywords: [name.trim(), category, 'premium jewelry', 'Dhaka boutique'],
    });

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

        {/* Section 3: Still-Life Photography & Product Gallery */}
        <div className="bg-[#141414] border border-gold/20 p-5 sm:p-6 rounded-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2">
              <ImageIcon className="w-4 h-4 text-gold" />
              <h2 className="font-serif text-base text-paper font-normal">
                3. Still-Life Photography Showcase & Gallery
              </h2>
              <span className="text-[11px] px-2 py-0.5 bg-gold/15 text-gold border border-gold/30 rounded-xs font-mono font-medium">
                {galleryImages.length} {galleryImages.length === 1 ? 'Photo' : 'Photos'}
              </span>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center space-x-1 bg-[#1C1C1C] p-0.5 rounded-xs border border-white/10 text-[11px]">
              <button
                type="button"
                onClick={() => setImageMode('preset')}
                className={`px-3 py-1 rounded-xs transition-colors ${
                  imageMode === 'preset' ? 'bg-gold text-ink font-semibold' : 'text-paper/70 hover:text-paper'
                }`}
              >
                Atelier Presets
              </button>
              <button
                type="button"
                onClick={() => setImageMode('upload')}
                className={`px-3 py-1 rounded-xs transition-colors ${
                  imageMode === 'upload' ? 'bg-gold text-ink font-semibold' : 'text-paper/70 hover:text-paper'
                }`}
              >
                Local Upload
              </button>
              <button
                type="button"
                onClick={() => setImageMode('url')}
                className={`px-3 py-1 rounded-xs transition-colors ${
                  imageMode === 'url' ? 'bg-gold text-ink font-semibold' : 'text-paper/70 hover:text-paper'
                }`}
              >
                Custom URL
              </button>
            </div>
          </div>

          {/* Active Preview & Source Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Active Plinth Frame */}
            <div className="lg:col-span-4 space-y-2">
              <div className="relative aspect-[4/5] bg-[#DDD6CB] rounded-xs overflow-hidden border-2 border-gold/40 shadow-lg flex items-center justify-center">
                {activePreviewImage ? (
                  activePreviewImage.startsWith('data:') || activePreviewImage.startsWith('http') ? (
                    <img
                      src={activePreviewImage}
                      alt="Still Life Product Preview"
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        setErrorMsg('Could not load image. Please verify the URL or upload.');
                      }}
                    />
                  ) : (
                    <Image
                      src={activePreviewImage}
                      alt="Still Life Product Preview"
                      fill
                      sizes="260px"
                      className="object-cover"
                    />
                  )
                ) : (
                  <div className="text-center p-4 text-[#4A4036]">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <span className="text-[10px] font-medium uppercase tracking-wider block">No image selected</span>
                  </div>
                )}

                {/* Primary Cover Badge or Gallery Preview Badge */}
                <div className="absolute top-2 left-2 z-10">
                  {activePreviewImage === featuredImage ? (
                    <span className="bg-gold text-ink text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs shadow flex items-center space-x-1">
                      <Star className="w-2.5 h-2.5 fill-ink" />
                      <span>Primary Cover</span>
                    </span>
                  ) : (
                    <span className="bg-black/75 backdrop-blur-xs text-paper text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-xs border border-white/20">
                      Gallery Preview
                    </span>
                  )}
                </div>

                {/* Linked Colorway Tag if active photo is mapped to a color */}
                {(() => {
                  const linked = colorways.find((c) => c.image === activePreviewImage);
                  if (!linked) return null;
                  return (
                    <div className="absolute top-2 right-2 z-10 flex items-center space-x-1 bg-black/85 backdrop-blur-xs px-2 py-0.5 rounded-xs border border-white/20">
                      <span className="w-2.5 h-2.5 rounded-full border border-black/40" style={{ backgroundColor: linked.hex }} />
                      <span className="text-[9px] text-paper font-medium">{linked.name}</span>
                    </div>
                  );
                })()}

                {/* Backdrop Authenticity Footer */}
                <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-xs text-gold text-[9px] px-2 py-1 rounded-xs uppercase tracking-widest text-center">
                  Still-Life Plinth Preview
                </div>
              </div>

              {/* Set as Cover action button if looking at secondary image */}
              {activePreviewImage !== featuredImage && (
                <button
                  type="button"
                  onClick={() => handleSetFeatured(activePreviewImage)}
                  className="w-full py-1.5 bg-[#1C1C1C] hover:bg-gold hover:text-ink text-gold border border-gold/40 text-[11px] font-medium rounded-xs transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Star className="w-3 h-3" />
                  <span>Set as Primary Cover Photo</span>
                </button>
              )}
            </div>

            {/* Right: Sources & Gallery Grid */}
            <div className="lg:col-span-8 space-y-4">
              {/* Presets Grid */}
              {imageMode === 'preset' && (
                <div className="space-y-2 p-3 bg-[#1C1C1C] border border-white/10 rounded-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-paper/80 font-semibold block">
                      Add from Verified Atelier Still-Life Photos:
                    </span>
                    <span className="text-[10px] text-paper/50">Click to add to gallery</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                    {STILL_LIFE_PRESETS.map((preset, idx) => {
                      const isAdded = galleryImages.includes(preset.url);
                      const isCover = featuredImage === preset.url;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectPreset(preset.url)}
                          className={`p-2 bg-[#141414] border rounded-xs text-left transition-all flex flex-col space-y-1.5 relative ${
                            activePreviewImage === preset.url
                              ? 'border-gold ring-1 ring-gold/50 bg-[#252525]'
                              : 'border-white/10 hover:border-white/30'
                          }`}
                        >
                          <div className="relative aspect-square w-full bg-[#DDD6CB] rounded-xs overflow-hidden">
                            <Image
                              src={preset.url}
                              alt={preset.name}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                            {isCover && (
                              <span className="absolute top-1 left-1 bg-gold text-ink text-[8px] font-bold px-1 rounded-xs">
                                Cover
                              </span>
                            )}
                            {isAdded && !isCover && (
                              <span className="absolute top-1 right-1 bg-emerald-600/90 text-white text-[8px] px-1 rounded-xs">
                                In Gallery
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-paper/80 font-medium line-clamp-1 block">
                            {preset.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Local Upload */}
              {imageMode === 'upload' && (
                <div className="space-y-3 p-4 bg-[#1C1C1C] border border-white/10 rounded-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-paper/80 font-semibold block">
                      Upload High-Resolution Photos (Select One or Multiple):
                    </span>
                    <span className="text-[10px] text-gold font-medium">Multiple files supported</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="block w-full text-xs text-paper/70 file:mr-4 file:py-2 file:px-4 file:rounded-xs file:border-0 file:text-xs file:font-semibold file:bg-gold file:text-ink hover:file:bg-gold-light cursor-pointer"
                  />
                  <p className="text-[10px] text-paper/40 leading-relaxed">
                    Strict still-life policy: Photos must feature the product on a warm stone plinth, velvet display stand, or flat-lay tray. No human faces, models, or hands.
                  </p>
                </div>
              )}

              {/* URL Input */}
              {imageMode === 'url' && (
                <div className="space-y-3 p-4 bg-[#1C1C1C] border border-white/10 rounded-xs">
                  <span className="text-[11px] text-paper/80 font-semibold block">
                    Add Direct Image URL (ImageKit, Cloudinary, Unsplash, etc.):
                  </span>
                  <div className="flex space-x-2">
                    <input
                      type="url"
                      placeholder="https://ik.imagekit.io/your-id/image.jpg"
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomUrl();
                        }
                      }}
                      className="flex-1 bg-[#141414] border border-white/15 px-3 py-2 text-paper rounded-xs focus:border-gold focus:outline-none text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomUrl}
                      className="px-4 py-2 bg-gold hover:bg-gold-light text-ink text-xs font-semibold rounded-xs whitespace-nowrap transition-colors flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Gallery</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-paper/40 leading-relaxed">
                    Enter any valid image link and click "Add to Gallery" to append multiple photos consecutively.
                  </p>
                </div>
              )}

              {/* Interactive Product Gallery Strip */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5 text-gold" />
                    <span className="text-[11px] text-paper/90 font-semibold">
                      Product Gallery ({galleryImages.length} {galleryImages.length === 1 ? 'photo' : 'photos'})
                    </span>
                  </div>
                  <span className="text-[10px] text-paper/50">
                    Click photo to preview · Star to set as Cover
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-h-60 overflow-y-auto pr-1">
                  {galleryImages.map((img, idx) => {
                    const isCover = img === featuredImage;
                    const isActive = img === activePreviewImage;
                    const linkedCws = colorways.filter((cw) => cw.image === img);

                    return (
                      <div
                        key={idx}
                        onClick={() => setActivePreviewImage(img)}
                        className={`group relative aspect-[4/5] bg-[#DDD6CB] rounded-xs overflow-hidden border cursor-pointer transition-all ${
                          isActive
                            ? 'border-gold ring-2 ring-gold/60 shadow-md'
                            : 'border-white/15 hover:border-white/40'
                        }`}
                      >
                        {img.startsWith('data:') || img.startsWith('http') ? (
                          <img
                            src={img}
                            alt={`Gallery item ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Image
                            src={img}
                            alt={`Gallery item ${idx + 1}`}
                            fill
                            sizes="120px"
                            className="object-cover"
                          />
                        )}

                        {/* Top Badges & Actions */}
                        <div className="absolute top-1 inset-x-1 flex items-center justify-between z-10">
                          {isCover ? (
                            <span className="bg-gold text-ink text-[8px] font-bold uppercase tracking-wider px-1 py-0.5 rounded-xs shadow flex items-center space-x-0.5">
                              <Star className="w-2 h-2 fill-ink" />
                              <span>Cover</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetFeatured(img);
                              }}
                              title="Set as Primary Cover Photo"
                              className="opacity-0 group-hover:opacity-100 bg-black/80 hover:bg-gold hover:text-ink text-paper text-[8px] px-1 py-0.5 rounded-xs transition-opacity"
                            >
                              Make Cover
                            </button>
                          )}

                          {galleryImages.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImage(img);
                              }}
                              title="Remove from gallery"
                              className="opacity-0 group-hover:opacity-100 p-1 bg-black/80 hover:bg-red-500 text-white rounded-xs transition-opacity"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>

                        {/* Bottom Tag if linked to colorway */}
                        {linkedCws.length > 0 && (
                          <div className="absolute inset-x-0 bottom-0 bg-black/85 backdrop-blur-xs px-1.5 py-0.5 flex items-center space-x-1 z-10">
                            <span
                              className="w-2 h-2 rounded-full border border-black/40 shrink-0"
                              style={{ backgroundColor: linkedCws[0].hex }}
                            />
                            <span className="text-[8px] text-paper truncate font-medium">
                              {linkedCws.map((c) => c.name).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Colorways & Finishes with Image Synchronization */}
        <div className="bg-[#141414] border border-gold/20 p-5 sm:p-6 rounded-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4 text-gold" />
              <h2 className="font-serif text-base text-paper font-normal">
                4. Colorways & Finishes ({colorways.length})
              </h2>
            </div>
            <p className="text-[10px] text-paper/50">
              Each colorway can be synced to a specific photo from the gallery above.
            </p>
          </div>

          {/* Colorways Cards List */}
          <div className="space-y-2">
            {colorways.map((cw, idx) => {
              const isAssigned = !!cw.image;
              const isCurrentPreview = activePreviewImage === (cw.image || featuredImage);

              return (
                <div
                  key={idx}
                  onClick={() => handleSelectColorwayForPreview(cw)}
                  className={`p-3 bg-[#1C1C1C] border rounded-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer ${
                    isCurrentPreview
                      ? 'border-gold/60 ring-1 ring-gold/30 bg-[#222222]'
                      : 'border-white/10 hover:border-white/25'
                  }`}
                >
                  {/* Left: Swatch & Name */}
                  <div className="flex items-center space-x-3 min-w-[200px]">
                    <span
                      className="w-5 h-5 rounded-full border border-black/40 shrink-0 shadow-xs"
                      style={{ backgroundColor: cw.hex }}
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-paper text-xs font-semibold">{cw.name}</span>
                        <span className="text-[10px] text-paper/40 font-mono">{cw.hex}</span>
                      </div>
                      <span className="text-[10px] text-gold/80 block">
                        Click card to preview photo
                      </span>
                    </div>
                  </div>

                  {/* Middle: Linked Photo Preview & Selector */}
                  <div
                    className="flex items-center space-x-2.5 flex-1 max-w-md bg-[#141414] p-1.5 rounded-xs border border-white/10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="relative w-8 h-10 bg-[#DDD6CB] rounded-xs overflow-hidden shrink-0 border border-white/20">
                      {(cw.image || featuredImage) ? (
                        (cw.image || featuredImage).startsWith('data:') || (cw.image || featuredImage).startsWith('http') ? (
                          <img
                            src={cw.image || featuredImage}
                            alt={cw.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Image
                            src={cw.image || featuredImage}
                            alt={cw.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#4A4036] text-[8px]">
                          None
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <label className="text-[9px] text-paper/50 uppercase tracking-wider block font-semibold">
                        Linked Photo:
                      </label>
                      <select
                        value={cw.image || ''}
                        onChange={(e) => handleColorwayImageChange(idx, e.target.value || undefined)}
                        className="w-full bg-[#1C1C1C] border border-white/15 px-2 py-1 text-paper rounded-xs text-[11px] focus:border-gold focus:outline-none"
                      >
                        <option value="">★ Primary Cover Photo (Default)</option>
                        {galleryImages.map((imgUrl, imgIdx) => (
                          <option key={imgIdx} value={imgUrl}>
                            Photo #{imgIdx + 1} {imgUrl === featuredImage ? '(Cover)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {isAssigned && (
                      <button
                        type="button"
                        onClick={() => handleColorwayImageChange(idx, undefined)}
                        title="Reset to Cover Photo"
                        className="p-1 text-paper/40 hover:text-paper text-[10px] transition-colors"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center space-x-2 shrink-0 justify-end" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleRemoveColorway(idx)}
                      className="p-1.5 text-paper/40 hover:text-red-400 rounded-xs transition-colors"
                      title="Remove colorway"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add New Colorway Form */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/10">
            <input
              type="text"
              placeholder="Color Name (e.g. Royal Ruby)"
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
              className="bg-[#1C1C1C] border border-white/15 px-3 py-1.5 text-paper rounded-xs focus:border-gold focus:outline-none text-xs flex-1 min-w-[150px]"
            />
            <div className="flex items-center space-x-1.5 bg-[#1C1C1C] border border-white/15 px-2 py-1 rounded-xs">
              <input
                type="color"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="w-6 h-6 bg-transparent cursor-pointer border-0 p-0"
              />
              <span className="font-mono text-paper/70 text-[10px]">{colorHex}</span>
            </div>

            {/* Optional Image to link directly */}
            <select
              value={selectedColorImage}
              onChange={(e) => setSelectedColorImage(e.target.value)}
              className="bg-[#1C1C1C] border border-white/15 px-2.5 py-1.5 text-paper rounded-xs text-xs focus:border-gold focus:outline-none"
            >
              <option value="">Link Photo: Cover Photo</option>
              {galleryImages.map((imgUrl, imgIdx) => (
                <option key={imgIdx} value={imgUrl}>
                  Link: Photo #{imgIdx + 1} {imgUrl === featuredImage ? '(Cover)' : ''}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleAddColorway}
              className="px-3.5 py-1.5 bg-[#252525] hover:bg-gold hover:text-ink border border-white/10 text-gold rounded-xs transition-colors flex items-center space-x-1 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Colorway</span>
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
