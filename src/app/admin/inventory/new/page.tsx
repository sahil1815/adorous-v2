'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useInventory } from '@/context/InventoryContext';
import { ProductCategory, Product, Colorway } from '@/types';
import { createProductAction } from '@/app/actions/productActions';
import {
  ArrowLeft,
  Sparkles,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  ShieldAlert,
  Tag,
  Check,
  Eye
} from 'lucide-react';

const CATEGORY_OPTIONS: { slug: ProductCategory; label: string }[] = [
  { slug: 'jewelry', label: 'Fine Jewelry Sets' },
  { slug: 'bags', label: "Ladies' Handbags" },
  { slug: 'churi', label: 'Bangles & Churi' },
  { slug: 'earrings', label: 'Chandbalis & Jhumkas' },
  { slug: 'more', label: 'More' },
];

// Verified 100% Still-Life Photography Presets (Strictly No Humans)
const STILL_LIFE_PRESETS = [
  {
    name: 'Warm Stone Bridal Plinth',
    category: 'jewelry',
    url: '/images/products/zari-bridal-choker-set/featured.png',
  },
  {
    name: 'Velvet Keepsake Hasli Tray',
    category: 'jewelry',
    url: '/images/products/noor-filigree-hasli-set/featured.png',
  },
  {
    name: 'Polki Pendant Stone Pedestal',
    category: 'jewelry',
    url: '/images/products/roshni-polki-pendant-set/featured.png',
  },
  {
    name: 'Plush Velvet Churi Stack',
    category: 'churi',
    url: '/images/products/velvet-mehendi-churi-stack/featured.png',
  },
  {
    name: 'Carved Antique Karas on Stone',
    category: 'churi',
    url: '/images/products/zamindar-antique-gold-kara/featured.png',
  },
  {
    name: 'Emerald Polki Bangles Stand',
    category: 'churi',
    url: '/images/products/emerald-twilight-polki-churi/featured.png',
  },
  {
    name: 'Architectural Top-Handle Bag',
    category: 'bags',
    url: '/images/products/jamdani-weave-leather-tote/featured.png',
  },
  {
    name: 'Gold Clasp Evening Box Bag',
    category: 'bags',
    url: '/images/products/zamindar-gold-clasp-clutch/featured.png',
  },
  {
    name: 'Bell Jhumkas on Marble Stand',
    category: 'earrings',
    url: '/images/products/gulshan-bell-jhumka/featured.png',
  },
  {
    name: 'Royal Navratan Chandbalis',
    category: 'earrings',
    url: '/images/products/navratan-regal-chandbali/featured.png',
  },
  {
    name: 'Monsoon Chestnut Wood Umbrella',
    category: 'more',
    url: '/images/products/monsoon-luxe-wood-umbrella/featured.png',
  },
];

