'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useOrders, AdminOrder, OrderStatus } from '@/context/OrdersContext';
import {
  Search,
  Filter,
  Truck,
  MessageCircle,
  CheckCircle2,
  Clock,
  Package,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Edit2,
  Trash2,
  RotateCcw,
  Sparkles,
  Phone,
  FileText,
  Save,
  Tag,
  Plus,
  Minus,
  Check,
  Loader2,
  X,
  XCircle,
  Ban,
  Copy
} from 'lucide-react';
import { formatPrice } from '@/lib/formatPrice';
import { getDistrictDeliveryFee } from '@/data/districts';

const getCourierPortalUrl = (courierPartner: string | null | undefined, consignmentId: string) => {
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

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; text: string; border: string; step: number }
> = {
  pending: {
    label: 'Pending Verification',
    bg: 'bg-amber-950/60',
    text: 'text-amber-300',
    border: 'border-amber-600/40',
    step: 1,
  },
  verified: {
    label: 'WhatsApp Verified',
    bg: 'bg-blue-950/60',
    text: 'text-blue-300',
    border: 'border-blue-600/40',
    step: 2,
  },
  packaging: {
    label: 'Packaging',
    bg: 'bg-purple-950/60',
    text: 'text-purple-300',
    border: 'border-purple-600/40',
    step: 3,
  },
  handed_to_courier: {
    label: 'Handed to Courier',
    bg: 'bg-emerald-950/60',
    text: 'text-emerald-300',
    border: 'border-emerald-600/40',
    step: 4,
  },
  delivered: {
    label: 'Delivered & Paid',
    bg: 'bg-green-950/60',
    text: 'text-green-300',
    border: 'border-green-600/40',
    step: 5,
  },
  returned: {
    label: 'Returned to Merchant (RTO)',
    bg: 'bg-rose-950/60',
    text: 'text-rose-300',
    border: 'border-rose-600/40',
    step: 0,
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-red-950/60',
    text: 'text-red-300',
    border: 'border-red-600/40',
    step: 0,
  },
};

