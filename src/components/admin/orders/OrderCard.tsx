'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Package,
  Clock,
  Phone,
  Copy,
  Check,
  Edit2,
  RefreshCw,
  Truck,
  Minus,
  Plus,
  Loader2,
  Save,
  ExternalLink,
  MessageCircle,
  Edit3,
  Sparkles,
  FileText,
  Trash2,
  X,
  Tag,
} from 'lucide-react';
import { AdminOrder, OrderStatus } from '@/context/OrdersContext';
import { formatPrice } from '@/lib/formatPrice';
import { getDistrictDeliveryFee } from '@/data/districts';

export const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; text: string; border: string; step: number; accentBorder: string }
> = {
  pending: {
    label: 'Pending Verification',
    bg: 'bg-amber-950/60',
    text: 'text-amber-300',
    border: 'border-amber-600/40',
    accentBorder: 'border-l-amber-500',
    step: 1,
  },
  verified: {
    label: 'WhatsApp Verified',
    bg: 'bg-blue-950/60',
    text: 'text-blue-300',
    border: 'border-blue-600/40',
    accentBorder: 'border-l-blue-500',
    step: 2,
  },
  packaging: {
    label: 'Packaging',
    bg: 'bg-purple-950/60',
    text: 'text-purple-300',
    border: 'border-purple-600/40',
    accentBorder: 'border-l-purple-500',
    step: 3,
  },
  handed_to_courier: {
    label: 'Handed to Courier',
    bg: 'bg-emerald-950/60',
    text: 'text-emerald-300',
    border: 'border-emerald-600/40',
    accentBorder: 'border-l-emerald-500',
    step: 4,
  },
  delivered: {
    label: 'Delivered & Paid',
    bg: 'bg-green-950/60',
    text: 'text-green-300',
    border: 'border-green-600/40',
    accentBorder: 'border-l-green-500',
    step: 5,
  },
  returned: {
    label: 'Returned to Merchant (RTO)',
    bg: 'bg-rose-950/60',
    text: 'text-rose-300',
    border: 'border-rose-600/40',
    accentBorder: 'border-l-rose-500',
    step: 0,
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-red-950/60',
    text: 'text-red-300',
    border: 'border-red-600/40',
    accentBorder: 'border-l-red-500',
    step: 0,
  },
};

export const getCourierPortalUrl = (courierPartner: string | null | undefined, consignmentId: string) => {
  if (!consignmentId) return '#';
  const c = (courierPartner || '').toLowerCase();
  if (c.includes('carrybee')) {
    return `https://carrybee.com/track?tracking_id=${encodeURIComponent(consignmentId)}`;
  }
  if (c.includes('pathao')) {
    return `https://merchant.pathao.com/tracking?consignment_id=${encodeURIComponent(consignmentId)}`;
  }
  return `https://steadfast.com.bd/t/${encodeURIComponent(consignmentId)}`;
};

interface OrderCardProps {
  order: AdminOrder;
  // Consignment
  isEditingConsignment: boolean;
  onStartEditConsignment: (order: AdminOrder) => void;
  consignmentInput: string;
  onConsignmentInputChange: (val: string) => void;
  courierInput: AdminOrder['courierPartner'];
  onCourierInputChange: (val: AdminOrder['courierPartner']) => void;
  onSaveConsignment: (orderId: string) => void;
  onCancelEditConsignment: () => void;
  // Quantity
  editingItemQuantity: {
    orderId: string;
    itemId: string;
    quantity: number;
    shippingFee: number;
    customTotal?: number;
  } | null;
  onStartEditQuantity: (order: AdminOrder, item: any, idx: number) => void;
  onStepQuantity: (step: number) => void;
  onDirectQuantityChange: (val: number) => void;
  onSetEditingShippingInQty: (fee: number) => void;
  onSaveQuantity: (orderId: string, itemId: string) => void;
  onCancelEditQuantity: () => void;
  isSavingQuantity: boolean;
  // Shipping Fee
  editingOrderShipping: { orderId: string; fee: number } | null;
  onStartEditShipping: (orderId: string, fee: number) => void;
  onShippingFeeChange: (fee: number) => void;
  onSaveShippingFee: (orderId: string) => void;
  onCancelEditShipping: () => void;
  isSavingShipping: boolean;
  // COD Override
  editingOrderCod: { orderId: string; amount: number } | null;
  onStartEditCod: (orderId: string, amount: number) => void;
  onCodAmountChange: (amount: number) => void;
  onSaveCodAmount: (orderId: string) => void;
  onCancelEditCod: () => void;
  isSavingCod: boolean;
  // Copy
  isCopied: boolean;
  onCopyOrderInfo: (order: AdminOrder) => void;
  // Swap product
  onStartSwapProduct: (order: AdminOrder, item: any, idx: number) => void;
  // Status
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  // WhatsApp
  whatsAppLink: string;
  onOpenCustomWhatsAppModal: (order: AdminOrder) => void;
  onSendWhatsAppApi: (orderId: string) => void;
  isSendingApi: boolean;
  // Delete
  onDeleteOrder: (orderId: string) => void;
}

