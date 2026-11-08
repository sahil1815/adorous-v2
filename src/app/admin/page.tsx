'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useOrders, AdminOrder, OrderStatus } from '@/context/OrdersContext';
import { Package, RotateCcw } from 'lucide-react';
import { formatPrice } from '@/lib/formatPrice';
import { getAllProducts } from '@/app/actions/productActions';
import { PRODUCTS } from '@/data/catalogue';
import { Product, ProductCategory } from '@/types';
import ChangeOrderedProductModal from './ChangeOrderedProductModal';
import {
  renderWhatsAppVerificationMessage,
  buildWhatsAppChatUrl,
  DEFAULT_WHATSAPP_VERIFICATION_TEMPLATE,
} from '@/lib/whatsappTemplate';
import { getWhatsAppSettings } from '@/app/actions/whatsappSettingsActions';
import OrderStatsHeader from '@/components/admin/orders/OrderStatsHeader';
import OrderFiltersBar from '@/components/admin/orders/OrderFiltersBar';
import OrderCard, { STATUS_CONFIG } from '@/components/admin/orders/OrderCard';
import CustomizeWhatsAppModal from '@/components/admin/orders/CustomizeWhatsAppModal';

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
    discount: p.discount !== null && p.discount !== undefined ? Number(p.discount) : null,
    discountType: p.discountType ?? null,
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
    isHidden: Boolean(p.isHidden),
    seoKeywords:
      typeof p.seoKeywords === 'string'
        ? p.seoKeywords.split(',')
        : Array.isArray(p.seoKeywords)
        ? p.seoKeywords
        : [],
  };
}