export default function AddProductPage() {
  const router = useRouter();
  const { addProduct } = useInventory();

  // Basic Details
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugCustomized, setIsSlugCustomized] = useState(false);
  const [category, setCategory] = useState<ProductCategory>('jewelry');
  const [tagline, setTagline] = useState('');
  const [price, setPrice] = useState<number>(3850);
  const [originalPrice, setOriginalPrice] = useState<number>(4500);
  const [description, setDescription] = useState('');

  // Image Selection (Presets vs Upload vs URL)
  const [imageMode, setImageMode] = useState<'preset' | 'upload' | 'url'>('preset');
  const [featuredImage, setFeaturedImage] = useState<string>(STILL_LIFE_PRESETS[0].url);
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Bullet Points
  const [details, setDetails] = useState<string[]>([
    'Premium 22k antique gold electroplated brass alloy',
    'Micro-inlaid polki stones set in traditional closed back kundan',
    'Lined with soft silk thread cord and adjustable tassel closure',
    'Presented inside our signature rigid 1200gsm stone keepsake box',
  ]);
  const [newDetailText, setNewDetailText] = useState('');

  // Pieces Included
  const [piecesIncluded, setPiecesIncluded] = useState<string[]>([
    '1x Choker Necklace',
    '1x Pair of Matching Chandbalis',
    '1x Velvet Keepsake Pouch',
  ]);
  const [newPieceText, setNewPieceText] = useState('');

  // Colorways
  const [colorways, setColorways] = useState<Colorway[]>([
    { id: 'antique-gold', name: 'Antique Gold', hex: '#D4AF37', inStock: true },
    { id: 'emerald-green', name: 'Emerald Velvet', hex: '#1B4D3E', inStock: true },
  ]);
  const [colorName, setColorName] = useState('');
  const [colorHex, setColorHex] = useState('#B3804A');

  // Sizing & Badges
  const [includeSizes, setIncludeSizes] = useState(false);
  const [isNewDrop, setIsNewDrop] = useState(true);
  const [isBestseller, setIsBestseller] = useState(false);
  const [isGiftPick, setIsGiftPick] = useState(false);

  // States
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // Generate slug automatically from title unless user edited it
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isSlugCustomized) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generated);
    }
  };

  // Handle Image Upload (Converts to Data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, or WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFeaturedImage(result);
    };
    reader.readAsDataURL(file);
  };

  // Add detail item
  const handleAddDetail = () => {
    if (!newDetailText.trim()) return;
    setDetails([...details, newDetailText.trim()]);
    setNewDetailText('');
  };

  const handleRemoveDetail = (index: number) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  // Add piece item
  const handleAddPiece = () => {
    if (!newPieceText.trim()) return;
    setPiecesIncluded([...piecesIncluded, newPieceText.trim()]);
    setNewPieceText('');
  };

  const handleRemovePiece = (index: number) => {
    setPiecesIncluded(piecesIncluded.filter((_, i) => i !== index));
  };

  // Add Colorway
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
      },
    ]);
    setColorName('');
  };

  const handleRemoveColorway = (index: number) => {
    if (colorways.length <= 1) {
      setErrorMsg('Product must have at least one colorway.');
      return;
    }
    setColorways(colorways.filter((_, i) => i !== index));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Please enter a product title.');
      return;
    }

    if (!slug.trim()) {
      setErrorMsg('Please specify a URL slug.');
      return;
    }

    if (!featuredImage) {
      setErrorMsg('Please select or upload a featured still-life photo.');
      return;
    }

    if (price <= 0) {
      setErrorMsg('Price must be greater than 0.');
      return;
    }

    const selectedCategoryOption = CATEGORY_OPTIONS.find((c) => c.slug === category);
    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (!cleanSlug) {
      setErrorMsg('Please provide a valid URL slug using letters and numbers.');
      return;
    }

    setIsPublishing(true);

    const newProduct: Product = {
      id: `prod-${cleanSlug}-${Date.now()}`,
      slug: cleanSlug,
      name: name.trim(),
      category,
      categoryLabel: selectedCategoryOption ? selectedCategoryOption.label : 'Luxury Accessories',
      tagline: tagline.trim() || `${name.trim()} - Boutique Premium Luxury`,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      description: description.trim() || 'A premium curated piece designed for timeless elegance and luxury styling across Bangladesh.',
      details,
      piecesIncluded: piecesIncluded.length > 0 ? piecesIncluded : undefined,
      colorways,
      sizes: includeSizes ? ['2-4 (57mm)', '2-6 (60mm)', '2-8 (64mm)'] : undefined,
      featuredImage,
      galleryImages: [featuredImage],
      isNewDrop,
      isBestseller,
      isGiftPick,
      inStock: true,
      featuredRank: 1,
      seoKeywords: [
        name.trim(),
        category,
        'premium jewelry',
        'Dhaka boutique',
        'cash on delivery Bangladesh',
      ],
    };

    try {
      // 1. Persist directly to Neon PostgreSQL database via Server Action
      const res = await createProductAction(newProduct);
      if (!res.success) {
        setIsPublishing(false);
        setErrorMsg(res.error || 'Failed to save piece to database.');
        return;
      }

      // 2. Synchronize with local client context for instant reactivity
      addProduct(newProduct);

      setTimeout(() => {
        router.push('/admin/inventory');
      }, 500);
    } catch (err: any) {
      console.error('[handleSubmit] Error publishing piece:', err);
      setIsPublishing(false);
      setErrorMsg(err?.message || 'An error occurred while saving the product. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Top Header */}
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
            <h1 className="font-serif text-2xl sm:text-3xl text-paper font-normal">
              Add New Product
            </h1>
            <p className="text-xs text-paper/60 mt-0.5">
              Publish a new luxury design to the Adorous catalogue and live storefront.
            </p>
          </div>
        </div>
      </div>

      {/* Brand Mandate Banner */}
      <div className="p-4 bg-amber-950/30 border border-amber-600/40 rounded-xs flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-amber-200">
          <strong className="font-semibold block text-amber-300 uppercase tracking-wider text-[11px]">
            Strict Still-Life Mandate
          </strong>
          <p className="leading-relaxed text-paper/80">
            Adorous Fashion maintains an uncompromising visual identity: <strong>100% still-life product photography</strong> on warm stone plinths (<code className="text-gold font-mono">#DDD6CB</code>), velvet jewelry busts, or keepsakes trays. Strictly <strong>NO women models, faces, hands, or human silhouettes</strong> are permitted on any part of the platform.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-950/60 border border-red-700/40 rounded-xs flex items-center space-x-2 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Creation Form */}
      <form onSubmit={handleSubmit} className="space-y-8 text-xs">
        {/* Section 1: Title & Category */}
        <div className="bg-[#141414] border border-gold/20 p-5 sm:p-6 rounded-xs space-y-4">
          <h2 className="font-serif text-base text-paper font-normal flex items-center space-x-2 border-b border-white/10 pb-3">
            <Tag className="w-4 h-4 text-gold" />
            <span>1. Identity & Classification</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-paper/70 uppercase tracking-widest text-[10px] mb-1 font-semibold">
                Piece Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Zahra Meenakari Navratan Choker"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full bg-[#1C1C1C] border border-white/15 focus:border-gold px-3 py-2 text-paper rounded-xs text-xs focus:outline-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-paper/70 uppercase tracking-widest text-[10px] mb-1 font-semibold">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full bg-[#1C1C1C] border border-white/15 focus:border-gold px-3 py-2 text-paper rounded-xs text-xs focus:outline-none"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* URL Slug & Tagline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-paper/70 uppercase tracking-widest text-[10px] mb-1 font-semibold">
                URL Slug (Canonical Path) *
              </label>
              <div className="flex items-center space-x-1">
                <span className="text-paper/40 font-mono text-[11px]">/{category}/</span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setIsSlugCustomized(true);
                  }}
                  className="flex-1 bg-[#1C1C1C] border border-white/15 focus:border-gold px-2.5 py-1.5 text-paper rounded-xs font-mono text-xs focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-paper/70 uppercase tracking-widest text-[10px] mb-1 font-semibold">
                Subtitle / Tagline
              </label>
              <input
                type="text"
                placeholder="e.g. Architectural micro-potli with antique zardozi"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-[#1C1C1C] border border-white/15 focus:border-gold px-3 py-2 text-paper rounded-xs text-xs focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Pricing & Badges */}
        <div className="bg-[#141414] border border-gold/20 p-5 sm:p-6 rounded-xs space-y-4">
          <h2 className="font-serif text-base text-paper font-normal flex items-center space-x-2 border-b border-white/10 pb-3">
            <Sparkles className="w-4 h-4 text-gold" />
            <span>2. BDT (৳) Pricing & Merchandising Ribbons</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-paper/70 uppercase tracking-widest text-[10px] mb-1 font-semibold">
                Regular Selling Price (৳ BDT) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gold font-sans font-semibold">৳</span>
                <input
                  type="number"
                  required
                  min="1"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full bg-[#1C1C1C] border border-white/15 focus:border-gold pl-7 pr-3 py-2 text-paper rounded-xs text-xs focus:outline-none font-semibold text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-paper/70 uppercase tracking-widest text-[10px] mb-1 font-semibold">
                Original Compare Price (৳ BDT)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-paper/40 font-sans font-semibold">৳</span>
                <input
                  type="number"
                  min="0"
                  placeholder="0 for no strikethrough"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(Number(e.target.value))}
                  className="w-full bg-[#1C1C1C] border border-white/15 focus:border-gold pl-7 pr-3 py-2 text-paper rounded-xs text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Ribbons */}
          <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isNewDrop}
                onChange={(e) => setIsNewDrop(e.target.checked)}
                className="rounded-xs text-gold focus:ring-gold bg-[#1C1C1C] border-white/20"
              />
              <span className="text-paper/80 font-medium">Flag as "New Drop" Ribbon</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isBestseller}
                onChange={(e) => setIsBestseller(e.target.checked)}
                className="rounded-xs text-gold focus:ring-gold bg-[#1C1C1C] border-white/20"
              />
              <span className="text-paper/80 font-medium">Flag as "Bestseller"</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isGiftPick}
                onChange={(e) => setIsGiftPick(e.target.checked)}
                className="rounded-xs text-gold focus:ring-gold bg-[#1C1C1C] border-white/20"
              />
              <span className="text-paper/80 font-medium">Feature in "Curated Gifting"</span>
            </label>

            {category === 'churi' && (
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSizes}
                  onChange={(e) => setIncludeSizes(e.target.checked)}
                  className="rounded-xs text-gold focus:ring-gold bg-[#1C1C1C] border-white/20"
                />
                <span className="text-paper/80 font-medium">Enable 3-Size Bangles Selector (2-4, 2-6, 2-8)</span>
              </label>
            )}
          </div>
        </div>

        {/* Section 3: Still-Life Photography Selection */}
        <div className="bg-[#141414] border border-gold/20 p-5 sm:p-6 rounded-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <h2 className="font-serif text-base text-paper font-normal flex items-center space-x-2">
              <ImageIcon className="w-4 h-4 text-gold" />
              <span>3. Still-Life Photography Showcase</span>
            </h2>

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

          {/* Active Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            <div className="sm:col-span-4">
              <div className="relative aspect-[4/5] bg-[#DDD6CB] rounded-xs overflow-hidden border-2 border-gold/40 shadow-lg flex items-center justify-center">
                {featuredImage ? (
                  /* data: URIs (local upload) and external http(s) URLs cannot go through
                     next/image — use a plain <img> for those and keep <Image> only for
                     the verified local preset paths that start with "/" */
                  featuredImage.startsWith('data:') || featuredImage.startsWith('http') ? (
                    <img
                      src={featuredImage}
                      alt="Still Life Product Preview"
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        setErrorMsg('Could not load image from that URL. Please check the link and try again.');
                      }}
                    />
                  ) : (
                    <Image
                      src={featuredImage}
                      alt="Still Life Product Preview"
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                  )
                ) : (
                  <div className="text-center p-4 text-[#4A4036]">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <span className="text-[10px] font-medium uppercase tracking-wider block">No image selected</span>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-xs text-gold text-[9px] px-2 py-1 rounded-xs uppercase tracking-widest text-center">
                  Still-Life Plinth Preview
                </div>
              </div>
            </div>

            <div className="sm:col-span-8 space-y-3">
              {/* Presets Grid */}
              {imageMode === 'preset' && (
                <div className="space-y-2">
                  <span className="text-[11px] text-paper/70 font-semibold block">
                    Choose from Verified Atelier Still-Life Photos:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                    {STILL_LIFE_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFeaturedImage(preset.url)}
                        className={`p-2 bg-[#1C1C1C] border rounded-xs text-left transition-all flex flex-col space-y-1.5 ${
                          featuredImage === preset.url
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
                        </div>
                        <span className="text-[10px] text-paper/80 font-medium line-clamp-1 block">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Local Upload */}
              {imageMode === 'upload' && (
                <div className="space-y-3 p-4 bg-[#1C1C1C] border border-white/10 rounded-xs">
                  <span className="text-[11px] text-paper/80 font-semibold block">
                    Upload High-Resolution Still-Life Photo:
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="block w-full text-xs text-paper/70 file:mr-4 file:py-2 file:px-4 file:rounded-xs file:border-0 file:text-xs file:font-semibold file:bg-gold file:text-ink hover:file:bg-gold-light cursor-pointer"
                  />
                  {featuredImage.startsWith('data:') && (
                    <div className="flex items-center space-x-1.5 text-[10px] text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Image loaded — preview updated on the left</span>
                    </div>
                  )}
                  <p className="text-[10px] text-paper/40 leading-relaxed">
                    Strict still-life requirement: Ensure your uploaded image captures the product staged on a warm stone plinth, velvet jewelry neckform, or flat-lay tray. No human faces, hands, or models.
                  </p>
                </div>
              )}

              {/* URL input */}
              {imageMode === 'url' && (
                <div className="space-y-3 p-4 bg-[#1C1C1C] border border-white/10 rounded-xs">
                  <span className="text-[11px] text-paper/80 font-semibold block">
                    Direct Image URL (ImageKit, Cloudinary, etc.):
                  </span>
                  <div className="flex space-x-2">
                    <input
                      type="url"
                      placeholder="https://ik.imagekit.io/your-id/image.jpg"
                      value={customImageUrl}
                      onChange={(e) => {
                        setCustomImageUrl(e.target.value);
                        // Live preview — update as user types
                        if (e.target.value.trim().startsWith('http')) {
                          setFeaturedImage(e.target.value.trim());
                          setErrorMsg(null);
                        }
                      }}
                      className="flex-1 bg-[#141414] border border-white/15 px-3 py-2 text-paper rounded-xs focus:border-gold focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customImageUrl.trim()) {
                          setFeaturedImage(customImageUrl.trim());
                          setErrorMsg(null);
                        }
                      }}
                      className="px-4 py-2 bg-gold text-ink font-semibold rounded-xs whitespace-nowrap"
                    >
                      Apply
                    </button>
                  </div>
                  <p className="text-[10px] text-paper/40 leading-relaxed">
                    Supported CDNs: ImageKit, Cloudinary, Supabase, Imgur, Unsplash. The preview updates live as you type.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Colorways & Palette */}
        <div className="bg-[#141414] border border-gold/20 p-5 sm:p-6 rounded-xs space-y-4">
          <h2 className="font-serif text-base text-paper font-normal flex items-center space-x-2 border-b border-white/10 pb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-gold inline-block" />
            <span>4. Colorways & Finishes ({colorways.length})</span>
          </h2>

          <div className="flex flex-wrap gap-2">
            {colorways.map((cw, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-2 px-3 py-1.5 bg-[#1C1C1C] border border-white/10 rounded-xs"
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-black/40 shrink-0"
                  style={{ backgroundColor: cw.hex }}
                />
                <span className="text-paper/90 font-medium">{cw.name}</span>
                <span className="text-[10px] text-paper/40 font-mono">{cw.hex}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveColorway(idx)}
                  className="text-paper/40 hover:text-red-400 ml-1 transition-colors"
                  title="Remove colorway"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
            <input
              type="text"
              placeholder="Color Name (e.g. Royal Ruby)"
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
              className="bg-[#1C1C1C] border border-white/15 px-3 py-1.5 text-paper rounded-xs focus:border-gold focus:outline-none text-xs"
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
            <button
              type="button"
              onClick={handleAddColorway}
              className="px-3 py-1.5 bg-[#252525] hover:bg-[#303030] border border-white/10 text-gold rounded-xs transition-colors flex items-center space-x-1 font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Colorway</span>
            </button>
          </div>
        </div>

        {/* Section 5: Story, Specifications & Pieces Included */}
        <div className="bg-[#141414] border border-gold/20 p-5 sm:p-6 rounded-xs space-y-5">
          <h2 className="font-serif text-base text-paper font-normal flex items-center space-x-2 border-b border-white/10 pb-3">
            <span>5. Story, Craft Specifications & Piece Breakdown</span>
          </h2>

          {/* Description */}
          <div>
            <label className="block text-paper/70 uppercase tracking-widest text-[10px] mb-1 font-semibold">
              Craft Story / Aesthetic Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe the historical inspiration, craftsmanship, metalwork, and heirloom packaging..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#1C1C1C] border border-white/15 focus:border-gold px-3 py-2 text-paper rounded-xs text-xs focus:outline-none leading-relaxed"
            />
          </div>

          {/* Specifications */}
          <div className="space-y-2">
            <label className="block text-paper/70 uppercase tracking-widest text-[10px] font-semibold">
              Craft Specifications ({details.length} points)
            </label>
            <div className="space-y-1.5">
              {details.map((d, idx) => (
                <div key={idx} className="flex items-center justify-between bg-[#1C1C1C] p-2 rounded-xs border border-white/5">
                  <span className="text-paper/80 flex-1">{d}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDetail(idx)}
                    className="text-paper/40 hover:text-red-400 transition-colors ml-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex space-x-2 pt-1">
              <input
                type="text"
                placeholder="e.g. Dimensions: 14cm x 22cm, weight 120g"
                value={newDetailText}
                onChange={(e) => setNewDetailText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDetail();
                  }
                }}
                className="flex-1 bg-[#1C1C1C] border border-white/15 px-3 py-1.5 text-paper rounded-xs focus:border-gold focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddDetail}
                className="px-3 py-1.5 bg-[#252525] hover:bg-[#303030] text-gold rounded-xs border border-white/10"
              >
                Add
              </button>
            </div>
          </div>

          {/* Pieces Included */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <label className="block text-paper/70 uppercase tracking-widest text-[10px] font-semibold">
              What's in the Box ({piecesIncluded.length} items)
            </label>
            <div className="space-y-1.5">
              {piecesIncluded.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between bg-[#1C1C1C] p-2 rounded-xs border border-white/5">
                  <span className="text-paper/80 flex-1">{p}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePiece(idx)}
                    className="text-paper/40 hover:text-red-400 transition-colors ml-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex space-x-2 pt-1">
              <input
                type="text"
                placeholder="e.g. 1x Wax-Sealed Certificate of Authenticity"
                value={newPieceText}
                onChange={(e) => setNewPieceText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPiece();
                  }
                }}
                className="flex-1 bg-[#1C1C1C] border border-white/15 px-3 py-1.5 text-paper rounded-xs focus:border-gold focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddPiece}
                className="px-3 py-1.5 bg-[#252525] hover:bg-[#303030] text-gold rounded-xs border border-white/10"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Submit Action Bar */}
        <div className="sticky bottom-4 z-30 p-4 bg-[#141414]/90 backdrop-blur-md border border-gold/40 rounded-xs shadow-2xl flex items-center justify-between gap-4">
          <Link
            href="/admin/inventory"
            className="px-4 py-2.5 bg-[#1C1C1C] hover:bg-[#252525] text-paper/70 border border-white/10 rounded-xs transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isPublishing}
            className="px-6 py-2.5 bg-gold hover:bg-gold-light disabled:opacity-50 text-ink font-semibold text-xs tracking-wider uppercase rounded-xs transition-colors shadow-md flex items-center space-x-2"
          >
            {isPublishing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-ink border-t-transparent rounded-full animate-spin" />
                <span>Publishing Piece...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Publish to Catalogue</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
