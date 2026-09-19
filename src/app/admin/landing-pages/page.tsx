'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  useLandingPages,
  LandingPage,
  LandingPageCreateInput,
} from '@/context/LandingPagesContext';
import { PRODUCTS } from '@/data/catalogue';
import {
  Plus,
  Copy,
  Check,
  Trash2,
  Power,
  ExternalLink,
  Edit2,
  FileText,
  Search,
  X,
  Link2,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  GripVertical,
} from 'lucide-react';

/* ─── Slug helper ────────────────────────── */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60);
}

export default function AdminLandingPagesPage() {
  const {
    pages,
    createPage,
    updatePage,
    deletePage,
    togglePageStatus,
    isSlugAvailable,
  } = useLandingPages();

  /* ─── Local UI state ─────────────────── */
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState<LandingPage | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  /* ─── Form state ─────────────────────── */
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [headline, setHeadline] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState('');

  /* ─── Filtered pages ─────────────────── */
  const filteredPages = useMemo(() => {
    if (!searchQuery.trim()) return pages;
    const q = searchQuery.toLowerCase();
    return pages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.headline.toLowerCase().includes(q)
    );
  }, [pages, searchQuery]);

  /* ─── Filtered products for picker ───── */
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return PRODUCTS;
    const q = productSearch.toLowerCase();
    return PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q)
    );
  }, [productSearch]);

  /* ─── Helpers ────────────────────────── */
  const resetForm = () => {
    setTitle('');
    setSlug('');
    setSlugManuallyEdited(false);
    setHeadline('');
    setSubtitle('');
    setSelectedProductIds([]);
    setIsActive(true);
    setFormError(null);
    setProductSearch('');
    setEditingPage(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (page: LandingPage) => {
    setEditingPage(page);
    setTitle(page.title);
    setSlug(page.slug);
    setSlugManuallyEdited(true);
    setHeadline(page.headline);
    setSubtitle(page.subtitle || '');
    setSelectedProductIds([...page.productIds]);
    setIsActive(page.isActive);
    setFormError(null);
    setProductSearch('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleCopyUrl = (pageSlug: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    navigator.clipboard.writeText(`${baseUrl}/promo/${pageSlug}`);
    setCopiedSlug(pageSlug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugManuallyEdited) {
      setSlug(slugify(value));
    }
  };

  const toggleProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  /* ─── Form submission ────────────────── */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!title.trim()) {
      setFormError('Page title is required.');
      return;
    }
    if (!cleanSlug) {
      setFormError('URL slug is required.');
      return;
    }
    if (!headline.trim()) {
      setFormError('Page headline is required.');
      return;
    }
    if (selectedProductIds.length === 0) {
      setFormError('Select at least one product.');
      return;
    }
    if (!isSlugAvailable(cleanSlug, editingPage?.id)) {
      setFormError(`Slug "${cleanSlug}" is already in use.`);
      return;
    }

    if (editingPage) {
      updatePage(editingPage.id, {
        title: title.trim(),
        slug: cleanSlug,
        headline: headline.trim(),
        subtitle: subtitle.trim() || undefined,
        productIds: selectedProductIds,
        isActive,
      });
      showSuccess(`"${title.trim()}" updated successfully.`);
    } else {
      const input: LandingPageCreateInput = {
        title: title.trim(),
        slug: cleanSlug,
        headline: headline.trim(),
        subtitle: subtitle.trim() || undefined,
        productIds: selectedProductIds,
        isActive,
      };
      createPage(input);
      showSuccess(`"${title.trim()}" created! URL: /promo/${cleanSlug}`);
    }

    closeModal();
  };

  const handleDelete = (id: string) => {
    const page = pages.find((p) => p.id === id);
    deletePage(id);
    setDeleteConfirmId(null);
    showSuccess(`"${page?.title}" deleted.`);
  };

  /* ─── Stats ──────────────────────────── */
  const activeCount = pages.filter((p) => p.isActive).length;
  const totalProducts = new Set(pages.flatMap((p) => p.productIds)).size;

  return (
    <div className="space-y-6">
      {/* Success toast */}
      {successMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center space-x-2 px-4 py-3 bg-emerald-950/90 border border-emerald-600/40 text-emerald-300 rounded-sm shadow-xl backdrop-blur-sm text-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-gold tracking-wide flex items-center space-x-2">
            <FileText className="w-6 h-6" />
            <span>Landing Pages</span>
          </h1>
          <p className="text-xs text-paper/50 mt-1 tracking-wide">
            Create unlisted promo pages for Facebook ads &amp; external campaigns
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gold text-ink font-semibold rounded-xs hover:bg-gold-light transition-colors shadow-sm text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create Landing Page</span>
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#141414] border border-white/10 rounded-sm px-4 py-3">
          <div className="text-2xl font-serif font-bold text-gold">{pages.length}</div>
          <div className="text-[10px] uppercase tracking-widest text-paper/50 mt-0.5">Total Pages</div>
        </div>
        <div className="bg-[#141414] border border-white/10 rounded-sm px-4 py-3">
          <div className="text-2xl font-serif font-bold text-emerald-400">{activeCount}</div>
          <div className="text-[10px] uppercase tracking-widest text-paper/50 mt-0.5">Active</div>
        </div>
        <div className="bg-[#141414] border border-white/10 rounded-sm px-4 py-3">
          <div className="text-2xl font-serif font-bold text-blue-400">{totalProducts}</div>
          <div className="text-[10px] uppercase tracking-widest text-paper/50 mt-0.5">Products Featured</div>
        </div>
      </div>

      {/* Search */}
      {pages.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-paper/40" />
          <input
            type="text"
            placeholder="Search pages by title, slug, or headline..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#141414] border border-white/10 rounded-sm text-sm text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold/40 transition-colors"
          />
        </div>
      )}

      {/* Pages List */}
      {filteredPages.length === 0 ? (
        <div className="text-center py-16 bg-[#141414] border border-white/10 rounded-sm">
          <FileText className="w-12 h-12 text-paper/20 mx-auto mb-4" />
          <h3 className="text-lg font-serif text-paper/60 mb-1">
            {pages.length === 0 ? 'No landing pages yet' : 'No results found'}
          </h3>
          <p className="text-xs text-paper/40 mb-6">
            {pages.length === 0
              ? 'Create your first promo page for Facebook ad campaigns.'
              : 'Try a different search term.'}
          </p>
          {pages.length === 0 && (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gold/15 text-gold border border-gold/30 rounded-xs hover:bg-gold/25 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Page</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPages.map((page) => {
            const pageProducts = PRODUCTS.filter((p) =>
              page.productIds.includes(p.id)
            );
            return (
              <div
                key={page.id}
                className={`bg-[#141414] border rounded-sm overflow-hidden transition-colors ${
                  page.isActive
                    ? 'border-white/10 hover:border-gold/30'
                    : 'border-white/5 opacity-60 hover:opacity-80'
                }`}
              >
                <div className="p-4 sm:p-5">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-serif text-lg text-paper font-semibold truncate">
                          {page.title}
                        </h3>
                        <span
                          className={`shrink-0 text-[9px] uppercase px-1.5 py-0.5 rounded-xs font-bold border ${
                            page.isActive
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/30'
                              : 'bg-red-950/40 text-red-400 border-red-600/30'
                          }`}
                        >
                          {page.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-paper/40">
                        <Link2 className="w-3 h-3" />
                        <span className="font-mono">/promo/{page.slug}</span>
                        <span className="text-paper/20">·</span>
                        <span>{pageProducts.length} product{pageProducts.length !== 1 ? 's' : ''}</span>
                        <span className="text-paper/20">·</span>
                        <span>
                          {new Date(page.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(page.slug)}
                        className="p-2 bg-[#1C1C1C] hover:bg-[#252525] border border-white/10 rounded-xs text-paper/60 hover:text-gold transition-colors"
                        title="Copy URL"
                      >
                        {copiedSlug === page.slug ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <a
                        href={`/promo/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-[#1C1C1C] hover:bg-[#252525] border border-white/10 rounded-xs text-paper/60 hover:text-gold transition-colors"
                        title="Preview page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => openEditModal(page)}
                        className="p-2 bg-[#1C1C1C] hover:bg-[#252525] border border-white/10 rounded-xs text-paper/60 hover:text-gold transition-colors"
                        title="Edit page"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => togglePageStatus(page.id)}
                        className={`p-2 border rounded-xs transition-colors ${
                          page.isActive
                            ? 'bg-[#1C1C1C] hover:bg-red-950/40 border-white/10 hover:border-red-600/30 text-paper/60 hover:text-red-400'
                            : 'bg-[#1C1C1C] hover:bg-emerald-950/40 border-white/10 hover:border-emerald-600/30 text-paper/60 hover:text-emerald-400'
                        }`}
                        title={page.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {page.isActive ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                      {deleteConfirmId === page.id ? (
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => handleDelete(page.id)}
                            className="px-2 py-1.5 bg-red-950/60 border border-red-600/40 rounded-xs text-red-300 text-[10px] font-bold uppercase hover:bg-red-900/60 transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="p-1.5 text-paper/40 hover:text-paper/70"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(page.id)}
                          className="p-2 bg-[#1C1C1C] hover:bg-red-950/40 border border-white/10 hover:border-red-600/30 rounded-xs text-paper/60 hover:text-red-400 transition-colors"
                          title="Delete page"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Headline preview */}
                  <div className="mt-3 px-3 py-2 bg-[#0E0E0E] border border-white/5 rounded-xs">
                    <p className="text-sm text-paper/70 font-serif italic">&ldquo;{page.headline}&rdquo;</p>
                    {page.subtitle && (
                      <p className="text-[11px] text-paper/40 mt-0.5">{page.subtitle}</p>
                    )}
                  </div>

                  {/* Product thumbnails */}
                  {pageProducts.length > 0 && (
                    <div className="mt-3 flex items-center space-x-2 overflow-x-auto scrollbar-none">
                      {pageProducts.slice(0, 6).map((product) => (
                        <div
                          key={product.id}
                          className="shrink-0 w-10 h-10 rounded-xs overflow-hidden border border-white/10 bg-[#0E0E0E]"
                          title={product.name}
                        >
                          <Image
                            src={product.featuredImage}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {pageProducts.length > 6 && (
                        <div className="shrink-0 w-10 h-10 rounded-xs border border-white/10 bg-[#1C1C1C] flex items-center justify-center text-[10px] text-paper/50 font-bold">
                          +{pageProducts.length - 6}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Create / Edit Modal ─────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#141414] border border-gold/20 rounded-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#141414] border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-lg font-serif font-semibold text-gold">
                  {editingPage ? 'Edit Landing Page' : 'Create Landing Page'}
                </h2>
                <p className="text-[11px] text-paper/40 mt-0.5">
                  {editingPage
                    ? 'Update page settings and products'
                    : 'Build an unlisted promo page for external campaigns'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-2 text-paper/50 hover:text-paper hover:bg-[#222] rounded-xs transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {formError && (
                <div className="flex items-center space-x-2 px-3 py-2.5 bg-red-950/40 border border-red-600/30 rounded-xs text-red-300 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-paper/70 uppercase tracking-wider mb-1.5">
                  Page Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Summer Sale — Jewelry Sets"
                  className="w-full px-3 py-2.5 bg-[#0E0E0E] border border-white/10 rounded-xs text-sm text-paper placeholder:text-paper/25 focus:outline-none focus:border-gold/40 transition-colors"
                />
                <p className="text-[10px] text-paper/30 mt-1">Internal name. Not shown to visitors.</p>
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-semibold text-paper/70 uppercase tracking-wider mb-1.5">
                  URL Slug <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2.5 bg-[#0A0A0A] border border-white/10 border-r-0 rounded-l-xs text-xs text-paper/40 font-mono shrink-0">
                    /promo/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlugManuallyEdited(true);
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                    }}
                    placeholder="summer-sale-jewelry"
                    className="flex-1 px-3 py-2.5 bg-[#0E0E0E] border border-white/10 rounded-r-xs text-sm text-paper font-mono placeholder:text-paper/25 focus:outline-none focus:border-gold/40 transition-colors"
                  />
                </div>
                {slug && !isSlugAvailable(slug, editingPage?.id) && (
                  <p className="text-[10px] text-red-400 mt-1">This slug is already taken.</p>
                )}
              </div>

              {/* Headline */}
              <div>
                <label className="block text-xs font-semibold text-paper/70 uppercase tracking-wider mb-1.5">
                  Page Headline <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Exclusive Summer Collection"
                  className="w-full px-3 py-2.5 bg-[#0E0E0E] border border-white/10 rounded-xs text-sm text-paper placeholder:text-paper/25 focus:outline-none focus:border-gold/40 transition-colors"
                />
                <p className="text-[10px] text-paper/30 mt-1">Main heading shown to visitors at the top of the page.</p>
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-semibold text-paper/70 uppercase tracking-wider mb-1.5">
                  Subtitle <span className="text-paper/30">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Up to 30% off on selected pieces"
                  className="w-full px-3 py-2.5 bg-[#0E0E0E] border border-white/10 rounded-xs text-sm text-paper placeholder:text-paper/25 focus:outline-none focus:border-gold/40 transition-colors"
                />
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between px-3 py-2.5 bg-[#0E0E0E] border border-white/10 rounded-xs">
                <div>
                  <span className="text-xs font-semibold text-paper/70 uppercase tracking-wider">Page Status</span>
                  <p className="text-[10px] text-paper/30 mt-0.5">
                    {isActive ? 'Page is live and accessible via URL' : 'Page returns 404 when visited'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    isActive ? 'bg-emerald-600' : 'bg-[#333]'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                      isActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Product Picker */}
              <div>
                <label className="block text-xs font-semibold text-paper/70 uppercase tracking-wider mb-1.5">
                  Select Products <span className="text-red-400">*</span>
                  <span className="text-paper/30 normal-case font-normal ml-2">
                    ({selectedProductIds.length} selected)
                  </span>
                </label>

                {/* Product search */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-paper/30" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-9 pr-4 py-2 bg-[#0E0E0E] border border-white/10 rounded-xs text-xs text-paper placeholder:text-paper/25 focus:outline-none focus:border-gold/40 transition-colors"
                  />
                </div>

                {/* Product grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                  {filteredProducts.map((product) => {
                    const isSelected = selectedProductIds.includes(product.id);
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => toggleProduct(product.id)}
                        className={`flex items-center space-x-3 p-2.5 rounded-xs border transition-all text-left ${
                          isSelected
                            ? 'bg-gold/10 border-gold/40 ring-1 ring-gold/20'
                            : 'bg-[#0E0E0E] border-white/8 hover:border-white/20'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xs overflow-hidden shrink-0 bg-[#1A1A1A]">
                          <Image
                            src={product.featuredImage}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium truncate ${isSelected ? 'text-gold' : 'text-paper/80'}`}>
                            {product.name}
                          </p>
                          <p className="text-[10px] text-paper/40">
                            {product.categoryLabel} · ৳{product.price.toLocaleString()}
                          </p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-xs border-2 flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-gold border-gold text-ink'
                              : 'border-white/20 bg-transparent'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected chips */}
                {selectedProductIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {selectedProductIds.map((id) => {
                      const product = PRODUCTS.find((p) => p.id === id);
                      if (!product) return null;
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center space-x-1 px-2 py-1 bg-gold/10 border border-gold/25 rounded-xs text-[10px] text-gold font-medium"
                        >
                          <span className="truncate max-w-[120px]">{product.name}</span>
                          <button
                            type="button"
                            onClick={() => toggleProduct(id)}
                            className="hover:text-red-400 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm text-paper/60 hover:text-paper border border-white/10 hover:border-white/20 rounded-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center space-x-2 px-5 py-2 bg-gold text-ink font-semibold rounded-xs hover:bg-gold-light transition-colors shadow-sm text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{editingPage ? 'Save Changes' : 'Create Page'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
