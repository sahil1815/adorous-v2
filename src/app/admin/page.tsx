'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
  Tag
} from 'lucide-react';

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
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-red-950/60',
    text: 'text-red-300',
    border: 'border-red-600/40',
    step: 0,
  },
};

export default function AdminOrdersPage() {
  const {
    orders,
    updateOrderStatus,
    updateOrderCourier,
    updateInternalNotes,
    deleteOrder,
    resetToSampleOrders,
  } = useOrders();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [editingConsignmentOrderId, setEditingConsignmentOrderId] = useState<string | null>(null);
  const [consignmentInput, setConsignmentInput] = useState('');
  const [courierInput, setCourierInput] = useState<AdminOrder['courierPartner']>('Steadfast Courier');

  // Stats calculation
  const totalOrders = orders.length;
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const packagingCount = orders.filter((o) => o.status === 'packaging').length;
  const courierCount = orders.filter((o) => o.status === 'handed_to_courier').length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.grandTotal, 0);

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
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

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
    let msg = `Hello ${order.customer.fullName}! Greetings from Adorous Fashion Dhaka.\n\n`;
    msg += `We have received your Cash on Delivery order: ${order.orderId}\n`;
    msg += `Items: ${order.items.map((i) => `${i.product.name} (${i.selectedColor.name})`).join(', ')}\n`;
    msg += `Total Amount: ৳${order.grandTotal.toLocaleString('en-US')}\n`;
    msg += `Delivery Address: ${order.customer.address}, ${order.customer.district}\n\n`;
    msg += `Please confirm if this address is correct so we can package and dispatch your order today.`;

    const cleanPhone = order.customer.phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-8">
      {/* Top Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-[#171717] border border-white/10 p-4 rounded-xs space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-paper/50 block font-medium">
            Total Orders
          </span>
          <div className="text-2xl font-serif text-paper font-semibold">{totalOrders}</div>
          <span className="text-[10px] text-paper/40">Logged in System</span>
        </div>

        <div className="bg-[#171717] border border-amber-600/30 p-4 rounded-xs space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-amber-400 block font-medium">
            Pending WhatsApp Call
          </span>
          <div className="text-2xl font-serif text-amber-300 font-semibold">{pendingCount}</div>
          <span className="text-[10px] text-amber-200/50">Needs verification</span>
        </div>

        <div className="bg-[#171717] border border-purple-600/30 p-4 rounded-xs space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-purple-400 block font-medium">
            In Packaging Desk
          </span>
          <div className="text-2xl font-serif text-purple-300 font-semibold">{packagingCount}</div>
          <span className="text-[10px] text-purple-200/50">Inspecting & sealing</span>
        </div>

        <div className="bg-[#171717] border border-emerald-600/30 p-4 rounded-xs space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-emerald-400 block font-medium">
            With Steadfast Courier
          </span>
          <div className="text-2xl font-serif text-emerald-300 font-semibold">{courierCount}</div>
          <span className="text-[10px] text-emerald-200/50">In active delivery</span>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-[#171717] border border-gold/30 p-4 rounded-xs space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-gold block font-medium">
            Total Pipeline Value
          </span>
          <div className="text-2xl font-serif text-gold-light font-semibold">
            ৳{totalRevenue.toLocaleString('en-US')}
          </div>
          <span className="text-[10px] text-gold/50">Cash on Delivery</span>
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
              <option value="dhaka">Rajshahi Metro (৳70 / Free)</option>
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
            { id: 'pending', label: 'Pending WhatsApp', count: orders.filter((o) => o.status === 'pending').length },
            { id: 'verified', label: 'Verified', count: orders.filter((o) => o.status === 'verified').length },
            { id: 'packaging', label: 'In Packaging', count: orders.filter((o) => o.status === 'packaging').length },
            { id: 'handed_to_courier', label: 'With Courier', count: orders.filter((o) => o.status === 'handed_to_courier').length },
            { id: 'delivered', label: 'Delivered', count: orders.filter((o) => o.status === 'delivered').length },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setStatusFilter(pill.id)}
              className={`px-3 py-1 rounded-xs text-[11px] transition-colors flex items-center space-x-1.5 ${
                statusFilter === pill.id
                  ? 'bg-gold text-ink font-semibold'
                  : 'bg-[#222222] text-paper/70 hover:text-paper hover:bg-[#2A2A2A]'
              }`}
            >
              <span>{pill.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                statusFilter === pill.id ? 'bg-ink text-gold' : 'bg-black/40 text-paper/60'
              }`}>
                {pill.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-paper/60 px-1">
          <span>Showing {filteredOrders.length} of {orders.length} orders</span>
          <span className="text-[11px]">Real-time sync with patron parcel tracking</span>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-[#171717] border border-white/10 p-12 text-center rounded-xs space-y-3">
            <Package className="w-10 h-10 text-paper/30 mx-auto" />
            <h3 className="font-serif text-lg text-paper">No Orders Match Filter Criteria</h3>
            <p className="text-xs text-paper/50 max-w-sm mx-auto">
              Try adjusting your search query or reset status filters to view all orders.
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const statusConfig = STATUS_CONFIG[order.status];
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
                    <span className="text-[10px] uppercase font-semibold text-paper/50 tracking-wider block">
                      Recipient Information
                    </span>
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
                      {order.items.map((item, idx) => (
                        <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between gap-2">
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <div className="relative w-10 h-12 bg-stone rounded-xs overflow-hidden shrink-0 border border-white/10">
                              <Image
                                src={item.product.featuredImage}
                                alt={item.product.name}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <span className="font-medium text-paper text-xs line-clamp-1 block">
                                {item.product.name}
                              </span>
                              <div className="text-[10px] text-paper/50 flex items-center gap-1.5">
                                <span
                                  className="w-2 h-2 rounded-full border border-black/30"
                                  style={{ backgroundColor: item.selectedColor.hex }}
                                />
                                <span>{item.selectedColor.name}</span>
                                {item.selectedSize && <span>· {item.selectedSize}</span>}
                                <span>· Qty: {item.quantity}</span>
                              </div>
                            </div>
                          </div>
                          <span className="font-semibold text-gold-light tabular-nums shrink-0">
                            ৳{(item.product.price * item.quantity).toLocaleString('en-US')}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-white/10 pt-2 space-y-1 text-xs">
                      {order.couponCode && (
                        <div className="flex items-center justify-between text-[11px] text-emerald-400">
                          <span className="flex items-center space-x-1">
                            <Tag className="w-3 h-3" />
                            <span>Voucher ({order.couponCode}):</span>
                          </span>
                          <span>-৳{(order.discountAmount || 0).toLocaleString('en-US')}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-paper/50">Total COD Collection:</span>
                        <strong className="text-sm font-semibold text-gold tabular-nums">
                          ৳{order.grandTotal.toLocaleString('en-US')}
                        </strong>
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
                            <option value="Steadfast Courier">Steadfast Courier</option>
                            <option value="Pathao Courier">Pathao Courier</option>
                            <option value="RedX">RedX</option>
                            <option value="Paperfly">Paperfly</option>
                          </select>
                          <input
                            type="text"
                            value={consignmentInput}
                            onChange={(e) => setConsignmentInput(e.target.value)}
                            placeholder="e.g. ST-88294102"
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
                            <span className="text-[10px] text-paper/40 block">{order.courierPartner}</span>
                            <span className="font-mono text-xs text-paper font-medium">
                              {order.consignmentId || 'Unassigned (Awaiting pickup)'}
                            </span>
                          </div>
                          {order.consignmentId && (
                            <a
                              href={`https://steadfast.com.bd/t/${order.consignmentId}`}
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
                        <option value="cancelled">Cancelled / Returned</option>
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