function AdminOrdersDesk() {
  const {
    orders,
    updateOrderStatus,
    updateOrderPaymentStatus,
    updateOrderCourier,
    deleteOrder,
    resetToSampleOrders,
    updateOrderItemQuantity,
    updateOrderShippingFee,
    updateOrderTotals,
  } = useOrders();

  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status');
  const queryParam = searchParams.get('search') || searchParams.get('q');

  const [searchQuery, setSearchQuery] = useState(queryParam || '');
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

  useEffect(() => {
    const q = searchParams.get('search') || searchParams.get('q');
    if (q) {
      setSearchQuery(q);
      setStatusFilter('all');
    }
  }, [searchParams]);

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
  const [sendingApiOrderId, setSendingApiOrderId] = useState<string | null>(null);

  // Backend WhatsApp template state
  const [whatsAppTemplate, setWhatsAppTemplate] = useState<string>(DEFAULT_WHATSAPP_VERIFICATION_TEMPLATE);

  // Per-order WhatsApp message customize modal state
  const [customizingWhatsAppOrder, setCustomizingWhatsAppOrder] = useState<AdminOrder | null>(null);
  const [customWhatsAppMessage, setCustomWhatsAppMessage] = useState<string>('');
  const [copiedCustomMessage, setCopiedCustomMessage] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    getWhatsAppSettings()
      .then((data) => {
        if (isMounted && data?.verificationTemplate) {
          setWhatsAppTemplate(data.verificationTemplate);
        }
      })
      .catch((err) => {
        console.warn('Could not load WhatsApp template settings:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenCustomMessageModal = (order: AdminOrder) => {
    const rendered = renderWhatsAppVerificationMessage(whatsAppTemplate, order);
    setCustomWhatsAppMessage(rendered);
    setCustomizingWhatsAppOrder(order);
    setCopiedCustomMessage(false);
  };

  const handleCopyCustomMessage = async () => {
    try {
      await navigator.clipboard.writeText(customWhatsAppMessage);
      setCopiedCustomMessage(true);
      setTimeout(() => setCopiedCustomMessage(false), 2000);
    } catch (err) {
      console.warn('Copy failed', err);
    }
  };

  const handleSendWhatsAppApi = async (orderId: string) => {
    setSendingApiOrderId(orderId);
    try {
      const res = await fetch('/api/whatsapp/send-order-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Automated WhatsApp message successfully delivered via Meta Cloud API!');
        window.location.reload();
      } else {
        alert('Meta API Error: ' + (data.error || 'Failed to send'));
      }
    } catch (err: any) {
      alert('Error: ' + (err?.message || 'Failed'));
    } finally {
      setSendingApiOrderId(null);
    }
  };

  // Available catalogue products for product swapping
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [swappingProductState, setSwappingProductState] = useState<{
    order: AdminOrder;
    item: any;
    index: number;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadProducts() {
      try {
        const serverProducts = await getAllProducts(true);
        if (isMounted && serverProducts && serverProducts.length > 0) {
          setAvailableProducts(serverProducts.map(fromDbProduct));
        } else if (isMounted) {
          setAvailableProducts(PRODUCTS);
        }
      } catch (err) {
        console.warn('Failed to load products from DB, fallback to catalogue:', err);
        if (isMounted) {
          setAvailableProducts(PRODUCTS);
        }
      }
    }
    loadProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleStartEditQuantity = (order: AdminOrder, item: any, index: number) => {
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

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const cleanSearch = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !cleanSearch ||
      order.orderId.toLowerCase().includes(cleanSearch) ||
      order.customer.fullName.toLowerCase().includes(cleanSearch) ||
      order.customer.phone.includes(cleanSearch) ||
      (order.consignmentId && order.consignmentId.toLowerCase().includes(cleanSearch));

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'returned_and_cancelled'
        ? order.status === 'returned' || order.status === 'cancelled'
        : order.status === statusFilter;

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
    const msg = renderWhatsAppVerificationMessage(whatsAppTemplate, order);
    return buildWhatsAppChatUrl(order.customer.phone, msg);
  };

  const handleCopyOrderInfo = async (order: AdminOrder) => {
    const rawAddress = (order.customer.address || '').trim().replace(/[\s,]+$/, '');
    const rawDistrict = (order.customer.district || '').trim();
    let fullAddress = rawAddress;
    if (rawDistrict && !rawAddress.toLowerCase().includes(rawDistrict.toLowerCase())) {
      fullAddress = rawAddress ? `${rawAddress}, ${rawDistrict}` : rawDistrict;
    }

    const isOnline =
      order.paymentMethod?.toLowerCase().includes('online') ||
      order.paymentMethod?.toLowerCase().includes('bkash');
    const codAmount = isOnline ? 0 : (typeof order.codAmount === 'number' ? order.codAmount : (order.grandTotal ?? 0));

    const textToCopy = [
      `Customer Name: ${order.customer.fullName || ''}`,
      `Customer Phone: ${order.customer.phone || ''}`,
      `Address: ${fullAddress}`,
      `Total COD Collection: ৳${formatPrice(codAmount)}${isOnline ? ' (Paid Online - 0 COD)' : ''}`,
      ...(isOnline && order.transactionId ? [`Transaction ID: ${order.transactionId}`] : []),
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
      {/* 1. Operational Stats & Financial Pipeline */}
      <OrderStatsHeader
        orders={orders}
        statusFilter={statusFilter}
        onSelectStatusFilter={setStatusFilter}
      />

      {/* 2. Filter, Search & Status Bar */}
      <OrderFiltersBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        regionFilter={regionFilter}
        onRegionChange={setRegionFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onResetDemo={resetToSampleOrders}
        totalOrdersCount={totalOrders}
        pendingCount={pendingCount}
        verifiedCount={verifiedCount}
        packagingCount={packagingCount}
        courierCount={courierCount}
        deliveredCount={deliveredCount}
        returnedAndCancelledCount={returnedAndCancelledCount}
        returnedCount={returnedCount}
        cancelledCount={cancelledCount}
      />

      {/* 3. Orders List */}
      <div className="space-y-6">
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
                className="px-2.5 py-1 bg-[#222] hover:bg-[#2A2A2A] text-paper/70 hover:text-paper rounded-xs text-[11px] border border-white/10 transition-colors cursor-pointer"
              >
                Clear Filter
              </button>
            </div>
          </div>
        )}

        {/* Counter Summary */}
        <div className="flex items-center justify-between text-xs text-paper/60 px-1">
          <span>
            Showing {filteredOrders.length} of {orders.length} orders
          </span>
          <span className="text-[11px]">Real-time sync with patron parcel tracking</span>
        </div>

        {/* Order Cards */}
        {filteredOrders.length === 0 ? (
          <div className="bg-[#171717] border border-white/10 p-12 text-center rounded-xs space-y-3">
            <Package className="w-10 h-10 text-paper/30 mx-auto" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              No Orders Match Filter Criteria
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
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
          filteredOrders.map((order) => (
            <OrderCard
              key={order.orderId}
              order={order}
              isEditingConsignment={editingConsignmentOrderId === order.orderId}
              onStartEditConsignment={handleStartEditConsignment}
              consignmentInput={consignmentInput}
              onConsignmentInputChange={setConsignmentInput}
              courierInput={courierInput}
              onCourierInputChange={setCourierInput}
              onSaveConsignment={handleSaveConsignment}
              onCancelEditConsignment={() => setEditingConsignmentOrderId(null)}
              editingItemQuantity={editingItemQuantity}
              onStartEditQuantity={handleStartEditQuantity}
              onStepQuantity={handleStepQuantity}
              onDirectQuantityChange={handleDirectQuantityChange}
              onSetEditingShippingInQty={(fee) =>
                editingItemQuantity &&
                setEditingItemQuantity({ ...editingItemQuantity, shippingFee: fee })
              }
              onSaveQuantity={handleSaveQuantity}
              onCancelEditQuantity={() => setEditingItemQuantity(null)}
              isSavingQuantity={isSavingQuantity}
              editingOrderShipping={editingOrderShipping}
              onStartEditShipping={(orderId, fee) =>
                setEditingOrderShipping({ orderId, fee })
              }
              onShippingFeeChange={(fee) =>
                editingOrderShipping &&
                setEditingOrderShipping({ ...editingOrderShipping, fee })
              }
              onSaveShippingFee={handleSaveShippingFee}
              onCancelEditShipping={() => setEditingOrderShipping(null)}
              isSavingShipping={isSavingShipping}
              editingOrderCod={editingOrderCod}
              onStartEditCod={(orderId, amount) =>
                setEditingOrderCod({ orderId, amount })
              }
              onCodAmountChange={(amount) =>
                editingOrderCod &&
                setEditingOrderCod({ ...editingOrderCod, amount })
              }
              onSaveCodAmount={handleSaveCodAmount}
              onCancelEditCod={() => setEditingOrderCod(null)}
              isSavingCod={isSavingCod}
              isCopied={copiedOrderId === order.orderId}
              onCopyOrderInfo={handleCopyOrderInfo}
              onStartSwapProduct={(ord, it, idx) =>
                setSwappingProductState({ order: ord, item: it, index: idx })
              }
              onUpdateStatus={updateOrderStatus}
              onUpdatePaymentStatus={updateOrderPaymentStatus}
              whatsAppLink={generateWhatsAppVerificationLink(order)}
              onOpenCustomWhatsAppModal={handleOpenCustomMessageModal}
              onSendWhatsAppApi={handleSendWhatsAppApi}
              isSendingApi={sendingApiOrderId === order.orderId}
              onDeleteOrder={deleteOrder}
            />
          ))
        )}
      </div>

      {/* Change Ordered Product Modal */}
      {swappingProductState && (
        <ChangeOrderedProductModal
          isOpen={Boolean(swappingProductState)}
          onClose={() => setSwappingProductState(null)}
          order={swappingProductState.order}
          targetItem={swappingProductState.item}
          targetIndex={swappingProductState.index}
          availableProducts={availableProducts.length > 0 ? availableProducts : PRODUCTS}
        />
      )}

      {/* Customize WhatsApp Message Modal */}
      {customizingWhatsAppOrder && (
        <CustomizeWhatsAppModal
          order={customizingWhatsAppOrder}
          message={customWhatsAppMessage}
          onMessageChange={setCustomWhatsAppMessage}
          onClose={() => setCustomizingWhatsAppOrder(null)}
          onCopy={handleCopyCustomMessage}
          copied={copiedCustomMessage}
        />
      )}
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
