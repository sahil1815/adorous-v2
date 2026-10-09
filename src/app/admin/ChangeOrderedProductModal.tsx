'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Product, Colorway } from '@/types';
import { AdminOrder, AdminOrderItem, useOrders } from '@/context/OrdersContext';
import { formatPrice } from '@/lib/formatPrice';
import { getDistrictDeliveryFee } from '@/data/districts';
import {
  Search,
  X,
  Check,
  Loader2,
  ArrowRight,
  Package,
  Truck,
  AlertCircle,
  RefreshCw,
  Tag,
  Plus,
  Minus,
} from 'lucide-react';

interface ChangeOrderedProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: AdminOrder;
  targetItem: AdminOrderItem;
  targetIndex: number;
  availableProducts: Product[];
  onSuccess?: () => void;
}

export default function ChangeOrderedProductModal({
  isOpen,
  onClose,
  order,
  targetItem,
  targetIndex,
  availableProducts,
  onSuccess,
}: ChangeOrderedProductModalProps) {
  const { updateOrderItemProduct } = useOrders();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Selected replacement product state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<Colorway | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [customTotalInput, setCustomTotalInput] = useState<string>('');

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize or reset when modal opens or target item changes
  useEffect(() => {
    if (!isOpen) return;

    setErrorMsg(null);
    setSearchQuery('');
    setSelectedCategory('all');
    setQuantity(targetItem.quantity || 1);
    setShippingFee(order.shippingFee ?? 0);
    setCustomTotalInput('');

    // Try finding current product in available products list
    const currentProd = availableProducts.find(
      (p) =>
        p.id === targetItem.product.id ||
        p.name.toLowerCase().trim() === targetItem.product.name.toLowerCase().trim()
    );

    if (currentProd) {
      setSelectedProduct(currentProd);
      setUnitPrice(currentProd.price || targetItem.product.price);

      // Match colorway
      const matchedColor = currentProd.colorways?.find(
        (c) => c.name.toLowerCase() === targetItem.selectedColor.name.toLowerCase()
      );
      setSelectedColor(matchedColor || currentProd.colorways?.[0] || {
        id: 'default',
        name: targetItem.selectedColor.name,
        hex: targetItem.selectedColor.hex,
        inStock: true,
      });

      setSelectedSize(targetItem.selectedSize || currentProd.sizes?.[0] || '');
    } else {
      // Fallback pseudo-product from targetItem
      setSelectedProduct({
        id: targetItem.product.id,
        slug: targetItem.product.slug || '',
        name: targetItem.product.name,
        category: (targetItem.product.category as any) || 'jewelry',
        categoryLabel: 'Current Ordered Item',
        tagline: '',
        price: targetItem.product.price,
        description: '',
        details: [],
        colorways: [
          {
            id: 'c-1',
            name: targetItem.selectedColor.name,
            hex: targetItem.selectedColor.hex,
            inStock: true,
          },
        ],
        featuredImage: targetItem.product.featuredImage,
        galleryImages: [targetItem.product.featuredImage],
        featuredRank: 1,
        seoKeywords: [],
      });
      setUnitPrice(targetItem.product.price);
      setSelectedColor({
        id: 'c-1',
        name: targetItem.selectedColor.name,
        hex: targetItem.selectedColor.hex,
        inStock: true,
      });
      setSelectedSize(targetItem.selectedSize || '');
    }
  }, [isOpen, targetItem, order, availableProducts]);

  // Categories list extracted from available products
  const categories = useMemo(() => {
    const set = new Set<string>();
    availableProducts.forEach((p) => {
      if (p.categoryLabel) set.add(p.categoryLabel);
      else if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [availableProducts]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return availableProducts.filter((p) => {
      if (selectedCategory !== 'all') {
        const cat = p.categoryLabel || p.category;
        if (cat !== selectedCategory) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q);
        const matchCat = (p.categoryLabel || p.category || '').toLowerCase().includes(q);
        const matchTag = (p.tagline || '').toLowerCase().includes(q);
        if (!matchName && !matchCat && !matchTag) return false;
      }
      return true;
    });
  }, [availableProducts, selectedCategory, searchQuery]);

  // Switch chosen product
  const handleSelectProduct = (p: Product) => {
    setSelectedProduct(p);
    setUnitPrice(p.price);
    // Pick first colorway or maintain current if matching name
    const matchCol = p.colorways?.find(
      (c) => c.name.toLowerCase() === selectedColor?.name.toLowerCase()
    );
    setSelectedColor(matchCol || p.colorways?.[0] || {
      id: 'default',
      name: 'Standard',
      hex: '#d4af37',
      inStock: true,
    });
    setSelectedSize(p.sizes?.[0] || '');
  };

  // Quantity helpers
  const handleStepQty = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  // Pricing calculations
  const districtFee = useMemo(() => {
    return getDistrictDeliveryFee(order.customer.district || '');
  }, [order.customer.district]);

  const targetItemId = targetItem.id || `item-${targetIndex}`;

  const otherItemsTotal = useMemo(() => {
    return order.items.reduce((sum, item, idx) => {
      const isTarget = item.id === targetItem.id || (!item.id && idx === targetIndex);
      if (isTarget) return sum;
      return sum + item.product.price * item.quantity;
    }, 0);
  }, [order.items, targetItem.id, targetIndex]);

  const newItemTotal = (unitPrice || 0) * quantity;
  const newSubtotal = otherItemsTotal + newItemTotal;

  // Proportional discount
  const voucherDiscount = useMemo(() => {
    if (order.subtotal > 0 && typeof order.discountAmount === 'number' && order.discountAmount > 0) {
      const ratio = order.discountAmount / order.subtotal;
      return Math.round(newSubtotal * ratio * 100) / 100;
    }
    return 0;
  }, [order.subtotal, order.discountAmount, newSubtotal]);

  const autoGrandTotal = Math.max(
    0,
    Math.round((newSubtotal - voucherDiscount + shippingFee) * 100) / 100
  );

  const finalGrandTotal = customTotalInput !== '' && !isNaN(Number(customTotalInput))
    ? Math.max(0, Number(customTotalInput))
    : autoGrandTotal;

  const oldItemTotal = targetItem.product.price * targetItem.quantity;
  const itemDiff = newItemTotal - oldItemTotal;

  // Save handler
  const handleConfirmSwap = async () => {
    if (!selectedProduct) {
      setErrorMsg('Please select a replacement product.');
      return;
    }
    if (!selectedColor) {
      setErrorMsg('Please choose a colorway.');
      return;
    }
    if (quantity < 1) {
      setErrorMsg('Quantity must be at least 1.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const res = await updateOrderItemProduct({
        orderId: order.orderId,
        itemId: targetItemId,
        newProduct: {
          id: selectedProduct.id,
          name: selectedProduct.name,
          category: selectedProduct.category,
          slug: selectedProduct.slug,
          price: unitPrice,
          featuredImage: selectedProduct.featuredImage,
        },
        newColor: {
          name: selectedColor.name,
          hex: selectedColor.hex,
        },
        newSize: selectedSize || undefined,
        newQuantity: quantity,
        customUnitPrice: unitPrice,
        customShippingFee: shippingFee,
        customGrandTotal: finalGrandTotal,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Failed to update order product.');
        setIsSaving(false);
        return;
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error in handleConfirmSwap:', err);
      setErrorMsg(err?.message || 'Unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#141414] border border-gold/30 rounded-xs max-w-4xl w-full p-4 sm:p-6 space-y-5 shadow-2xl relative my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3.5 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xs bg-gold/10 border border-gold/30 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-gold" />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg text-paper font-normal flex items-center gap-2">
                <span>Change Ordered Product</span>
                <span className="text-xs font-mono text-gold-light bg-gold/10 px-2 py-0.5 rounded-xs border border-gold/20">
                  {order.orderId}
                </span>
              </h3>
              <p className="text-[11px] text-paper/50">
                Patron: <span className="text-paper/80 font-medium">{order.customer.fullName}</span> ({order.customer.phone})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-paper/40 hover:text-paper p-1 rounded-xs transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/60 border border-red-700/40 rounded-xs flex items-center space-x-2 text-xs text-red-300 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Scrollable Modal Content */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Currently Ordered Item Banner */}
          <div className="bg-[#1B1B1B] border border-white/10 p-3 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="relative w-12 h-14 bg-stone rounded-xs overflow-hidden shrink-0 border border-white/10">
                {targetItem.product.featuredImage ? (
                  <Image
                    src={targetItem.product.featuredImage}
                    alt={targetItem.product.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <Package className="w-5 h-5 text-paper/40 m-auto mt-4" />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-semibold text-paper/40 tracking-wider block">
                  Current Ordered Item:
                </span>
                <p className="text-xs font-medium text-paper line-clamp-1">
                  {targetItem.product.name}
                </p>
                <div className="text-[11px] text-paper/60 flex items-center gap-1.5 flex-wrap mt-0.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/40"
                    style={{ backgroundColor: targetItem.selectedColor.hex }}
                  />
                  <span>{targetItem.selectedColor.name}</span>
                  {targetItem.selectedSize && <span>· Size {targetItem.selectedSize}</span>}
                  <span>· Qty: {targetItem.quantity}</span>
                  <span className="text-gold font-medium">· ৳{formatPrice(targetItem.product.price)} each</span>
                </div>
              </div>
            </div>
            <div className="text-right sm:border-l sm:border-white/10 sm:pl-4 shrink-0">
              <span className="text-[10px] text-paper/40 uppercase block">Current Item Total</span>
              <span className="text-sm font-semibold text-paper/90 tabular-nums">
                ৳{formatPrice(oldItemTotal)}
              </span>
            </div>
          </div>

          {/* Replacement Product Selection Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] uppercase tracking-wider text-paper/70 font-semibold block">
                1. Select New Replacement Product:
              </label>
              <span className="text-[11px] text-paper/40">
                {filteredProducts.length} items available in catalogue
              </span>
            </div>

            {/* Search & Category Pills */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-paper/40 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search catalogue by product name, category, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1C1C1C] border border-white/15 focus:border-gold pl-9 pr-3 py-1.5 text-xs text-paper rounded-xs focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2 text-paper/40 hover:text-paper text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Category pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-thin">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-2.5 py-0.5 rounded-xs shrink-0 transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-gold text-ink font-semibold'
                      : 'bg-[#1C1C1C] text-paper/60 hover:text-paper border border-white/5'
                  }`}
                >
                  All Pieces
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-0.5 rounded-xs shrink-0 transition-colors ${
                      selectedCategory === cat
                        ? 'bg-gold text-ink font-semibold'
                        : 'bg-[#1C1C1C] text-paper/60 hover:text-paper border border-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Products grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-1 bg-black/40 border border-white/10 rounded-xs">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full py-8 text-center text-xs text-paper/40">
                  No products found matching &ldquo;{searchQuery}&rdquo;.
                </div>
              ) : (
                filteredProducts.map((p) => {
                  const isChosen = selectedProduct?.id === p.id;

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectProduct(p)}
                      className={`text-left p-2 rounded-xs border transition-all flex items-center space-x-2.5 relative group ${
                        isChosen
                          ? 'bg-gold/15 border-gold shadow-xs'
                          : 'bg-[#181818] border-white/5 hover:border-gold/40 hover:bg-[#202020]'
                      }`}
                    >
                      <div className="relative w-10 h-12 bg-stone rounded-xs overflow-hidden shrink-0 border border-white/10">
                        {p.featuredImage ? (
                          <Image
                            src={p.featuredImage}
                            alt={p.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <Package className="w-4 h-4 text-paper/40 m-auto mt-3" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-xs text-paper line-clamp-1 block group-hover:text-gold-light">
                          {p.name}
                        </span>
                        <div className="flex items-center justify-between text-[10px] mt-0.5">
                          <span className="text-paper/40 truncate max-w-[90px]">
                            {p.categoryLabel || p.category}
                          </span>
                          <span className="font-semibold text-gold tabular-nums">
                            ৳{formatPrice(p.price)}
                          </span>
                        </div>
                      </div>
                      {isChosen && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-gold text-ink flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Colorway & Variant Selection */}
          {selectedProduct && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#181818] p-3.5 rounded-xs border border-white/10">
              {/* Colorways */}
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-wider text-paper/70 font-semibold block">
                  2. Select Colorway:
                </label>
                <div className="flex flex-wrap gap-2">
                  {(selectedProduct.colorways || []).map((cw) => {
                    const isSelected = selectedColor?.name === cw.name;

                    return (
                      <button
                        key={cw.id || cw.name}
                        type="button"
                        onClick={() => setSelectedColor(cw)}
                        className={`px-2.5 py-1.5 rounded-xs border text-xs flex items-center space-x-2 transition-all ${
                          isSelected
                            ? 'bg-gold/20 border-gold text-paper font-semibold'
                            : 'bg-[#222222] border-white/10 text-paper/70 hover:text-paper hover:border-white/30'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-black/40 shrink-0"
                          style={{ backgroundColor: cw.hex }}
                        />
                        <span>{cw.name}</span>
                        {isSelected && <Check className="w-3 h-3 text-gold ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sizes (if available) & Quantity / Unit Price */}
              <div className="space-y-3">
                {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-paper/70 font-semibold block">
                      Size Variant:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProduct.sizes.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSelectedSize(s)}
                          className={`px-2.5 py-1 text-xs rounded-xs border transition-colors ${
                            selectedSize === s
                              ? 'bg-gold text-ink font-bold border-gold'
                              : 'bg-[#222] border-white/10 text-paper/70 hover:text-paper'
                          }`}
                        >
                          Size {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-1">
                  {/* Quantity Stepper */}
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-paper/70 font-semibold block mb-1">
                      Quantity:
                    </label>
                    <div className="flex items-center border border-white/20 rounded-xs bg-[#222] h-8 w-full max-w-[130px]">
                      <button
                        type="button"
                        onClick={() => handleStepQty(-1)}
                        disabled={quantity <= 1}
                        className="px-2.5 h-full text-paper hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full text-center bg-transparent text-paper font-bold text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleStepQty(1)}
                        className="px-2.5 h-full text-paper hover:bg-white/10 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Unit Price Customizer */}
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-paper/70 font-semibold block mb-1">
                      Unit Price (৳):
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full h-8 px-2.5 bg-[#222] border border-white/20 rounded-xs text-xs font-semibold text-gold-light focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delivery & Financials Breakdown */}
          <div className="bg-[#181818] p-3.5 rounded-xs border border-white/10 space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[11px] uppercase tracking-wider text-paper/70 font-semibold flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-paper/40" />
                <span>Delivery Charge ({order.customer.district || 'Standard'}):</span>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShippingFee(0)}
                  className={`px-2 py-0.5 text-[10px] rounded-xs font-medium transition-colors ${
                    shippingFee === 0
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      : 'bg-white/5 text-paper/50 hover:text-paper'
                  }`}
                >
                  Free (৳0)
                </button>
                <button
                  type="button"
                  onClick={() => setShippingFee(80)}
                  className={`px-2 py-0.5 text-[10px] rounded-xs font-medium transition-colors ${
                    shippingFee === 80
                      ? 'bg-gold/20 text-gold border border-gold/40'
                      : 'bg-white/5 text-paper/50 hover:text-paper'
                  }`}
                >
                  Dhaka (৳80)
                </button>
                <button
                  type="button"
                  onClick={() => setShippingFee(130)}
                  className={`px-2 py-0.5 text-[10px] rounded-xs font-medium transition-colors ${
                    shippingFee === 130
                      ? 'bg-gold/20 text-gold border border-gold/40'
                      : 'bg-white/5 text-paper/50 hover:text-paper'
                  }`}
                >
                  Outside (৳130)
                </button>
                {districtFee > 0 && districtFee !== 80 && districtFee !== 130 && (
                  <button
                    type="button"
                    onClick={() => setShippingFee(districtFee)}
                    className={`px-2 py-0.5 text-[10px] rounded-xs font-medium transition-colors ${
                      shippingFee === districtFee
                        ? 'bg-gold/20 text-gold border border-gold/40'
                        : 'bg-white/5 text-paper/50 hover:text-paper'
                    }`}
                  >
                    District (৳{districtFee})
                  </button>
                )}
              </div>
            </div>

            {/* Live Financial Totals Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="space-y-1 text-paper/70">
                <div className="flex justify-between">
                  <span>Previous Item Total:</span>
                  <span className="tabular-nums">৳{formatPrice(oldItemTotal)}</span>
                </div>
                <div className="flex justify-between font-medium text-paper">
                  <span>New Item Total ({quantity} × ৳{formatPrice(unitPrice)}):</span>
                  <span className="text-gold-light tabular-nums font-semibold">
                    ৳{formatPrice(newItemTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Item Cost Difference:</span>
                  <span className={`tabular-nums font-medium ${itemDiff > 0 ? 'text-amber-400' : itemDiff < 0 ? 'text-emerald-400' : 'text-paper/50'}`}>
                    {itemDiff > 0 ? `+৳${formatPrice(itemDiff)}` : itemDiff < 0 ? `-৳${formatPrice(Math.abs(itemDiff))}` : '৳0 (Same)'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 sm:border-l sm:border-white/10 sm:pl-3">
                <div className="flex justify-between text-paper/70">
                  <span>New Subtotal:</span>
                  <span className="tabular-nums font-medium text-paper">৳{formatPrice(newSubtotal)}</span>
                </div>
                {voucherDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Voucher ({order.couponCode || 'PROMO'}):</span>
                    <span className="tabular-nums">-৳{formatPrice(voucherDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-paper/70">
                  <span>Delivery Charge:</span>
                  <span className="tabular-nums">৳{formatPrice(shippingFee)}</span>
                </div>
                <div className="flex justify-between items-center text-gold pt-1.5 border-t border-gold/20">
                  <span className="font-semibold text-xs uppercase tracking-wide">
                    New Total COD Collection:
                  </span>
                  <span className="font-bold text-sm sm:text-base tabular-nums">
                    ৳{formatPrice(finalGrandTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-white/10 pt-3.5 shrink-0">
          <div className="text-[11px] text-paper/50">
            <span>Updates database & recalculates WhatsApp verification text automatically.</span>
          </div>
          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-3.5 py-1.5 text-xs text-paper/60 hover:text-paper rounded-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmSwap}
              disabled={isSaving || !selectedProduct}
              className="px-4 py-1.5 bg-gold hover:bg-gold-light text-ink font-semibold text-xs rounded-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Confirm & Swap Product</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
