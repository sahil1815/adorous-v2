'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Palette,
  ShoppingBag,
  Search,
  ExternalLink,
  Layers,
  Sparkles,
  Sliders,
  Check,
  ImageIcon,
} from 'lucide-react';
import {
  getLookbookLooks,
  getLookbookSettings,
  saveLookbookLook,
  deleteLookbookLook,
  reorderLookbookLooks,
  updateLookbookSettings,
} from '@/app/actions/lookbookActions';
import { getAllProducts } from '@/app/actions/productActions';
import {
  LookbookLook,
  LookbookSettingsData,
  DEFAULT_LOOKBOOK_SETTINGS,
  LookbookPaletteItem,
} from '@/data/lookbook';
import { Product, ProductCategory } from '@/types';
import { formatPrice } from '@/lib/formatPrice';

function fromDbProduct(p: any): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category as ProductCategory,
    categoryLabel: p.categoryLabel || 'Luxury Accessories',
    tagline: p.tagline || '',
    price: Number(p.price),
    originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
    stockQty: p.stockQty ?? null,
    inStock: p.inStock ?? true,
    description: p.description || '',
    details: Array.isArray(p.details)
      ? p.details.map((d: any) => (typeof d === 'string' ? d : d.text))
      : [],
    piecesIncluded: Array.isArray(p.piecesIncluded)
      ? p.piecesIncluded.map((pi: any) => (typeof pi === 'string' ? pi : pi.text))
      : [],
    colorways: (p.colorways || []).map((cw: any) => ({
      id: cw.colorId || cw.id,
      name: cw.name,
      hex: cw.hex,
      inStock: cw.inStock ?? true,
      image: cw.image || null,
    })),
    sizes: p.sizes,
    featuredImage: p.featuredImage,
    galleryImages: Array.isArray(p.galleryImages)
      ? p.galleryImages.map((g: any) => (typeof g === 'string' ? g : g.url))
      : [p.featuredImage],
    isNewDrop: Boolean(p.isNewDrop),
    isGiftPick: Boolean(p.isGiftPick),
    isBestseller: Boolean(p.isBestseller),
    featuredRank: p.featuredRank ?? 999,
    seoKeywords:
      typeof p.seoKeywords === 'string'
        ? p.seoKeywords.split(',')
        : Array.isArray(p.seoKeywords)
        ? p.seoKeywords
        : [],
  };
}

// Preset still-life images for quick selection
const STILL_LIFE_IMAGE_PRESETS = [
  { label: 'Hero Still Life (Plinth & Bag)', url: '/images/hero/hero-still-life.jpg' },
  { label: 'Zari Bridal Choker', url: '/images/products/jewelry-zari-choker.jpg' },
  { label: 'Meher Emerald Velvet Bangles', url: '/images/products/churi-meher-emerald.jpg' },
  { label: 'Gulshan Charcoal Structured Tote', url: '/images/products/bag-gulshan-charcoal.jpg' },
  { label: 'Hasli Minimalist Collar', url: '/images/products/jewelry-hasli-collar.jpg' },
  { label: 'Mayur Bell Jhumkas', url: '/images/products/jewelry-mayur-jhumka.jpg' },
  { label: 'Royal Crimson Velvet Churi', url: '/images/products/churi-shaadi-crimson.jpg' },
  { label: 'Monsoon Silk Umbrella', url: '/images/products/umbrella-rain-silk.jpg' },
];