export default function OrderCard({
  order,
  isEditingConsignment,
  onStartEditConsignment,
  consignmentInput,
  onConsignmentInputChange,
  courierInput,
  onCourierInputChange,
  onSaveConsignment,
  onCancelEditConsignment,
  editingItemQuantity,
  onStartEditQuantity,
  onStepQuantity,
  onDirectQuantityChange,
  onSetEditingShippingInQty,
  onSaveQuantity,
  onCancelEditQuantity,
  isSavingQuantity,
  editingOrderShipping,
  onStartEditShipping,
  onShippingFeeChange,
  onSaveShippingFee,
  onCancelEditShipping,
  isSavingShipping,
  editingOrderCod,
  onStartEditCod,
  onCodAmountChange,
  onSaveCodAmount,
  onCancelEditCod,
  isSavingCod,
  isCopied,
  onCopyOrderInfo,
  onStartSwapProduct,
  onUpdateStatus,
  whatsAppLink,
  onOpenCustomWhatsAppModal,
  onSendWhatsAppApi,
  isSendingApi,
  onDeleteOrder,
}: OrderCardProps) {
  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const totalItemCount = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div
      className={`bg-[#171717] border border-white/10 hover:border-gold/40 transition-colors p-4 sm:p-5 md:p-6 rounded-sm md:rounded-xs space-y-4 md:space-y-5 border-l-4 md:border-l ${
        statusConfig.accentBorder || 'border-l-gold'
      } shadow-lg shadow-black/40 md:shadow-none`}
    >
      {/* Order Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-white/10 pb-3.5 sm:pb-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Distinct Order Tag on Mobile */}
          <div className="flex items-center gap-1.5">
            <span className="md:hidden text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-gold/15 text-gold rounded-xs border border-gold/30">
              ORDER
            </span>
            <div className="font-mono text-base sm:text-lg text-gold font-bold tracking-wider">
              {order.orderId}
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={`px-2.5 py-1 rounded-xs text-[11px] font-bold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
          >
            {statusConfig.label}
          </span>

          {/* Region Pill */}
          <span className="text-[11px] px-2 py-0.5 bg-[#222222] text-zinc-200 font-semibold rounded-xs border border-white/10">
            {order.customer.district}
          </span>

          {/* Mobile Quick Summary Pill */}
          <div className="md:hidden inline-flex items-center gap-1.5 px-2 py-0.5 bg-black/40 rounded-xs border border-white/10 text-[11px]">
            <span className="text-zinc-400 font-medium">Total:</span>
            <strong className="text-gold font-extrabold tabular-nums">
              ৳{formatPrice(order.grandTotal)}
            </strong>
            <span className="text-white/20">·</span>
            <span className="text-zinc-300">
              {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-zinc-400 font-medium shrink-0">
          <Clock className="w-3.5 h-3.5" />
          <span>
            {new Date(order.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>

      {/* Main 3-Column Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-6 text-xs bg-[#191919] md:bg-transparent rounded-sm md:rounded-none border border-white/10 md:border-none divide-y divide-white/10 md:divide-y-0 overflow-hidden">
        {/* Left Column: Customer & Recipient */}
        <div className="md:col-span-4 space-y-3 p-4 bg-[#191919] md:bg-[#1C1C1C] md:p-4 md:rounded-xs md:border md:border-white/10 md:space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="md:hidden flex items-center justify-center w-5 h-5 rounded-full bg-gold/15 text-gold text-[10px] font-bold font-mono border border-gold/30 shrink-0">
                1
              </span>
              <span className="text-[11px] uppercase font-bold text-gold-light tracking-wider">
                Recipient Information
              </span>
            </div>

            {/* Copy Delivery & COD Button */}
            <button
              type="button"
              onClick={() => onCopyOrderInfo(order)}
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs text-[10px] font-semibold tracking-wide transition-all border cursor-pointer shrink-0 ${
                isCopied
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50 shadow-xs'
                  : 'bg-gold/10 hover:bg-gold/20 text-gold-light hover:text-gold border-gold/30 hover:border-gold/50'
              }`}
              title="Copy Customer Name, Phone, Address & Total COD Collection to clipboard"
            >
              {isCopied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="font-bold text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Delivery & COD</span>
                </>
              )}
            </button>
          </div>

          <div>
            <strong className="text-base font-bold text-white block tracking-tight">
              {order.customer.fullName}
            </strong>
            <a
              href={`tel:${order.customer.phone}`}
              className="text-sm font-bold text-gold-light hover:text-white tabular-nums tracking-wide flex items-center gap-1.5 mt-1 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-gold shrink-0" />
              <span>{order.customer.phone}</span>
            </a>
          </div>

          <div>
            <span className="text-[11px] uppercase text-zinc-400 font-bold block tracking-wider">
              Address:
            </span>
            <p className="text-xs sm:text-sm text-zinc-100 font-medium leading-relaxed mt-0.5">
              {order.customer.address},{' '}
              <strong className="text-gold-light font-bold">
                {order.customer.district}
              </strong>
            </p>
          </div>

          {order.customer.giftNote && (
            <div className="pt-2 border-t border-white/10">
              <span className="text-[11px] uppercase text-gold font-bold block tracking-wider">
                Gift Note:
              </span>
              <p className="italic text-zinc-200 mt-0.5 bg-black/40 p-2 rounded-xs border border-white/5">
                "{order.customer.giftNote}"
              </p>
            </div>
          )}
        </div>

        {/* Middle Column: Items List & Pricing Controls */}
        <div className="md:col-span-4 space-y-3 p-4 bg-[#191919] md:bg-[#1C1C1C] md:p-4 md:rounded-xs md:border md:border-white/10 md:space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="md:hidden flex items-center justify-center w-5 h-5 rounded-full bg-gold/15 text-gold text-[10px] font-bold font-mono border border-gold/30 shrink-0">
                2
              </span>
              <span className="text-[11px] uppercase font-bold text-gold-light tracking-wider">
                Package Items ({totalItemCount})
              </span>
            </div>

            <div className="md:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-gold/10 border border-gold/30 text-[10px] font-mono shrink-0">
              <span className="text-gold/70 text-[9px] uppercase font-semibold">Order</span>
              <span className="text-gold font-bold">{order.orderId}</span>
            </div>
          </div>

          {/* Items breakdown */}
          <div className="space-y-2 divide-y divide-white/5">
            {order.items.map((item, idx) => {
              const isEditingThis =
                editingItemQuantity?.orderId === order.orderId &&
                (editingItemQuantity?.itemId === item.id || (!item.id && idx === 0));

              return (
                <div key={item.id || idx} className="pt-2 first:pt-0 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="relative w-10 h-12 bg-stone rounded-xs overflow-hidden shrink-0 border border-white/10">
                        {item.product.featuredImage ? (
                          <Image
                            src={item.product.featuredImage}
                            alt={item.product.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <Package className="w-4 h-4 text-paper/40 m-auto mt-3" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <span className="font-bold text-white text-xs sm:text-sm line-clamp-1 block tracking-tight">
                          {item.product.name}
                        </span>
                        <div className="text-[11px] text-zinc-300 font-medium flex items-center gap-1.5 flex-wrap mt-0.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/40 shrink-0"
                            style={{ backgroundColor: item.selectedColor.hex }}
                          />
                          <span className="text-zinc-200">{item.selectedColor.name}</span>
                          {item.selectedSize && (
                            <span className="text-zinc-300">· {item.selectedSize}</span>
                          )}
                          <span className="font-bold text-white">· Qty: {item.quantity}</span>

                          {!isEditingThis && (
                            <div className="flex items-center gap-1.5 ml-1">
                              <button
                                type="button"
                                onClick={() => onStartEditQuantity(order, item, idx)}
                                className="text-[11px] text-gold hover:text-gold-light hover:underline flex items-center gap-0.5 font-bold transition-colors cursor-pointer"
                                title="Change ordered quantity"
                              >
                                <Edit2 className="w-2.5 h-2.5" />
                                <span>Edit Qty</span>
                              </button>
                              <span className="text-paper/20">·</span>
                              <button
                                type="button"
                                onClick={() => onStartSwapProduct(order, item, idx)}
                                className="text-[11px] text-amber-300 hover:text-amber-200 hover:underline flex items-center gap-0.5 font-bold transition-colors cursor-pointer"
                                title="Customer called & changed product: Swap ordered piece"
                              >
                                <RefreshCw className="w-2.5 h-2.5" />
                                <span>Change Product</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className="font-extrabold text-gold-light tabular-nums shrink-0 text-xs sm:text-sm">
                      ৳{formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>

                  {/* Inline Quantity Editor Form */}
                  {isEditingThis && (
                    <div className="bg-black/60 border border-gold/30 p-2.5 rounded-xs space-y-2 mt-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-paper/80 font-medium">
                          Adjust Quantity:
                        </span>
                        <div className="flex items-center border border-white/20 rounded-xs bg-[#222]">
                          <button
                            type="button"
                            onClick={() => onStepQuantity(-1)}
                            disabled={editingItemQuantity.quantity <= 1}
                            className="px-2 py-1 text-paper hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min={1}
                            max={99}
                            value={editingItemQuantity.quantity}
                            onChange={(e) =>
                              onDirectQuantityChange(parseInt(e.target.value) || 1)
                            }
                            className="w-12 text-center bg-transparent text-paper font-bold text-xs focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => onStepQuantity(1)}
                            className="px-2 py-1 text-paper hover:bg-white/10 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Live Calculation Preview */}
                      {(() => {
                        const districtFee = getDistrictDeliveryFee(order.customer.district || '');
                        const previewSubtotal = item.product.price * editingItemQuantity.quantity;
                        const ratio =
                          order.subtotal > 0 &&
                          typeof order.discountAmount === 'number' &&
                          order.discountAmount > 0
                            ? order.discountAmount / order.subtotal
                            : 0;
                        const previewDiscount =
                          ratio > 0 ? Math.round(previewSubtotal * ratio * 100) / 100 : 0;
                        const previewGrandTotal = Math.max(
                          0,
                          Math.round(
                            (previewSubtotal - previewDiscount + editingItemQuantity.shippingFee) *
                              100
                          ) / 100
                        );

                        return (
                          <div className="bg-[#181818] p-2.5 rounded-xs space-y-1.5 text-[11px] border border-white/5">
                            <div className="flex justify-between text-paper/70">
                              <span>
                                Item Subtotal ({editingItemQuantity.quantity} × ৳
                                {formatPrice(item.product.price)}):
                              </span>
                              <span className="text-paper font-semibold tabular-nums">
                                ৳{formatPrice(previewSubtotal)}
                              </span>
                            </div>

                            {previewDiscount > 0 && (
                              <div className="flex justify-between text-emerald-400">
                                <span>Voucher ({order.couponCode || 'PROMO'}):</span>
                                <span className="tabular-nums">-৳{formatPrice(previewDiscount)}</span>
                              </div>
                            )}

                            <div className="flex justify-between items-center text-paper/70 pt-1 border-t border-white/5">
                              <span className="flex items-center gap-1">
                                <Truck className="w-3 h-3 text-paper/40" />
                                <span>Delivery ({order.customer.district || 'Standard'}):</span>
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => onSetEditingShippingInQty(0)}
                                  className={`px-1.5 py-0.5 text-[10px] rounded-xs font-medium transition-colors ${
                                    editingItemQuantity.shippingFee === 0
                                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                      : 'bg-white/5 text-paper/50 hover:text-paper'
                                  }`}
                                >
                                  Free (৳0)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onSetEditingShippingInQty(districtFee)}
                                  className={`px-1.5 py-0.5 text-[10px] rounded-xs font-medium transition-colors ${
                                    editingItemQuantity.shippingFee === districtFee
                                      ? 'bg-gold/20 text-gold border border-gold/40'
                                      : 'bg-white/5 text-paper/50 hover:text-paper'
                                  }`}
                                >
                                  ৳{districtFee}
                                </button>
                              </div>
                            </div>

                            <div className="flex justify-between text-gold pt-1 border-t border-white/5">
                              <span className="font-medium">New Total COD Collection:</span>
                              <span className="font-bold tabular-nums">
                                ৳{formatPrice(previewGrandTotal)}
                              </span>
                            </div>
                          </div>
                        );
                      })()}

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={onCancelEditQuantity}
                          className="px-2.5 py-1 text-[11px] text-paper/50 hover:text-paper rounded-xs transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onSaveQuantity(order.orderId, item.id || editingItemQuantity.itemId)
                          }
                          disabled={isSavingQuantity}
                          className="px-3 py-1 bg-gold hover:bg-gold-light text-ink font-semibold text-[11px] rounded-xs uppercase tracking-wider flex items-center gap-1 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                        >
                          {isSavingQuantity ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Update Order</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pricing Totals Strip */}
          <div className="border-t border-white/10 pt-2.5 space-y-1.5 text-xs">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-paper/60 text-[11px]">
              <span>Subtotal:</span>
              <span className="font-semibold text-paper/80 tabular-nums">
                ৳{formatPrice(order.subtotal)}
              </span>
            </div>

            {/* Voucher / Coupon */}
            {order.couponCode && (
              <div className="flex items-center justify-between text-[11px] text-emerald-400">
                <span className="flex items-center space-x-1">
                  <Tag className="w-3 h-3" />
                  <span>Voucher ({order.couponCode}):</span>
                </span>
                <span>-৳{formatPrice(order.discountAmount || 0)}</span>
              </div>
            )}

            {/* Delivery Charge */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-paper/60 flex items-center gap-1 text-[11px]">
                <Truck className="w-3 h-3 text-paper/40" />
                <span>
                  Delivery Charge {order.customer.district ? `(${order.customer.district})` : ''}:
                </span>
              </span>

              {editingOrderShipping?.orderId === order.orderId ? (
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  <span className="text-gold font-bold text-xs">৳</span>
                  <input
                    type="number"
                    min={0}
                    value={editingOrderShipping.fee}
                    onChange={(e) =>
                      onShippingFeeChange(Math.max(0, parseInt(e.target.value) || 0))
                    }
                    className="w-14 px-1.5 py-0.5 bg-[#222] border border-white/20 rounded-xs text-xs font-bold text-paper text-right"
                  />
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onShippingFeeChange(0)}
                      className={`px-1.5 py-0.5 text-[9px] rounded-xs font-medium ${
                        editingOrderShipping.fee === 0
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : 'bg-white/5 text-paper/50 hover:text-paper'
                      }`}
                    >
                      Free
                    </button>
                    <button
                      type="button"
                      onClick={() => onShippingFeeChange(80)}
                      className={`px-1.5 py-0.5 text-[9px] rounded-xs font-medium ${
                        editingOrderShipping.fee === 80
                          ? 'bg-gold/20 text-gold border border-gold/40'
                          : 'bg-white/5 text-paper/50 hover:text-paper'
                      }`}
                    >
                      ৳80
                    </button>
                    <button
                      type="button"
                      onClick={() => onShippingFeeChange(130)}
                      className={`px-1.5 py-0.5 text-[9px] rounded-xs font-medium ${
                        editingOrderShipping.fee === 130
                          ? 'bg-gold/20 text-gold border border-gold/40'
                          : 'bg-white/5 text-paper/50 hover:text-paper'
                      }`}
                    >
                      ৳130
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSaveShippingFee(order.orderId)}
                    disabled={isSavingShipping}
                    className="p-1 bg-gold text-ink rounded-xs hover:bg-gold-light cursor-pointer"
                    title="Save Delivery Fee"
                  >
                    {isSavingShipping ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Check className="w-3 h-3" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={onCancelEditShipping}
                    className="p-1 text-paper/50 hover:text-paper cursor-pointer"
                    title="Cancel"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold tabular-nums text-xs">
                    {order.shippingFee === 0 ? (
                      <span className="text-emerald-400 font-medium">Free (৳0)</span>
                    ) : (
                      <span className="text-paper/90 font-medium">
                        ৳{formatPrice(order.shippingFee)}
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => onStartEditShipping(order.orderId, order.shippingFee)}
                    className="text-[10px] text-paper/40 hover:text-gold flex items-center gap-0.5 cursor-pointer"
                    title="Edit delivery charge"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Total COD Collection */}
            <div className="flex items-center justify-between">
              <span className="text-paper/50">Total COD Collection:</span>
              {editingOrderCod?.orderId === order.orderId ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-gold font-bold text-xs">৳</span>
                  <input
                    type="number"
                    min={0}
                    value={editingOrderCod.amount}
                    onChange={(e) =>
                      onCodAmountChange(Math.max(0, parseInt(e.target.value) || 0))
                    }
                    className="w-20 px-1.5 py-0.5 bg-[#222] border border-white/20 rounded-xs text-xs font-bold text-gold text-right"
                  />
                  <button
                    type="button"
                    onClick={() => onSaveCodAmount(order.orderId)}
                    disabled={isSavingCod}
                    className="p-1 bg-gold text-ink rounded-xs hover:bg-gold-light cursor-pointer"
                    title="Save custom COD"
                  >
                    {isSavingCod ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Check className="w-3 h-3" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={onCancelEditCod}
                    className="p-1 text-paper/50 hover:text-paper cursor-pointer"
                    title="Cancel"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <strong className="text-base font-extrabold text-gold tabular-nums tracking-tight">
                    ৳{formatPrice(order.grandTotal)}
                  </strong>
                  <button
                    type="button"
                    onClick={() => onStartEditCod(order.orderId, order.grandTotal)}
                    className="text-[11px] text-zinc-400 hover:text-gold flex items-center gap-0.5 cursor-pointer"
                    title="Manually adjust COD collection amount"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Logistics & Courier Action */}
        <div className="md:col-span-4 space-y-3 p-4 bg-[#191919] md:bg-[#1C1C1C] md:p-4 md:rounded-xs md:border md:border-white/10">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="md:hidden flex items-center justify-center w-5 h-5 rounded-full bg-gold/15 text-gold text-[10px] font-bold font-mono border border-gold/30 shrink-0">
                3
              </span>
              <span className="text-[11px] uppercase font-bold text-gold-light tracking-wider">
                Logistics & Courier Action
              </span>
            </div>

            <div className="md:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-gold/10 border border-gold/30 text-[10px] font-mono shrink-0">
              <span className="text-gold/70 text-[9px] uppercase font-semibold">Order</span>
              <span className="text-gold font-bold">{order.orderId}</span>
            </div>
          </div>

          {/* Consignment Assignment */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-paper/60">Courier Consignment:</span>
              {!isEditingConsignment && (
                <button
                  type="button"
                  onClick={() => onStartEditConsignment(order)}
                  className="text-[10px] text-gold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit ID</span>
                </button>
              )}
            </div>

            {isEditingConsignment ? (
              <div className="space-y-2 bg-black/40 p-2 rounded-xs">
                <select
                  value={courierInput ?? ''}
                  onChange={(e) => onCourierInputChange(e.target.value as any)}
                  className="w-full h-8 px-2 bg-[#222222] border border-white/10 rounded-xs text-xs text-paper"
                >
                  <option value="CarryBee">CarryBee</option>
                  <option value="Pathao Courier">Pathao Courier</option>
                  <option value="Steadfast Courier">Steadfast Courier</option>
                  <option value="RedX">RedX</option>
                  <option value="Paperfly">Paperfly</option>
                </select>
                <input
                  type="text"
                  value={consignmentInput}
                  onChange={(e) => onConsignmentInputChange(e.target.value)}
                  placeholder={
                    courierInput === 'CarryBee'
                      ? 'e.g. CB-88294102'
                      : courierInput === 'Pathao Courier'
                      ? 'e.g. PT-88294102'
                      : 'e.g. ST-88294102'
                  }
                  className="w-full h-8 px-2 bg-[#222222] border border-white/10 rounded-xs text-xs font-mono text-paper"
                />
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => onSaveConsignment(order.orderId)}
                    className="px-3 py-1 bg-gold text-ink font-semibold text-[10px] rounded-xs uppercase tracking-wider flex items-center space-x-1 cursor-pointer"
                  >
                    <Save className="w-3 h-3" />
                    <span>Save</span>
                  </button>
                  <button
                    type="button"
                    onClick={onCancelEditConsignment}
                    className="px-2 py-1 text-paper/50 hover:text-paper text-[10px] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-2 bg-black/30 rounded-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-paper/40 block">
                    {order.courierPartner || 'Unassigned'}
                  </span>
                  <span className="font-mono text-xs text-paper font-medium">
                    {order.consignmentId || 'Unassigned (Awaiting pickup)'}
                  </span>
                </div>
                {order.consignmentId && (
                  <a
                    href={getCourierPortalUrl(order.courierPartner, order.consignmentId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold-light hover:text-gold p-1"
                    title="Check on courier portal"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Status Changer Dropdown */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-paper/50 tracking-wider block font-semibold">
              Advance Fulfillment Stage:
            </label>
            <select
              value={order.status}
              onChange={(e) => onUpdateStatus(order.orderId, e.target.value as OrderStatus)}
              className="w-full h-9 px-2.5 bg-[#222222] border border-gold/30 rounded-xs text-xs text-gold-light font-medium focus:outline-none focus:border-gold"
            >
              <option value="pending">1. Pending WhatsApp Verification</option>
              <option value="verified">2. WhatsApp Verified</option>
              <option value="packaging">3. Packaging</option>
              <option value="handed_to_courier">4. Handed to Courier (In Transit)</option>
              <option value="delivered">5. Delivered & Cash Collected</option>
              <option value="returned">6. Returned to Merchant (RTO)</option>
              <option value="cancelled">7. Cancelled Order</option>
            </select>
          </div>

          {/* WhatsApp Action Suite */}
          <div className="space-y-1">
            {order.internalNotes && order.internalNotes.includes('[WhatsApp Auto-Sent:') && (
              <div className="flex items-center justify-center space-x-1 py-1 px-2 bg-emerald-950/70 border border-emerald-500/40 rounded-xs text-[10px] text-emerald-300 font-medium">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>WhatsApp Auto-Sent (30s)</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <a
                href={whatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xs font-semibold text-[11px] uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5 text-white" />
                <span>Verify on WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={() => onOpenCustomWhatsAppModal(order)}
                className="py-2 px-2.5 bg-emerald-800/80 hover:bg-emerald-700 border border-emerald-600/40 text-emerald-200 hover:text-white rounded-xs text-[11px] flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                title="Edit message for this order before opening WhatsApp"
                aria-label="Edit message before opening WhatsApp"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => onSendWhatsAppApi(order.orderId)}
              disabled={isSendingApi}
              className="w-full py-1.5 bg-[#252525] hover:bg-[#303030] border border-white/10 text-paper/70 hover:text-paper rounded-xs text-[10px] uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              title="Trigger official Meta WhatsApp Cloud API automated message"
            >
              {isSendingApi ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-gold" />
                  <span>Sending via Meta API...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 text-gold" />
                  <span>Send via Meta API</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row Actions */}
      <div className="pt-3 border-t border-white/10 md:border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        {/* Internal Staff Notes */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <FileText className="w-3.5 h-3.5 text-paper/40 shrink-0" />
          <span className="text-[11px] text-paper/50 italic">
            Staff Note: {order.internalNotes || 'No notes added.'}
          </span>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <Link
            href={`/track-order?ref=${order.orderId}`}
            target="_blank"
            className="text-[11px] text-gold-light/70 hover:text-gold hover:underline flex items-center space-x-1"
          >
            <span>Preview Patron View</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <button
            type="button"
            onClick={() => {
              if (confirm(`Are you sure you want to delete order ${order.orderId}?`)) {
                onDeleteOrder(order.orderId);
              }
            }}
            className="text-paper/30 hover:text-red-400 transition-colors p-1 cursor-pointer"
            title="Delete Order Record"
            aria-label="Delete Order"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