function AdminOrdersDesk() {
  const {
    orders,
    updateOrderStatus,
    updateOrderCourier,
    updateInternalNotes,
    deleteOrder,
    resetToSampleOrders,
    updateOrderItemQuantity,
    updateOrderShippingFee,
    updateOrderTotals,
  } = useOrders();

  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(statusParam || 'all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [editingConsignmentOrderId, setEditingConsignmentOrderId] = useState<string | null>(null);
  const [consignmentInput, setConsignmentInput] = useState('');
  const [courierInput, setCourierInput] = useState<AdminOrder['courierPartner']>('Steadfast Courier');

  useEffect(() => {
    if (statusParam) {
      setStatusFilter(statusParam);
    }
  }, [statusParam]);

  // Quantity editing state
  const [editingItemQuantity, setEditingItemQuantity] = useState<{
    orderId: string;
    itemId: string;
    quantity: number;
    shippingFee: number;
    customTotal?: number;
  } | null>(null);
  const [isSavingQuantity, setIsSavingQuantity] = useState(false);

  // Delivery charge editing state
  const [editingOrderShipping, setEditingOrderShipping] = useState<{
    orderId: string;
    fee: number;
  } | null>(null);
  const [isSavingShipping, setIsSavingShipping] = useState(false);

  // Direct COD collection amount override state
  const [editingOrderCod, setEditingOrderCod] = useState<{
    orderId: string;
    amount: number;
  } | null>(null);
  const [isSavingCod, setIsSavingCod] = useState(false);

  // Copied order delivery & COD info state
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  const handleStartEditQuantity = (order: AdminOrder, item: any, index: number) => {
    // If current shippingFee is 0 but district qualifies for standard fee, we default to current shippingFee
    setEditingItemQuantity({
      orderId: order.orderId,
      itemId: item.id || `item-${index}`,
      quantity: item.quantity,
      shippingFee: order.shippingFee,
    });
  };

  const handleStepQuantity = (step: number) => {
    if (!editingItemQuantity) return;
    const next = Math.max(1, editingItemQuantity.quantity + step);
    setEditingItemQuantity({
      ...editingItemQuantity,
      quantity: next,
    });
  };

  const handleDirectQuantityChange = (val: number) => {
    if (!editingItemQuantity) return;
    const next = Math.max(1, Math.min(99, isNaN(val) ? 1 : val));
    setEditingItemQuantity({
      ...editingItemQuantity,
      quantity: next,
    });
  };

  const calculatePreviewGrandTotal = (order: AdminOrder, item: any, newQty: number, shippingFeeOverride?: number) => {
    const newSubtotal = order.items.reduce((sum, it) => {
      const q = (it.id === item.id || (!it.id && order.items.length === 1)) ? newQty : it.quantity;
      return sum + (it.product.price * q);
    }, 0);

    let newDiscount = order.discountAmount;
    if (order.subtotal > 0 && typeof order.discountAmount === 'number' && order.discountAmount > 0) {
      newDiscount = Math.round(newSubtotal * (order.discountAmount / order.subtotal) * 100) / 100;
    }

    const ship = typeof shippingFeeOverride === 'number' ? shippingFeeOverride : order.shippingFee;
    return Math.max(0, Math.round((newSubtotal - (newDiscount || 0) + ship) * 100) / 100);
  };

  const handleSaveQuantity = async (orderId: string, itemId: string) => {
    if (!editingItemQuantity) return;
    setIsSavingQuantity(true);
    try {
      await updateOrderItemQuantity(
        orderId,
        itemId,
        editingItemQuantity.quantity,
        editingItemQuantity.customTotal,
        editingItemQuantity.shippingFee
      );
      setEditingItemQuantity(null);
    } catch (err) {
      console.error('Failed to update quantity:', err);
    } finally {
      setIsSavingQuantity(false);
    }
  };

  const handleSaveShippingFee = async (orderId: string) => {
    if (!editingOrderShipping) return;
    setIsSavingShipping(true);
    try {
      await updateOrderShippingFee(orderId, editingOrderShipping.fee);
      setEditingOrderShipping(null);
    } catch (err) {
      console.error('Failed to update delivery fee:', err);
    } finally {
      setIsSavingShipping(false);
    }
  };

  const handleSaveCodAmount = async (orderId: string) => {
    if (!editingOrderCod) return;
    setIsSavingCod(true);
    try {
      await updateOrderTotals(orderId, editingOrderCod.amount);
      setEditingOrderCod(null);
    } catch (err) {
      console.error('Failed to update COD collection amount:', err);
    } finally {
      setIsSavingCod(false);
    }
  };

  // Stats calculation
  const totalOrders = orders.length;
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const verifiedCount = orders.filter((o) => o.status === 'verified').length;
  const packagingCount = orders.filter((o) => o.status === 'packaging').length;
  const courierCount = orders.filter((o) => o.status === 'handed_to_courier').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const returnedCount = orders.filter((o) => o.status === 'returned').length;
  const cancelledCount = orders.filter((o) => o.status === 'cancelled').length;
  const returnedAndCancelledCount = returnedCount + cancelledCount;

  const totalRevenue = orders.reduce((sum, o) => sum + o.grandTotal, 0);
  const deliveredRevenue = orders
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + o.grandTotal, 0);
  const returnedAndCancelledRevenue = orders
    .filter((o) => o.status === 'returned' || o.status === 'cancelled')
    .reduce((sum, o) => sum + o.grandTotal, 0);

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    // Search query
    const cleanSearch = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !cleanSearch ||
      order.orderId.toLowerCase().includes(cleanSearch) ||
      order.customer.fullName.toLowerCase().includes(cleanSearch) ||
      order.customer.phone.includes(cleanSearch) ||
      (order.consignmentId && order.consignmentId.toLowerCase().includes(cleanSearch));

    // Status filter
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'returned_and_cancelled'
          ? order.status === 'returned' || order.status === 'cancelled'
          : order.status === statusFilter;

    // Region filter
    const isDhaka = order.customer.district.toLowerCase().includes('dhaka');
    const matchesRegion =
      regionFilter === 'all' ||
      (regionFilter === 'dhaka' && isDhaka) ||
      (regionFilter === 'outside' && !isDhaka);

    return matchesSearch && matchesStatus && matchesRegion;
  });

  const handleStartEditConsignment = (order: AdminOrder) => {
    setEditingConsignmentOrderId(order.orderId);
    setConsignmentInput(order.consignmentId || '');
    setCourierInput(order.courierPartner || 'Steadfast Courier');
  };

  const handleSaveConsignment = (orderId: string) => {
    updateOrderCourier(orderId, courierInput, consignmentInput.trim());
    setEditingConsignmentOrderId(null);
  };

  const generateWhatsAppVerificationLink = (order: AdminOrder) => {
    let msg = `Hello ${order.customer.fullName}! Greetings from Adorous Fashion.\n\n`;
    msg += `We have received your Cash on Delivery order: ${order.orderId}\n\n`;
    msg += `Items: ${order.items.map((i) => `${i.product.name} (${i.selectedColor.name})`).join(', ')}\n\n`;
    msg += `Total Amount: ৳${formatPrice(order.grandTotal)}\n`;
    msg += `Delivery Address: ${order.customer.address}, ${order.customer.district}\n\n`;
    msg += `Please confirm if this address is correct so we can package and dispatch your order today.`;

    const cleanPhone = order.customer.phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  const handleCopyOrderInfo = async (order: AdminOrder) => {
    const rawAddress = (order.customer.address || '').trim().replace(/[\s,]+$/, '');
    const rawDistrict = (order.customer.district || '').trim();
    let fullAddress = rawAddress;
    if (rawDistrict && !rawAddress.toLowerCase().includes(rawDistrict.toLowerCase())) {
      fullAddress = rawAddress ? `${rawAddress}, ${rawDistrict}` : rawDistrict;
    }

    const textToCopy = [
      `Customer Name: ${order.customer.fullName || ''}`,
      `Customer Phone: ${order.customer.phone || ''}`,
      `Address: ${fullAddress}`,
      `Total COD Collection: ৳${formatPrice(order.grandTotal ?? 0)}`,
    ].join('\n');

    let success = false;
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        success = true;
      } catch (err) {
        console.warn('Clipboard writeText failed, attempting fallback', err);
      }
    }

    if (!success && typeof document !== 'undefined') {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        success = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (err) {
        console.error('Fallback clipboard copy failed', err);
      }
    }

    if (success) {
      setCopiedOrderId(order.orderId);
      setTimeout(() => {
        setCopiedOrderId((prev) => (prev === order.orderId ? null : prev));
      }, 2000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Metrics Banner */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`text-left bg-[#171717] border p-3.5 rounded-xs space-y-1 transition-all cursor-pointer ${statusFilter === 'all' ? 'border-gold bg-[#1c1a15]' : 'border-white/10 hover:border-white/30'
              }`}
          >
            <span className="text-[10px] uppercase tracking-wider text-paper/50 block font-medium">
              Total Orders
            </span>
            <div className="text-2xl font-serif text-paper font-semibold">{totalOrders}</div>
            <span className="text-[10px] text-paper/40">Logged in System</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`text-left bg-[#171717] border p-3.5 rounded-xs space-y-1 transition-all cursor-pointer ${statusFilter === 'pending' ? 'border-amber-400 bg-amber-950/20' : 'border-amber-600/30 hover:border-amber-500/60'
              }`}
          >
            <span className="text-[10px] uppercase tracking-wider text-amber-400 block font-medium">
              Pending Call
            </span>
            <div className="text-2xl font-serif text-amber-300 font-semibold">{pendingCount}</div>
            <span className="text-[10px] text-amber-200/50">Needs verification</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('packaging')}
            className={`text-left bg-[#171717] border p-3.5 rounded-xs space-y-1 transition-all cursor-pointer ${statusFilter === 'packaging' ? 'border-purple-400 bg-purple-950/20' : 'border-purple-600/30 hover:border-purple-500/60'
              }`}
          >
            <span className="text-[10px] uppercase tracking-wider text-purple-400 block font-medium">
              In Packaging
            </span>
            <div className="text-2xl font-serif text-purple-300 font-semibold">{packagingCount}</div>
            <span className="text-[10px] text-purple-200/50">Inspecting & sealing</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('handed_to_courier')}
            className={`text-left bg-[#171717] border p-3.5 rounded-xs space-y-1 transition-all cursor-pointer ${statusFilter === 'handed_to_courier' ? 'border-blue-400 bg-blue-950/20' : 'border-blue-600/30 hover:border-blue-500/60'
              }`}
          >
            <span className="text-[10px] uppercase tracking-wider text-blue-400 block font-medium">
              With Courier
            </span>
            <div className="text-2xl font-serif text-blue-300 font-semibold">{courierCount}</div>
            <span className="text-[10px] text-blue-200/50">In active delivery</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('delivered')}
            className={`text-left bg-[#171717] border p-3.5 rounded-xs space-y-1 transition-all cursor-pointer ${statusFilter === 'delivered' ? 'border-emerald-400 bg-emerald-950/20' : 'border-emerald-600/30 hover:border-emerald-500/60'
              }`}
          >
            <span className="text-[10px] uppercase tracking-wider text-emerald-400 block font-medium">
              Delivered & Paid
            </span>
            <div className="text-2xl font-serif text-emerald-300 font-semibold">{deliveredCount}</div>
            <span className="text-[10px] text-emerald-200/50">Completed & Remitted</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('returned_and_cancelled')}
            className={`text-left bg-[#181212] border p-3.5 rounded-xs space-y-1 transition-all cursor-pointer group ${['returned_and_cancelled', 'returned', 'cancelled'].includes(statusFilter)
              ? 'border-red-500 bg-red-950/40 shadow-xs'
              : 'border-red-600/40 hover:border-red-500/80 hover:bg-[#201515]'
              }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-red-400 block font-medium group-hover:text-red-300">
                Returned & Cancelled
              </span>
              <RotateCcw className="w-3 h-3 text-red-400/70 group-hover:text-red-300" />
            </div>
            <div className="text-2xl font-serif text-red-300 font-semibold">{returnedAndCancelledCount}</div>
            <span className="text-[10px] text-red-200/60 block">
              {returnedCount} Ret · {cancelledCount} Canc
            </span>
          </button>
        </div>

        {/* Financial Pipeline Strip */}
        <div className="bg-[#141414] border border-white/10 p-3.5 rounded-xs flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-gold/70 block font-medium">
                Total Order Pipeline
              </span>
              <div className="text-base font-serif text-gold-light font-semibold">
                ৳{totalRevenue.toLocaleString('en-US')}
              </div>
            </div>
            <div className="h-7 w-px bg-white/10 hidden sm:block" />
            <div>
              <span className="text-[10px] uppercase tracking-wider text-emerald-400/70 block font-medium">
                Delivered & Collected
              </span>
              <div className="text-base font-serif text-emerald-300 font-semibold">
                ৳{deliveredRevenue.toLocaleString('en-US')}
              </div>
            </div>
            <div className="h-7 w-px bg-white/10 hidden sm:block" />
            <div>
              <span className="text-[10px] uppercase tracking-wider text-red-400/70 block font-medium">
                Returned / Cancelled Value
              </span>
              <div className="text-base font-serif text-red-300 font-semibold">
                ৳{returnedAndCancelledRevenue.toLocaleString('en-US')}
              </div>
            </div>
          </div>

          <div className="text-right text-[11px] text-paper/40">
            <span>Cash on Delivery · Real-time Database Sync</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-[#171717] border border-white/10 p-5 rounded-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-paper/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID (AF-...), Patron Name, Phone, or Consignment..."
              className="w-full h-11 pl-10 pr-4 bg-[#222222] border border-white/10 rounded-xs text-xs text-paper placeholder:text-paper/40 focus:outline-none focus:border-gold transition-colors"
            />
          </div>

          {/* Region Filter */}
          <div className="flex items-center space-x-2">
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="h-11 px-3 bg-[#222222] border border-white/10 rounded-xs text-xs text-paper focus:outline-none focus:border-gold"
            >
              <option value="all">All Delivery Regions</option>
              <option value="dhaka">Dhaka (৳80 / Free)</option>
              <option value="outside">Outside Dhaka (৳130 / Free)</option>
            </select>

            <button
              type="button"
              onClick={resetToSampleOrders}
              className="h-11 px-3.5 bg-[#222222] hover:bg-[#2A2A2A] border border-white/10 rounded-xs text-xs text-paper/70 hover:text-gold transition-colors flex items-center space-x-1.5 shrink-0"
              title="Reset sample orders for testing"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-[11px] text-paper/40 font-medium mr-1">Status:</span>
          {[
            { id: 'all', label: 'All Orders', count: orders.length },
            { id: 'pending', label: 'Pending WhatsApp', count: pendingCount },
            { id: 'verified', label: 'Verified', count: verifiedCount },
            { id: 'packaging', label: 'In Packaging', count: packagingCount },
            { id: 'handed_to_courier', label: 'With Courier', count: courierCount },
            { id: 'delivered', label: 'Delivered', count: deliveredCount },
            {
              id: 'returned_and_cancelled',
              label: 'Returned & Cancelled',
              count: returnedAndCancelledCount,
              isRedGroup: true,
            },
            { id: 'returned', label: 'Returned', count: returnedCount, isRedGroup: true },
            { id: 'cancelled', label: 'Cancelled', count: cancelledCount, isRedGroup: true },
          ].map((pill) => {
            const isActive = statusFilter === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setStatusFilter(pill.id)}
                className={`px-3 py-1 rounded-xs text-[11px] transition-all flex items-center space-x-1.5 ${isActive
                  ? pill.isRedGroup
                    ? 'bg-red-800 text-white font-semibold shadow-xs border border-red-500'
                    : 'bg-gold text-ink font-semibold shadow-xs'
                  : pill.isRedGroup && pill.count > 0
                    ? 'bg-[#221717] hover:bg-[#2c1c1c] text-red-300 border border-red-900/50 hover:border-red-700/60'
                    : 'bg-[#222222] text-paper/70 hover:text-paper hover:bg-[#2A2A2A] border border-white/5'
                  }`}
              >
                <span>{pill.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${isActive
                    ? pill.isRedGroup
                      ? 'bg-black/50 text-red-200'
                      : 'bg-ink text-gold'
                    : pill.isRedGroup && pill.count > 0
                      ? 'bg-red-950 text-red-300 border border-red-800/40'
                      : 'bg-black/40 text-paper/60'
                    }`}
                >
                  {pill.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {/* Returned & Cancelled Context Alert */}
        {['returned_and_cancelled', 'returned', 'cancelled'].includes(statusFilter) && (
          <div className="bg-[#1C1414] border border-red-700/40 p-4 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3 text-red-300">
              <div className="p-2 bg-red-950/80 rounded-xs border border-red-800/50 shrink-0">
                <RotateCcw className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <span className="font-semibold text-red-200 text-sm block">
                  {statusFilter === 'returned_and_cancelled'
                    ? 'Returned & Cancelled Orders Section'
                    : statusFilter === 'returned'
                      ? 'Returned Orders Section (Courier RTO)'
                      : 'Cancelled Orders Section'}
                </span>
                <p className="text-[11px] text-red-300/70 mt-0.5">
                  {statusFilter === 'returned'
                    ? 'Parcels that were dispatched with couriers but failed delivery or returned to merchant.'
                    : statusFilter === 'cancelled'
                      ? 'Orders cancelled before delivery (patron request, phone unreachable, or unverified).'
                      : 'Viewing all unfulfilled orders: courier returns and cancelled orders.'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <span className="px-2.5 py-1 bg-red-950 text-red-300 border border-red-800/50 rounded-xs text-[11px] font-mono font-semibold">
                {filteredOrders.length} {filteredOrders.length === 1 ? 'Order' : 'Orders'}
              </span>
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className="px-2.5 py-1 bg-[#222] hover:bg-[#2A2A2A] text-paper/70 hover:text-paper rounded-xs text-[11px] border border-white/10 transition-colors"
              >
                Clear Filter
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-paper/60 px-1">
          <span>Showing {filteredOrders.length} of {orders.length} orders</span>
          <span className="text-[11px]">Real-time sync with patron parcel tracking</span>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-[#171717] border border-white/10 p-12 text-center rounded-xs space-y-3">
            <Package className="w-10 h-10 text-paper/30 mx-auto" />
            <h3 className="font-serif text-lg text-paper">No Orders Match Filter Criteria</h3>
            <p className="text-xs text-paper/50 max-w-sm mx-auto">
              {statusFilter === 'returned_and_cancelled'
                ? 'No returned or cancelled orders found in system.'
                : statusFilter === 'returned'
                  ? 'No orders are currently marked as returned. All parcels with couriers are in transit or delivered.'
                  : statusFilter === 'cancelled'
                    ? 'No cancelled orders found in this view.'
                    : 'Try adjusting your search query or reset status filters to view all orders.'}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const statusConfig = (STATUS_CONFIG as Record<string, typeof STATUS_CONFIG['pending']>)[order.status] || STATUS_CONFIG.pending;
            const isEditingConsignment = editingConsignmentOrderId === order.orderId;

            return (
              <div
                key={order.orderId}
                className="bg-[#171717] border border-white/10 hover:border-gold/40 transition-colors p-5 sm:p-6 rounded-xs space-y-5"
              >
                {/* Order Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="font-mono text-base text-gold font-bold tracking-wider">
                      {order.orderId}
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-2.5 py-1 rounded-xs text-[11px] font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                    >
                      {statusConfig.label}
                    </span>

                    {/* Region Pill */}
                    <span className="text-[11px] px-2 py-0.5 bg-[#222222] text-paper/70 rounded-xs border border-white/5">
                      {order.customer.district}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-paper/50">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}</span>
                  </div>
                </div>

                {/* Main 3-Column Content */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-xs">
                  {/* Left: Customer & Address */}
                  <div className="md:col-span-4 space-y-2 bg-[#1C1C1C] p-3.5 rounded-xs border border-white/5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase font-semibold text-paper/50 tracking-wider">
                        Recipient Information
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyOrderInfo(order)}
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs text-[10px] font-medium tracking-wide transition-all border cursor-pointer shrink-0 ${copiedOrderId === order.orderId
                          ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50 shadow-xs'
                          : 'bg-gold/10 hover:bg-gold/20 text-gold-light hover:text-gold border-gold/30 hover:border-gold/50'
                          }`}
                        title="Copy Customer Name, Phone, Address & Total COD Collection to clipboard"
                        aria-label="Copy Delivery & COD info to clipboard"
                      >
                        {copiedOrderId === order.orderId ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="font-semibold text-emerald-300">Copied!</span>
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
                      <strong className="text-sm font-serif text-paper block">
                        {order.customer.fullName}
                      </strong>
                      <a
                        href={`tel:${order.customer.phone}`}
                        className="text-gold-light hover:underline font-mono text-xs flex items-center gap-1 mt-0.5"
                      >
                        <Phone className="w-3 h-3 text-gold" />
                        <span>{order.customer.phone}</span>
                      </a>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-paper/40 block">Address:</span>
                      <p className="text-paper/80 leading-relaxed mt-0.5">
                        {order.customer.address}, <strong className="text-gold-light">{order.customer.district}</strong>
                      </p>
                    </div>

                    {order.customer.giftNote && (
                      <div className="pt-2 border-t border-white/10">
                        <span className="text-[10px] uppercase text-gold/70 block font-medium">Gift Note:</span>
                        <p className="italic text-paper/70 mt-0.5 bg-black/30 p-2 rounded-xs">
                          "{order.customer.giftNote}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Middle: Items List */}
                  <div className="md:col-span-4 space-y-2.5 bg-[#1C1C1C] p-3.5 rounded-xs border border-white/5">
                    <span className="text-[10px] uppercase font-semibold text-paper/50 tracking-wider block">
                      Package Items ({order.items.reduce((s, i) => s + i.quantity, 0)})
                    </span>
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
                                  <span className="font-medium text-paper text-xs line-clamp-1 block">
                                    {item.product.name}
                                  </span>
                                  <div className="text-[10px] text-paper/50 flex items-center gap-1.5 flex-wrap">
                                    <span
                                      className="w-2 h-2 rounded-full border border-black/30"
                                      style={{ backgroundColor: item.selectedColor.hex }}
                                    />
                                    <span>{item.selectedColor.name}</span>
                                    {item.selectedSize && <span>· {item.selectedSize}</span>}
                                    <span className="font-semibold text-paper/90">· Qty: {item.quantity}</span>
                                    {!isEditingThis && (
                                      <button
                                        type="button"
                                        onClick={() => handleStartEditQuantity(order, item, idx)}
                                        className="text-[10px] text-gold hover:text-gold-light hover:underline flex items-center gap-0.5 ml-1 font-semibold transition-colors"
                                        title="Change ordered quantity"
                                      >
                                        <Edit2 className="w-2.5 h-2.5" />
                                        <span>Edit Qty</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <span className="font-semibold text-gold-light tabular-nums shrink-0 text-xs">
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
                                      onClick={() => handleStepQuantity(-1)}
                                      disabled={editingItemQuantity.quantity <= 1}
                                      className="px-2 py-1 text-paper hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                      aria-label="Decrease quantity"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <input
                                      type="number"
                                      min={1}
                                      max={99}
                                      value={editingItemQuantity.quantity}
                                      onChange={(e) => handleDirectQuantityChange(parseInt(e.target.value) || 1)}
                                      className="w-12 text-center bg-transparent text-paper font-bold text-xs focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleStepQuantity(1)}
                                      className="px-2 py-1 text-paper hover:bg-white/10 transition-colors"
                                      aria-label="Increase quantity"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                                {/* Summary preview with Delivery Fee calculation */}
                                {(() => {
                                  const districtFee = getDistrictDeliveryFee(order.customer.district || '');
                                  const previewSubtotal = item.product.price * editingItemQuantity.quantity;
                                  const ratio = (order.subtotal > 0 && typeof order.discountAmount === 'number' && order.discountAmount > 0)
                                    ? (order.discountAmount / order.subtotal)
                                    : 0;
                                  const previewDiscount = ratio > 0 ? Math.round(previewSubtotal * ratio * 100) / 100 : 0;
                                  const previewGrandTotal = Math.max(
                                    0,
                                    Math.round((previewSubtotal - previewDiscount + editingItemQuantity.shippingFee) * 100) / 100
                                  );

                                  return (
                                    <div className="bg-[#181818] p-2.5 rounded-xs space-y-1.5 text-[11px] border border-white/5">
                                      <div className="flex justify-between text-paper/70">
                                        <span>Item Subtotal ({editingItemQuantity.quantity} × ৳{formatPrice(item.product.price)}):</span>
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

                                      {/* Delivery Charge in Quantity Editor */}
                                      <div className="flex justify-between items-center text-paper/70 pt-1 border-t border-white/5">
                                        <span className="flex items-center gap-1">
                                          <Truck className="w-3 h-3 text-paper/40" />
                                          <span>Delivery ({order.customer.district || 'Standard'}):</span>
                                        </span>
                                        <div className="flex items-center gap-1">
                                          <button
                                            type="button"
                                            onClick={() => setEditingItemQuantity({ ...editingItemQuantity, shippingFee: 0 })}
                                            className={`px-1.5 py-0.5 text-[10px] rounded-xs font-medium transition-colors ${editingItemQuantity.shippingFee === 0
                                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                              : 'bg-white/5 text-paper/50 hover:text-paper'
                                              }`}
                                          >
                                            Free (৳0)
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setEditingItemQuantity({ ...editingItemQuantity, shippingFee: districtFee })}
                                            className={`px-1.5 py-0.5 text-[10px] rounded-xs font-medium transition-colors ${editingItemQuantity.shippingFee === districtFee
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
                                    onClick={() => setEditingItemQuantity(null)}
                                    className="px-2.5 py-1 text-[11px] text-paper/50 hover:text-paper rounded-xs transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveQuantity(order.orderId, item.id || editingItemQuantity.itemId)}
                                    disabled={isSavingQuantity}
                                    className="px-3 py-1 bg-gold hover:bg-gold-light text-ink font-semibold text-[11px] rounded-xs uppercase tracking-wider flex items-center gap-1 shadow-xs transition-all disabled:opacity-50"
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

                    <div className="border-t border-white/10 pt-2.5 space-y-1.5 text-xs">
                      {/* Subtotal */}
                      <div className="flex items-center justify-between text-paper/60 text-[11px]">
                        <span>Subtotal:</span>
                        <span className="font-semibold text-paper/80 tabular-nums">৳{formatPrice(order.subtotal)}</span>
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

                      {/* Delivery Charge / Shipping Fee */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-paper/60 flex items-center gap-1 text-[11px]">
                          <Truck className="w-3 h-3 text-paper/40" />
                          <span>Delivery Charge {order.customer.district ? `(${order.customer.district})` : ''}:</span>
                        </span>

                        {editingOrderShipping?.orderId === order.orderId ? (
                          <div className="flex items-center gap-1.5 flex-wrap justify-end">
                            <span className="text-gold font-bold text-xs">৳</span>
                            <input
                              type="number"
                              min={0}
                              value={editingOrderShipping.fee}
                              onChange={(e) =>
                                setEditingOrderShipping({
                                  ...editingOrderShipping,
                                  fee: Math.max(0, parseInt(e.target.value) || 0),
                                })
                              }
                              className="w-14 px-1.5 py-0.5 bg-[#222] border border-white/20 rounded-xs text-xs font-bold text-paper text-right"
                            />
                            {/* Preset Buttons */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setEditingOrderShipping({ ...editingOrderShipping, fee: 0 })}
                                className={`px-1.5 py-0.5 text-[9px] rounded-xs font-medium ${editingOrderShipping.fee === 0
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-white/5 text-paper/50 hover:text-paper'
                                  }`}
                              >
                                Free
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingOrderShipping({ ...editingOrderShipping, fee: 80 })}
                                className={`px-1.5 py-0.5 text-[9px] rounded-xs font-medium ${editingOrderShipping.fee === 80
                                  ? 'bg-gold/20 text-gold border border-gold/40'
                                  : 'bg-white/5 text-paper/50 hover:text-paper'
                                  }`}
                              >
                                ৳80
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingOrderShipping({ ...editingOrderShipping, fee: 130 })}
                                className={`px-1.5 py-0.5 text-[9px] rounded-xs font-medium ${editingOrderShipping.fee === 130
                                  ? 'bg-gold/20 text-gold border border-gold/40'
                                  : 'bg-white/5 text-paper/50 hover:text-paper'
                                  }`}
                              >
                                ৳130
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSaveShippingFee(order.orderId)}
                              disabled={isSavingShipping}
                              className="p-1 bg-gold text-ink rounded-xs hover:bg-gold-light"
                              title="Save Delivery Fee"
                            >
                              {isSavingShipping ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingOrderShipping(null)}
                              className="p-1 text-paper/50 hover:text-paper"
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
                                <span className="text-paper/90 font-medium">৳{formatPrice(order.shippingFee)}</span>
                              )}
                            </span>
                            <button
                              type="button"
                              onClick={() => setEditingOrderShipping({ orderId: order.orderId, fee: order.shippingFee })}
                              className="text-[10px] text-paper/40 hover:text-gold flex items-center gap-0.5"
                              title="Edit delivery charge"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        )}
                      </div>
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
                                setEditingOrderCod({
                                  ...editingOrderCod,
                                  amount: Math.max(0, parseInt(e.target.value) || 0),
                                })
                              }
                              className="w-20 px-1.5 py-0.5 bg-[#222] border border-white/20 rounded-xs text-xs font-bold text-gold text-right"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveCodAmount(order.orderId)}
                              disabled={isSavingCod}
                              className="p-1 bg-gold text-ink rounded-xs hover:bg-gold-light"
                              title="Save custom COD"
                            >
                              {isSavingCod ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingOrderCod(null)}
                              className="p-1 text-paper/50 hover:text-paper"
                              title="Cancel"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <strong className="text-sm font-semibold text-gold tabular-nums">
                              ৳{formatPrice(order.grandTotal)}
                            </strong>
                            <button
                              type="button"
                              onClick={() => setEditingOrderCod({ orderId: order.orderId, amount: order.grandTotal })}
                              className="text-[10px] text-paper/40 hover:text-gold flex items-center gap-0.5"
                              title="Manually adjust COD collection amount"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Courier Assignment & Status Controller */}
                  <div className="md:col-span-4 space-y-3 bg-[#1C1C1C] p-3.5 rounded-xs border border-white/5">
                    <span className="text-[10px] uppercase font-semibold text-paper/50 tracking-wider block">
                      Logistics & Courier Action
                    </span>

                    {/* Consignment Assignment */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-paper/60">Courier Consignment:</span>
                        {!isEditingConsignment && (
                          <button
                            type="button"
                            onClick={() => handleStartEditConsignment(order)}
                            className="text-[10px] text-gold hover:underline flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit ID</span>
                          </button>
                        )}
                      </div>

                      {isEditingConsignment ? (
                        <div className="space-y-2 bg-black/40 p-2 rounded-xs">
                          <select
                            value={courierInput ?? ""}
                            onChange={(e) => setCourierInput(e.target.value as any)}
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
                            onChange={(e) => setConsignmentInput(e.target.value)}
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
                              onClick={() => handleSaveConsignment(order.orderId)}
                              className="px-3 py-1 bg-gold text-ink font-semibold text-[10px] rounded-xs uppercase tracking-wider flex items-center space-x-1"
                            >
                              <Save className="w-3 h-3" />
                              <span>Save</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingConsignmentOrderId(null)}
                              className="px-2 py-1 text-paper/50 hover:text-paper text-[10px]"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2 bg-black/30 rounded-xs flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-paper/40 block">{order.courierPartner || 'Unassigned'}</span>
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
                      <label className="text-[10px] uppercase text-paper/50 tracking-wider block">
                        Advance Fulfillment Stage:
                      </label>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.orderId, e.target.value as OrderStatus)}
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

                    {/* WhatsApp Action */}
                    <a
                      href={generateWhatsAppVerificationLink(order)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xs font-semibold text-[11px] uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-white" />
                      <span>Verify on WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* Bottom Row Actions */}
                <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
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
                          deleteOrder(order.orderId);
                        }
                      }}
                      className="text-paper/30 hover:text-red-400 transition-colors p-1"
                      title="Delete Order Record"
                      aria-label="Delete Order"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center text-xs text-gold-light/60 uppercase tracking-widest">
          Loading Orders Desk...
        </div>
      }
    >
      <AdminOrdersDesk />
    </Suspense>
  );
}