export default function AdminLookbookPage() {
  const [activeTab, setActiveTab] = useState<'looks' | 'settings'>('looks');
  const [looks, setLooks] = useState<LookbookLook[]>([]);
  const [settings, setSettings] = useState<LookbookSettingsData>(DEFAULT_LOOKBOOK_SETTINGS);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Look Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLookId, setEditingLookId] = useState<string | null>(null);
  const [formNumeral, setFormNumeral] = useState('LOOK I');
  const [formTitle, setFormTitle] = useState('');
  const [formTagline, setFormTagline] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formHeroImage, setFormHeroImage] = useState('/images/hero/hero-still-life.jpg');
  const [formPalette, setFormPalette] = useState<LookbookPaletteItem[]>([]);
  const [formItemIds, setFormItemIds] = useState<string[]>([]);
  const [formIsActive, setFormIsActive] = useState(true);
  const [productSearch, setProductSearch] = useState('');

  // Delete Confirmation State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState<LookbookSettingsData>(DEFAULT_LOOKBOOK_SETTINGS);

  const showToast = useCallback((msg: string, isError = false) => {
    if (isError) {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 5000);
    } else {
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedLooks, fetchedSettings, rawProducts] = await Promise.all([
        getLookbookLooks(true),
        getLookbookSettings(),
        getAllProducts(true),
      ]);
      setLooks(fetchedLooks);
      setSettings(fetchedSettings);
      setSettingsForm(fetchedSettings);
      setProducts(rawProducts.map(fromDbProduct));
    } catch (err) {
      console.error('Failed to load lookbook data:', err);
      showToast('Failed to load lookbook data. Please refresh.', true);
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Product map for quick lookup
  const productMap = useMemo(() => {
    const map = new Map<string, Product>();
    for (const p of products) {
      map.set(p.id, p);
      map.set(p.slug, p);
    }
    return map;
  }, [products]);

  // Filtered products for modal selection
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const q = productSearch.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q)
    );
  }, [products, productSearch]);

  // Open modal to create a new look
  const handleOpenCreateModal = () => {
    const nextIndex = looks.length + 1;
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    const roman = romanNumerals[looks.length] || String(nextIndex);

    setEditingLookId(null);
    setFormNumeral(`LOOK ${roman}`);
    setFormTitle('');
    setFormTagline('');
    setFormDescription('');
    setFormHeroImage('/images/hero/hero-still-life.jpg');
    setFormPalette([
      { name: 'Antique Gold', hex: '#C6A96E' },
      { name: 'Limestone Sand', hex: '#DDD6CB' },
      { name: 'Charcoal Black', hex: '#22262B' },
    ]);
    setFormItemIds([]);
    setFormIsActive(true);
    setProductSearch('');
    setIsModalOpen(true);
  };

  // Open modal to edit an existing look
  const handleOpenEditModal = (look: LookbookLook) => {
    setEditingLookId(look.id);
    setFormNumeral(look.numeral);
    setFormTitle(look.title);
    setFormTagline(look.tagline);
    setFormDescription(look.description);
    setFormHeroImage(look.heroImage);
    setFormPalette(look.palette && look.palette.length > 0 ? [...look.palette] : []);
    setFormItemIds([...look.itemIds]);
    setFormIsActive(look.isActive);
    setProductSearch('');
    setIsModalOpen(true);
  };

  // Toggle product selection in modal
  const handleToggleProduct = (productId: string) => {
    setFormItemIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Palette item handlers
  const handleAddPaletteItem = () => {
    setFormPalette((prev) => [...prev, { name: 'Warm Hue', hex: '#C6A96E' }]);
  };

  const handleUpdatePaletteItem = (index: number, field: 'name' | 'hex', value: string) => {
    setFormPalette((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemovePaletteItem = (index: number) => {
    setFormPalette((prev) => prev.filter((_, i) => i !== index));
  };

  // Save Look
  const handleSaveLook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast('Please provide a title for the look.', true);
      return;
    }
    if (!formHeroImage.trim()) {
      showToast('Please specify a still-life hero image.', true);
      return;
    }

    setIsSaving(true);
    try {
      const res = await saveLookbookLook({
        id: editingLookId || undefined,
        numeral: formNumeral,
        title: formTitle,
        tagline: formTagline,
        description: formDescription,
        heroImage: formHeroImage,
        palette: formPalette,
        itemIds: formItemIds,
        isActive: formIsActive,
      });

      if (res.success && res.look) {
        showToast(editingLookId ? 'Look updated successfully!' : 'New look created successfully!');
        setIsModalOpen(false);
        await loadAll();
      } else {
        showToast(res.error || 'Failed to save look.', true);
      }
    } catch (err) {
      console.error(err);
      showToast('An unexpected error occurred while saving the look.', true);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Visibility
  const handleToggleActive = async (look: LookbookLook) => {
    try {
      const res = await saveLookbookLook({
        ...look,
        isActive: !look.isActive,
      });
      if (res.success) {
        setLooks((prev) =>
          prev.map((l) => (l.id === look.id ? { ...l, isActive: !look.isActive } : l))
        );
        showToast(`Look ${!look.isActive ? 'published' : 'hidden'}.`);
      } else {
        showToast(res.error || 'Failed to update visibility.', true);
      }
    } catch {
      showToast('Failed to update look visibility.', true);
    }
  };

  // Delete Look
  const handleDeleteLook = async (id: string) => {
    setIsSaving(true);
    try {
      const res = await deleteLookbookLook(id);
      if (res.success) {
        setLooks((prev) => prev.filter((l) => l.id !== id));
        setDeleteConfirmId(null);
        showToast('Look removed successfully.');
      } else {
        showToast(res.error || 'Failed to delete look.', true);
      }
    } catch {
      showToast('Error deleting look.', true);
    } finally {
      setIsSaving(false);
    }
  };

  // Move Look Up / Down
  const handleMoveLook = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= looks.length) return;

    const copy = [...looks];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    setLooks(copy);

    try {
      const ids = copy.map((l) => l.id);
      const res = await reorderLookbookLooks(ids);
      if (res.success) {
        showToast('Looks order updated.');
      } else {
        showToast(res.error || 'Failed to save new order.', true);
        await loadAll();
      }
    } catch {
      showToast('Failed to save order.', true);
      await loadAll();
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateLookbookSettings(settingsForm);
      if (res.success && res.settings) {
        setSettings(res.settings);
        showToast('Editorial settings updated successfully!');
      } else {
        showToast(res.error || 'Failed to update settings.', true);
      }
    } catch {
      showToast('Error updating settings.', true);
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate ensemble total for modal
  const formEnsembleTotal = useMemo(() => {
    return formItemIds.reduce((sum, id) => {
      const p = productMap.get(id);
      return sum + (p ? p.price : 0);
    }, 0);
  }, [formItemIds, productMap]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-gold font-medium mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Storefront Visual Curation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-medium text-white tracking-tight">
            Lookbook & Editorial Management
          </h1>
          <p className="text-xs text-white/60 mt-1 max-w-2xl leading-relaxed">
            Curate multi-piece still-life ensembles for the dedicated Lookbook atelier, configure color palettes, attach catalogue pieces, and edit the homepage lookbook editorial band.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <Link
            href="/lookbook"
            target="_blank"
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-[#1C1C1C] hover:bg-[#252525] border border-white/10 text-white/80 hover:text-white rounded-xs text-xs font-medium transition-colors"
          >
            <span>Live Lookbook</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={loadAll}
            disabled={isLoading}
            className="p-2 bg-[#1C1C1C] hover:bg-[#252525] border border-white/10 text-white/70 hover:text-gold rounded-xs transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          {activeTab === 'looks' && (
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gold hover:bg-gold-light text-ink font-semibold rounded-xs text-xs tracking-wider uppercase transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Look</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs rounded-xs flex items-center space-x-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-3 bg-red-950/60 border border-red-500/30 text-red-300 text-xs rounded-xs flex items-center space-x-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Primary Tab Switcher */}
      <div className="flex border-b border-white/10 space-x-2 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('looks')}
          className={`pb-3 px-4 font-medium transition-colors flex items-center space-x-2 border-b-2 ${
            activeTab === 'looks'
              ? 'border-gold text-gold font-semibold'
              : 'border-transparent text-white/60 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Ensemble Looks ({looks.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`pb-3 px-4 font-medium transition-colors flex items-center space-x-2 border-b-2 ${
            activeTab === 'settings'
              ? 'border-gold text-gold font-semibold'
              : 'border-transparent text-white/60 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Editorial & Banner Settings</span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-widest text-gold font-medium">
            Loading Lookbook Atelier Data...
          </p>
        </div>
      )}

      {/* TAB 1: LOOKS LIST */}
      {!isLoading && activeTab === 'looks' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#141414] border border-white/10 p-4 rounded-xs">
              <span className="text-[10px] uppercase tracking-wider text-white/50 block">Total Curated Looks</span>
              <span className="text-2xl font-serif font-semibold text-white mt-1 block">{looks.length}</span>
            </div>
            <div className="bg-[#141414] border border-white/10 p-4 rounded-xs">
              <span className="text-[10px] uppercase tracking-wider text-white/50 block">Published on Storefront</span>
              <span className="text-2xl font-serif font-semibold text-emerald-400 mt-1 block">
                {looks.filter((l) => l.isActive).length}
              </span>
            </div>
            <div className="bg-[#141414] border border-white/10 p-4 rounded-xs">
              <span className="text-[10px] uppercase tracking-wider text-white/50 block">Hidden / Draft</span>
              <span className="text-2xl font-serif font-semibold text-white/40 mt-1 block">
                {looks.filter((l) => !l.isActive).length}
              </span>
            </div>
            <div className="bg-[#141414] border border-white/10 p-4 rounded-xs">
              <span className="text-[10px] uppercase tracking-wider text-white/50 block">Catalogue Products In Looks</span>
              <span className="text-2xl font-serif font-semibold text-gold mt-1 block">
                {new Set(looks.flatMap((l) => l.itemIds)).size}
              </span>
            </div>
          </div>

          {/* Looks Cards List */}
          {looks.length === 0 ? (
            <div className="bg-[#141414] border border-white/10 p-12 text-center rounded-xs space-y-4">
              <BookOpen className="w-12 h-12 text-gold/40 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-lg font-serif text-white">No Looks Found</h3>
                <p className="text-xs text-white/50 max-w-md mx-auto leading-relaxed">
                  Start curating your first still-life ensemble. Group luxury jewelry, bangles, and boutique bags into an editorial look.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gold hover:bg-gold-light text-ink font-semibold rounded-xs text-xs tracking-wider uppercase transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Look I</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {looks.map((look, index) => {
                const lookProducts = look.itemIds
                  .map((id) => productMap.get(id))
                  .filter((p): p is Product => Boolean(p));
                const ensemblePrice = lookProducts.reduce((sum, p) => sum + p.price, 0);

                return (
                  <div
                    key={look.id}
                    className={`bg-[#141414] border rounded-xs p-5 transition-all ${
                      look.isActive ? 'border-white/10 hover:border-gold/40' : 'border-white/5 opacity-70'
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                      {/* Image Thumbnail & Numeral */}
                      <div className="md:col-span-3 flex items-center space-x-4">
                        <div className="relative w-24 h-28 sm:w-28 sm:h-32 rounded-xs overflow-hidden bg-black/40 border border-white/15 shrink-0 group">
                          <Image
                            src={look.heroImage}
                            alt={look.title}
                            fill
                            sizes="120px"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {!look.isActive && (
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                              <span className="text-[9px] uppercase tracking-widest text-white/70 font-semibold px-2 py-0.5 border border-white/20 rounded-xs">
                                Draft
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-semibold tracking-[0.2em] text-gold uppercase">
                              {look.numeral}
                            </span>
                            <span
                              className={`text-[9px] uppercase px-1.5 py-0.2 rounded-xs font-semibold ${
                                look.isActive
                                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                              }`}
                            >
                              {look.isActive ? 'Active' : 'Hidden'}
                            </span>
                          </div>
                          <h3 className="font-serif text-base sm:text-lg text-white font-medium truncate">
                            {look.title}
                          </h3>
                          <p className="text-[11px] text-white/50 truncate">
                            {look.tagline || 'No tagline set'}
                          </p>
                        </div>
                      </div>

                      {/* Products Curated & Price */}
                      <div className="md:col-span-4 space-y-2 border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/60">Pieces Included:</span>
                          <span className="text-white font-medium">{lookProducts.length} items</span>
                        </div>

                        {/* Product Mini Thumbs */}
                        <div className="flex items-center space-x-2 overflow-x-auto py-1">
                          {lookProducts.slice(0, 4).map((prod) => (
                            <div
                              key={prod.id}
                              className="relative w-8 h-8 rounded-xs overflow-hidden border border-white/20 shrink-0 bg-black"
                              title={`${prod.name} (৳${formatPrice(prod.price)})`}
                            >
                              <Image
                                src={prod.featuredImage}
                                alt={prod.name}
                                fill
                                sizes="32px"
                                className="object-cover"
                              />
                            </div>
                          ))}
                          {lookProducts.length > 4 && (
                            <span className="text-[10px] text-white/50 shrink-0">
                              +{lookProducts.length - 4} more
                            </span>
                          )}
                          {lookProducts.length === 0 && (
                            <span className="text-[11px] text-amber-400/80 italic">
                              No products attached yet
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                          <span className="text-white/60">Ensemble Total:</span>
                          <span className="font-semibold text-gold tabular-nums">
                            ৳{formatPrice(ensemblePrice)}
                          </span>
                        </div>
                      </div>

                      {/* Color Palette */}
                      <div className="md:col-span-2 space-y-1.5 border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-5">
                        <span className="text-[10px] uppercase tracking-wider text-white/50 block">
                          Tones ({look.palette.length})
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {look.palette.map((p, pIdx) => (
                            <div
                              key={pIdx}
                              className="flex items-center space-x-1 bg-black/30 border border-white/10 px-1.5 py-0.5 rounded-xs"
                              title={`${p.name} (${p.hex})`}
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-black/40"
                                style={{ backgroundColor: p.hex }}
                              />
                              <span className="text-[9px] text-white/70 max-w-[60px] truncate">{p.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions & Reordering */}
                      <div className="md:col-span-3 flex items-center justify-end space-x-2 border-t md:border-t-0 border-white/10 pt-3 md:pt-0">
                        {/* Order controls */}
                        <div className="flex items-center space-x-1 mr-2 border-r border-white/10 pr-2">
                          <button
                            type="button"
                            onClick={() => handleMoveLook(index, 'up')}
                            disabled={index === 0}
                            className="p-1.5 text-white/60 hover:text-gold disabled:opacity-20 disabled:hover:text-white/60 transition-colors"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveLook(index, 'down')}
                            disabled={index === looks.length - 1}
                            className="p-1.5 text-white/60 hover:text-gold disabled:opacity-20 disabled:hover:text-white/60 transition-colors"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Visibility Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleActive(look)}
                          className={`p-1.5 rounded-xs transition-colors ${
                            look.isActive
                              ? 'text-white/70 hover:text-gold hover:bg-[#1C1C1C]'
                              : 'text-amber-400 hover:text-amber-300 hover:bg-[#1C1C1C]'
                          }`}
                          title={look.isActive ? 'Hide from storefront' : 'Publish to storefront'}
                        >
                          {look.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(look)}
                          className="px-3 py-1.5 bg-[#1C1C1C] hover:bg-[#252525] border border-white/15 text-white text-xs rounded-xs font-medium transition-colors flex items-center space-x-1.5"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-gold" />
                          <span>Edit</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(look.id)}
                          className="p-1.5 text-red-400/80 hover:text-red-400 hover:bg-red-950/40 rounded-xs transition-colors"
                          title="Delete Look"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EDITORIAL & HOMEPAGE BANNER SETTINGS */}
      {!isLoading && activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-8 max-w-4xl">
          {/* Section 1: Atelier Lookbook Page Header */}
          <div className="bg-[#141414] border border-white/10 rounded-xs p-6 space-y-5">
            <div className="border-b border-white/10 pb-4">
              <div className="flex items-center space-x-2 text-xs uppercase tracking-wider text-gold font-medium">
                <BookOpen className="w-4 h-4" />
                <span>Dedicated Lookbook Atelier Page (/lookbook)</span>
              </div>
              <h2 className="text-lg font-serif text-white font-medium mt-1">
                Header Hero & Editorial Intro
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/70 mb-1.5">
                  Top Pill Badge
                </label>
                <input
                  type="text"
                  value={settingsForm.pageBadge}
                  onChange={(e) => setSettingsForm({ ...settingsForm, pageBadge: e.target.value })}
                  placeholder="Curated Still Life Harmonies"
                  className="w-full bg-[#1C1C1C] border border-white/15 rounded-xs px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-white/70 mb-1.5">
                  Page Title (H1)
                </label>
                <input
                  type="text"
                  value={settingsForm.pageTitle}
                  onChange={(e) => setSettingsForm({ ...settingsForm, pageTitle: e.target.value })}
                  placeholder="The Atelier Lookbook"
                  className="w-full bg-[#1C1C1C] border border-white/15 rounded-xs px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs uppercase tracking-wider text-white/70 mb-1.5">
                  Curatorial Philosophy / Subtitle
                </label>
                <textarea
                  rows={3}
                  value={settingsForm.pageDescription}
                  onChange={(e) => setSettingsForm({ ...settingsForm, pageDescription: e.target.value })}
                  className="w-full bg-[#1C1C1C] border border-white/15 rounded-xs p-3 text-xs text-white focus:outline-none focus:border-gold leading-relaxed"
                  placeholder="Describe the still-life photography on warm limestone plinths..."
                />
              </div>
            </div>
          </div>

          {/* Section 2: Homepage Lookbook Section */}
          <div className="bg-[#141414] border border-white/10 rounded-xs p-6 space-y-5">
            <div className="border-b border-white/10 pb-4">
              <div className="flex items-center space-x-2 text-xs uppercase tracking-wider text-gold font-medium">
                <Layers className="w-4 h-4" />
                <span>Homepage Editorial Lookbook Section</span>
              </div>
              <h2 className="text-lg font-serif text-white font-medium mt-1">
                Editorial Banner & Featured Visuals
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/70 mb-1.5">
                  Badge Tag
                </label>
                <input
                  type="text"
                  value={settingsForm.homepageBadge}
                  onChange={(e) => setSettingsForm({ ...settingsForm, homepageBadge: e.target.value })}
                  placeholder="Editorial Lookbook 2026"
                  className="w-full bg-[#1C1C1C] border border-white/15 rounded-xs px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-white/70 mb-1.5">
                  Headline
                </label>
                <input
                  type="text"
                  value={settingsForm.homepageHeading}
                  onChange={(e) => setSettingsForm({ ...settingsForm, homepageHeading: e.target.value })}
                  placeholder="Designed to dialogue, not compete."
                  className="w-full bg-[#1C1C1C] border border-white/15 rounded-xs px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs uppercase tracking-wider text-white/70 mb-1.5">
                  Body Paragraph
                </label>
                <textarea
                  rows={3}
                  value={settingsForm.homepageDescription}
                  onChange={(e) => setSettingsForm({ ...settingsForm, homepageDescription: e.target.value })}
                  className="w-full bg-[#1C1C1C] border border-white/15 rounded-xs p-3 text-xs text-white focus:outline-none focus:border-gold leading-relaxed"
                />
              </div>

              {/* Visual 1 */}
              <div className="p-4 bg-[#181818] border border-white/10 rounded-xs space-y-3">
                <span className="text-[10px] uppercase tracking-wider text-gold font-semibold block">
                  Featured Still-Life Visual 1
                </span>
                <div>
                  <label className="block text-[11px] text-white/70 mb-1">Image Path / URL</label>
                  <input
                    type="text"
                    value={settingsForm.homepageImage1}
                    onChange={(e) => setSettingsForm({ ...settingsForm, homepageImage1: e.target.value })}
                    className="w-full bg-[#1C1C1C] border border-white/15 rounded-xs px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-white/70 mb-1">Corner Overlay Label</label>
                  <input
                    type="text"
                    value={settingsForm.homepageImage1Label}
                    onChange={(e) => setSettingsForm({ ...settingsForm, homepageImage1Label: e.target.value })}
                    placeholder="Zari Bridal Choker"
                    className="w-full bg-[#1C1C1C] border border-white/15 rounded-xs px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-gold"
                  />
                </div>
                {settingsForm.homepageImage1 && (
                  <div className="relative w-full h-24 rounded-xs overflow-hidden bg-black border border-white/10">
                    <Image
                      src={settingsForm.homepageImage1}
                      alt={settingsForm.homepageImage1Label}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Visual 2 */}
              <div className="p-4 bg-[#181818] border border-white/10 rounded-xs space-y-3">
                <span className="text-[10px] uppercase tracking-wider text-gold font-semibold block">
                  Featured Still-Life Visual 2
                </span>
                <div>
                  <label className="block text-[11px] text-white/70 mb-1">Image Path / URL</label>
                  <input
                    type="text"
                    value={settingsForm.homepageImage2}
                    onChange={(e) => setSettingsForm({ ...settingsForm, homepageImage2: e.target.value })}
                    className="w-full bg-[#1C1C1C] border border-white/15 rounded-xs px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-white/70 mb-1">Corner Overlay Label</label>
                  <input
                    type="text"
                    value={settingsForm.homepageImage2Label}
                    onChange={(e) => setSettingsForm({ ...settingsForm, homepageImage2Label: e.target.value })}
                    placeholder="Meher Bangle Stack"
                    className="w-full bg-[#1C1C1C] border border-white/15 rounded-xs px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-gold"
                  />
                </div>
                {settingsForm.homepageImage2 && (
                  <div className="relative w-full h-24 rounded-xs overflow-hidden bg-black border border-white/10">
                    <Image
                      src={settingsForm.homepageImage2}
                      alt={settingsForm.homepageImage2Label}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Settings */}
          <div className="flex justify-end space-x-3">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gold hover:bg-gold-light text-ink font-semibold rounded-xs text-xs tracking-wider uppercase transition-all shadow-md disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Settings...' : 'Save Editorial Settings'}</span>
            </button>
          </div>
        </form>
      )}

      {/* MODAL: CREATE / EDIT LOOK */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#141414] border border-gold/30 rounded-xs max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl text-white my-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#161616]">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-gold font-semibold">
                  {editingLookId ? 'Modify Look' : 'Curate New Ensemble'}
                </span>
                <h2 className="text-xl font-serif font-medium mt-0.5">
                  {editingLookId ? `Edit ${formNumeral}: ${formTitle || 'Ensemble'}` : 'New Lookbook Look'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveLook} className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              {/* Basic Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-3">
                  <label className="block text-white/70 uppercase tracking-wider mb-1">
                    Numeral
                  </label>
                  <input
                    type="text"
                    required
                    value={formNumeral}
                    onChange={(e) => setFormNumeral(e.target.value)}
                    placeholder="LOOK I"
                    className="w-full bg-[#1C1C1C] border border-white/15 rounded-xs px-3 py-2 text-white focus:outline-none focus:border-gold uppercase"
                  />
                </div>

                <div className="sm:col-span-9">
                  <label className="block text-white/70 uppercase tracking-wider mb-1">
                    Look Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. The Regal Zamindar Suite"
                    className="w-full bg-[#1C1C1C] border border-white/15 rounded-xs px-3 py-2 text-white focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="sm:col-span-12">
                  <label className="block text-white/70 uppercase tracking-wider mb-1">
                    Tagline / Theme
                  </label>
                  <input
                    type="text"
                    value={formTagline}
                    onChange={(e) => setFormTagline(e.target.value)}
                    placeholder="e.g. 22k Antique Filigree on Architectural Limestone Plinths"
                    className="w-full bg-[#1C1C1C] border border-white/15 rounded-xs px-3 py-2 text-white focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="sm:col-span-12">
                  <label className="block text-white/70 uppercase tracking-wider mb-1">
                    Editorial Description
                  </label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Describe the historical inspiration, textures, materials, and styling harmony..."
                    className="w-full bg-[#1C1C1C] border border-white/15 rounded-xs p-3 text-white focus:outline-none focus:border-gold leading-relaxed"
                  />
                </div>
              </div>

              {/* Still-Life Hero Image */}
              <div className="p-4 bg-[#181818] border border-white/10 rounded-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-gold font-medium">
                    <ImageIcon className="w-4 h-4" />
                    <span className="uppercase tracking-wider">Still-Life Hero Image</span>
                  </div>
                  <span className="text-[10px] text-white/40">Strictly still-life product photography</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-8 space-y-2">
                    <input
                      type="text"
                      required
                      value={formHeroImage}
                      onChange={(e) => setFormHeroImage(e.target.value)}
                      placeholder="/images/hero/hero-still-life.jpg"
                      className="w-full bg-[#1C1C1C] border border-white/15 rounded-xs px-3 py-2 text-white focus:outline-none focus:border-gold"
                    />

                    {/* Quick Presets */}
                    <div>
                      <span className="text-[10px] text-white/50 block mb-1">Quick Select Preset:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {STILL_LIFE_IMAGE_PRESETS.slice(0, 4).map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setFormHeroImage(preset.url)}
                            className={`text-[10px] px-2 py-0.5 rounded-xs transition-colors ${
                              formHeroImage === preset.url
                                ? 'bg-gold text-ink font-semibold'
                                : 'bg-[#222] text-white/70 hover:text-white'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-4 flex justify-center">
                    <div className="relative w-28 h-28 rounded-xs overflow-hidden bg-black border border-white/20">
                      {formHeroImage && (
                        <Image
                          src={formHeroImage}
                          alt="Hero preview"
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Color Palette Builder */}
              <div className="p-4 bg-[#181818] border border-white/10 rounded-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-gold font-medium">
                    <Palette className="w-4 h-4" />
                    <span className="uppercase tracking-wider">Harmonious Color Palette ({formPalette.length})</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddPaletteItem}
                    className="text-[11px] text-gold hover:text-gold-light font-medium inline-flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Color Swatch</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {formPalette.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-2 bg-[#1C1C1C] border border-white/10 p-2 rounded-xs"
                    >
                      <input
                        type="color"
                        value={item.hex}
                        onChange={(e) => handleUpdatePaletteItem(idx, 'hex', e.target.value)}
                        className="w-7 h-7 rounded-xs border-0 bg-transparent cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={item.hex}
                        onChange={(e) => handleUpdatePaletteItem(idx, 'hex', e.target.value)}
                        placeholder="#C6A96E"
                        className="w-20 bg-black/40 border border-white/10 rounded-xs px-2 py-1 text-white text-[11px] font-mono"
                      />
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdatePaletteItem(idx, 'name', e.target.value)}
                        placeholder="Antique Gold"
                        className="flex-1 bg-black/40 border border-white/10 rounded-xs px-2 py-1 text-white text-[11px]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePaletteItem(idx)}
                        className="p-1 text-red-400 hover:text-red-300"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {formPalette.length === 0 && (
                    <div className="sm:col-span-2 text-center text-white/40 italic py-2">
                      No color swatches yet. Click &quot;Add Color Swatch&quot; above.
                    </div>
                  )}
                </div>
              </div>

              {/* Product Ensemble Selection */}
              <div className="p-4 bg-[#181818] border border-white/10 rounded-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5 text-gold font-medium">
                    <ShoppingBag className="w-4 h-4" />
                    <span className="uppercase tracking-wider">
                      Included Ensemble Pieces ({formItemIds.length} Selected)
                    </span>
                  </div>
                  <div className="text-[11px] text-white/70">
                    Calculated Total: <span className="text-gold font-semibold tabular-nums">৳{formatPrice(formEnsembleTotal)}</span>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search catalogue products by name or category..."
                    className="w-full bg-[#1C1C1C] border border-white/15 rounded-xs pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-gold"
                  />
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {filteredProducts.map((p) => {
                    const isSelected = formItemIds.includes(p.id) || formItemIds.includes(p.slug);
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleToggleProduct(p.id)}
                        className={`p-2 rounded-xs border cursor-pointer transition-all flex items-center justify-between space-x-3 ${
                          isSelected
                            ? 'bg-gold/15 border-gold text-white'
                            : 'bg-[#1C1C1C] border-white/10 hover:border-white/25 text-white/80'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <div className="relative w-9 h-9 rounded-xs overflow-hidden bg-black shrink-0 border border-white/15">
                            <Image
                              src={p.featuredImage}
                              alt={p.name}
                              fill
                              sizes="36px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-xs truncate">{p.name}</div>
                            <div className="text-[10px] text-white/50 truncate">
                              {p.categoryLabel} · ৳{formatPrice(p.price)}
                            </div>
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-xs border flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-gold border-gold text-ink' : 'border-white/20'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                  {filteredProducts.length === 0 && (
                    <div className="sm:col-span-2 text-center text-white/40 italic py-4">
                      No products match your search.
                    </div>
                  )}
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFormIsActive(!formIsActive)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${
                    formIsActive ? 'bg-emerald-600' : 'bg-zinc-700'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      formIsActive ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-xs text-white/80">
                  {formIsActive
                    ? 'Published on Storefront'
                    : 'Save as Draft / Hidden from public'}
                </span>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-white/15 text-white/70 hover:text-white rounded-xs text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center space-x-2 px-6 py-2 bg-gold hover:bg-gold-light text-ink font-semibold rounded-xs text-xs tracking-wider uppercase transition-all shadow-md disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : editingLookId ? 'Update Look' : 'Create Look'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-red-500/30 rounded-xs max-w-sm w-full p-6 text-white space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-red-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-serif font-medium">Delete Look?</h3>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Are you sure you want to permanently remove this look from the Atelier Lookbook? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 text-xs text-white/70 hover:text-white border border-white/15 rounded-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteLook(deleteConfirmId)}
                disabled={isSaving}
                className="px-4 py-1.5 text-xs bg-red-600 hover:bg-red-500 text-white font-medium rounded-xs transition-colors"
              >
                {isSaving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
