'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  getDraftCheckoutsAction,
  deleteDraftCheckoutAction,
  getDraftSignInsAction,
  deleteDraftSignInAction,
  convertDraftCheckoutToOrderAction,
  updateDraftCheckoutStatusAction,
  updateDraftSignInStatusAction,
} from '@/app/actions/draftActions';
import { BANGLADESH_DISTRICTS, getDistrictDeliveryFee } from '@/data/districts';
import { formatPrice } from '@/lib/formatPrice';
import {
  ShoppingBag,
  UserCheck,
  UserX,
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Sparkles,
  ArrowUpRight,
  Tag,
  DollarSign,
  Check,
  RotateCcw,
  FileText,
  X,
  Loader2,
} from 'lucide-react';

export default function AdminDraftsPage() {
  const [activeTab, setActiveTab] = useState<'checkouts' | 'signins'>('checkouts');
  const [draftCheckouts, setDraftCheckouts] = useState<any[]>([]);
  const [draftSignIns, setDraftSignIns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'abandoned' | 'converted'>('all');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Status updating state
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [openStatusMenuId, setOpenStatusMenuId] = useState<string | null>(null);

  // Convert to order modal state
  const [convertingDraft, setConvertingDraft] = useState<any | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [convertModalForm, setConvertModalForm] = useState<{
    fullName: string;
    phone: string;
    email: string;
    district: string;
    address: string;
    shippingFee: number;
    paymentMethod: string;
    internalNotes: string;
  }>({
    fullName: '',
    phone: '',
    email: '',
    district: 'Dhaka (Metro & Greater)',
    address: '',
    shippingFee: 80,
    paymentMethod: 'Cash on Delivery',
    internalNotes: 'Converted from abandoned cart via phone call confirmation.',
  });

  // Success alert/toast state
  const [alertMessage, setAlertMessage] = useState<{
    type: 'success' | 'error';
    text: string;
    orderId?: string;
  } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [checkouts, signins] = await Promise.all([
        getDraftCheckoutsAction(),
        getDraftSignInsAction(),
      ]);
      setDraftCheckouts(checkouts);
      setDraftSignIns(signins);
    } catch (e) {
      console.error('Failed to load drafts', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteCheckout = async (id: string) => {
    if (!confirm('Are you sure you want to remove this draft checkout?')) return;
    setIsDeleting(id);
    await deleteDraftCheckoutAction(id);
    setDraftCheckouts((prev) => prev.filter((d) => d.id !== id));
    setIsDeleting(null);
  };

  const handleDeleteSignIn = async (id: string) => {
    if (!confirm('Are you sure you want to remove this draft lead?')) return;
    setIsDeleting(id);
    await deleteDraftSignInAction(id);
    setDraftSignIns((prev) => prev.filter((d) => d.id !== id));
    setIsDeleting(null);
  };

  const handleOpenConvertModal = (draft: any) => {
    setOpenStatusMenuId(null);
    setConvertingDraft(draft);
    const district = draft.district || 'Dhaka (Metro & Greater)';
    const fee = draft.shippingFee !== undefined && draft.shippingFee !== null && draft.shippingFee > 0
      ? draft.shippingFee
      : getDistrictDeliveryFee(district);

    setConvertModalForm({
      fullName: draft.fullName && draft.fullName !== 'Anonymous Visitor' ? draft.fullName : '',
      phone: draft.phone || '',
      email: draft.email || '',
      district: district,
      address: draft.address || '',
      shippingFee: fee,
      paymentMethod: draft.paymentMethod?.toLowerCase() === 'cod' || !draft.paymentMethod ? 'Cash on Delivery' : draft.paymentMethod,
      internalNotes: 'Converted from abandoned cart via phone call confirmation with customer.',
    });
  };

  const handleDistrictChange = (districtName: string) => {
    const suggestedFee = getDistrictDeliveryFee(districtName);
    setConvertModalForm((prev) => ({
      ...prev,
      district: districtName,
      shippingFee: suggestedFee,
    }));
  };

  const handleConfirmConvertToOrder = async () => {
    if (!convertingDraft) return;
    setIsConverting(true);
    setAlertMessage(null);
    try {
      const res = await convertDraftCheckoutToOrderAction(convertingDraft.id, {
        fullName: convertModalForm.fullName,
        phone: convertModalForm.phone,
        email: convertModalForm.email,
        district: convertModalForm.district,
        address: convertModalForm.address,
        shippingFee: convertModalForm.shippingFee,
        paymentMethod: convertModalForm.paymentMethod,
        internalNotes: convertModalForm.internalNotes,
      });

      if (res.success && res.orderId) {
        setDraftCheckouts((prev) =>
          prev.map((d) =>
            d.id === convertingDraft.id
              ? {
                  ...d,
                  status: 'converted',
                  convertedOrderId: res.orderId,
                  fullName: convertModalForm.fullName || d.fullName,
                  phone: convertModalForm.phone || d.phone,
                  email: convertModalForm.email || d.email,
                  address: convertModalForm.address || d.address,
                  district: convertModalForm.district || d.district,
                  shippingFee: convertModalForm.shippingFee,
                  grandTotal: Math.max(0, Math.round(((d.subtotal || 0) - (d.discountAmount || 0) + convertModalForm.shippingFee) * 100) / 100),
                }
              : d
          )
        );
        setAlertMessage({
          type: 'success',
          text: `Success! Draft checkout converted into official order #${res.orderId}.`,
          orderId: res.orderId,
        });
        setConvertingDraft(null);
      } else {
        setAlertMessage({
          type: 'error',
          text: res.error || 'Failed to convert draft checkout to order. Please try again.',
        });
      }
    } catch (e: any) {
      console.error('Conversion failed', e);
      setAlertMessage({
        type: 'error',
        text: e?.message || 'Unexpected error converting draft.',
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleQuickToggleStatus = async (draftId: string, targetStatus: 'abandoned' | 'converted') => {
    setOpenStatusMenuId(null);
    setUpdatingStatusId(draftId);
    setAlertMessage(null);
    try {
      const res = await updateDraftCheckoutStatusAction(draftId, targetStatus);
      if (res.success) {
        setDraftCheckouts((prev) =>
          prev.map((d) =>
            d.id === draftId
              ? {
                  ...d,
                  status: targetStatus,
                  convertedOrderId: targetStatus === 'abandoned' ? null : d.convertedOrderId,
                }
              : d
          )
        );
        setAlertMessage({
          type: 'success',
          text: `Draft status updated to "${targetStatus === 'converted' ? 'Converted' : 'Abandoned Cart'}".`,
        });
      } else {
        setAlertMessage({
          type: 'error',
          text: res.error || 'Failed to update status.',
        });
      }
    } catch (e: any) {
      console.error('Failed to update draft checkout status', e);
      setAlertMessage({
        type: 'error',
        text: e?.message || 'Error updating status',
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleToggleSignInStatus = async (id: string, targetStatus: 'abandoned' | 'converted') => {
    setUpdatingStatusId(id);
    setAlertMessage(null);
    try {
      const res = await updateDraftSignInStatusAction(id, targetStatus);
      if (res.success) {
        setDraftSignIns((prev) =>
          prev.map((d) => (d.id === id ? { ...d, status: targetStatus } : d))
        );
        setAlertMessage({
          type: 'success',
          text: `Lead status updated to "${targetStatus === 'converted' ? 'Completed' : 'Abandoned'}".`,
        });
      } else {
        setAlertMessage({
          type: 'error',
          text: res.error || 'Failed to update lead status.',
        });
      }
    } catch (e: any) {
      console.error('Failed to update lead status', e);
      setAlertMessage({
        type: 'error',
        text: e?.message || 'Error updating status',
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Metrics
  const totalAbandonedCheckouts = draftCheckouts.filter((d) => d.status === 'abandoned').length;
  const totalConvertedCheckouts = draftCheckouts.filter((d) => d.status === 'converted').length;
  const potentialRecoverableRevenue = draftCheckouts
    .filter((d) => d.status === 'abandoned')
    .reduce((sum, d) => sum + (d.grandTotal || 0), 0);
  const totalIncompleteSignIns = draftSignIns.filter((d) => d.status === 'abandoned').length;

  // Filtered checkouts
  const filteredCheckouts = useMemo(() => {
    return draftCheckouts.filter((d) => {
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchName = d.fullName?.toLowerCase().includes(q);
      const matchPhone = d.phone?.toLowerCase().includes(q);
      const matchDistrict = d.district?.toLowerCase().includes(q);
      const matchProduct = d.cartItems?.some((item: any) =>
        item.product?.name?.toLowerCase().includes(q)
      );
      const matchOrder = d.convertedOrderId?.toLowerCase().includes(q);
      return matchName || matchPhone || matchDistrict || matchProduct || matchOrder;
    });
  }, [draftCheckouts, searchQuery, statusFilter]);

  // Filtered signins
  const filteredSignIns = useMemo(() => {
    return draftSignIns.filter((d) => {
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchName = d.fullName?.toLowerCase().includes(q);
      const matchPhone = d.phone?.toLowerCase().includes(q);
      const matchEmail = d.email?.toLowerCase().includes(q);
      const matchDistrict = d.district?.toLowerCase().includes(q);
      return matchName || matchPhone || matchEmail || matchDistrict;
    });
  }, [draftSignIns, searchQuery, statusFilter]);

  // Generate WhatsApp Recovery URL
  const getWhatsAppRecoveryUrl = (draft: any) => {
    let cleanPhone = (draft.phone || '').replace(/\D/g, '');
    if (cleanPhone.startsWith('880')) {
      // good
    } else if (cleanPhone.startsWith('0')) {
      cleanPhone = '880' + cleanPhone.slice(1);
    } else if (cleanPhone.length === 10) {
      cleanPhone = '880' + cleanPhone;
    }

    const itemsSummary = (draft.cartItems || [])
      .map((i: any) => `${i.quantity}x ${i.product?.name || 'Jewelry item'}`)
      .join(', ');

    const name = draft.fullName && draft.fullName !== 'Anonymous Visitor' ? draft.fullName : 'Customer';

    const message = `Hello ${name}, Assalamu Alaikum from Adorous Fashion!\n\nWe noticed you were selecting:\n${itemsSummary || 'luxury churi & fine jewelry'}\nTotal: ৳${formatPrice(draft.grandTotal)}\n\nWould you like any assistance completing your Cash on Delivery order, or would you like our team to confirm and dispatch this for you? Please let us know!`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const getWhatsAppLeadUrl = (lead: any) => {
    let cleanPhone = (lead.phone || '').replace(/\D/g, '');
    if (cleanPhone.startsWith('880')) {
      // good
    } else if (cleanPhone.startsWith('0')) {
      cleanPhone = '880' + cleanPhone.slice(1);
    } else if (cleanPhone.length === 10) {
      cleanPhone = '880' + cleanPhone;
    }

    const name = lead.fullName && lead.fullName !== 'Anonymous Visitor' ? lead.fullName : 'there';
    const message = `Hello ${name}, Assalamu Alaikum from Adorous Fashion!\n\nWe noticed you visited our account portal. Please let us know if you need any assistance discovering our latest luxury drops or placing an order.`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert / Notification Banner */}
      {alertMessage && (
        <div
          className={`p-4 rounded-xs border text-xs flex items-center justify-between gap-3 shadow-sm ${
            alertMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
              : 'bg-red-950/40 border-red-500/50 text-red-200'
          }`}
        >
          <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
            {alertMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span className="font-medium">{alertMessage.text}</span>
            {alertMessage.orderId && (
              <Link
                href={`/admin?search=${encodeURIComponent(alertMessage.orderId)}`}
                className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold border border-emerald-500/40 ml-1 transition-colors"
              >
                <span>Open in Orders Dashboard</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            )}
          </div>
          <button
            onClick={() => setAlertMessage(null)}
            className="text-paper/40 hover:text-paper p-1 transition-colors shrink-0"
            aria-label="Dismiss message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-serif text-2xl sm:text-3xl text-paper font-semibold tracking-wide">
              Drafts & Abandoned Leads
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Live Recovery
            </span>
          </div>
          <p className="text-xs sm:text-sm text-paper/60 mt-1">
            Real-time abandoned checkouts and incomplete sign-up forms with 1-click WhatsApp recovery
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="inline-flex items-center space-x-2 px-3.5 py-2 bg-[#1C1C1C] hover:bg-[#252525] border border-gold/30 hover:border-gold text-gold rounded-xs text-xs font-medium transition-all shadow-xs disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Leads</span>
        </button>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div className="bg-[#141414] border border-amber-500/20 p-4 rounded-xs shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-paper/60">
              Abandoned Checkouts
            </span>
            <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-xs">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-amber-400">
              {totalAbandonedCheckouts}
            </span>
            <span className="text-[11px] text-paper/50">waiting recovery</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#141414] border border-gold/25 p-4 rounded-xs shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-paper/60">
              Recoverable Pipeline
            </span>
            <div className="p-1.5 bg-gold/10 text-gold rounded-xs">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-gold">
              ৳{potentialRecoverableRevenue.toLocaleString('en-US')}
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#141414] border border-emerald-500/20 p-4 rounded-xs shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-paper/60">
              Converted Orders
            </span>
            <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-emerald-400">
              {totalConvertedCheckouts}
            </span>
            <span className="text-[11px] text-emerald-400/80">purchased</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#141414] border border-blue-500/20 p-4 rounded-xs shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-paper/60">
              Incomplete Sign-ins
            </span>
            <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-xs">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-blue-400">
              {totalIncompleteSignIns}
            </span>
            <span className="text-[11px] text-paper/50">warm leads</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('checkouts')}
          className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-xs transition-all ${
            activeTab === 'checkouts'
              ? 'bg-gold text-ink shadow-sm'
              : 'text-paper/70 hover:text-gold hover:bg-[#1A1A1A]'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Draft Checkouts</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
            activeTab === 'checkouts' ? 'bg-ink text-gold' : 'bg-gold/20 text-gold'
          }`}>
            {draftCheckouts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('signins')}
          className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-xs transition-all ${
            activeTab === 'signins'
              ? 'bg-gold text-ink shadow-sm'
              : 'text-paper/70 hover:text-gold hover:bg-[#1A1A1A]'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Draft Sign-ins & Registrations</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
            activeTab === 'signins' ? 'bg-ink text-gold' : 'bg-gold/20 text-gold'
          }`}>
            {draftSignIns.length}
          </span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#141414] p-3 rounded-xs border border-white/10">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-paper/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'checkouts'
                ? 'Search customer name, phone, district, or product...'
                : 'Search lead name, phone, email, or district...'
            }
            className="w-full bg-[#1C1C1C] border border-white/10 pl-9 pr-4 py-1.5 text-xs text-paper placeholder-paper/40 rounded-xs focus:outline-none focus:border-gold/50"
          />
        </div>

        <div className="flex items-center space-x-2 shrink-0 text-xs">
          <span className="text-paper/50 text-[11px] hidden sm:inline">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-[#1C1C1C] border border-white/10 text-paper px-3 py-1.5 rounded-xs text-xs focus:outline-none focus:border-gold/50"
          >
            <option value="all">All Records</option>
            <option value="abandoned">Abandoned Only</option>
            <option value="converted">Converted Only</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'checkouts' ? (
        // DRAFT CHECKOUTS LIST
        <div className="space-y-3">
          {filteredCheckouts.length === 0 ? (
            <div className="bg-[#141414] border border-white/10 rounded-xs p-12 text-center space-y-3">
              <ShoppingBag className="w-10 h-10 text-paper/30 mx-auto" />
              <h3 className="font-serif text-lg text-paper font-semibold">No Draft Checkouts Found</h3>
              <p className="text-xs text-paper/50 max-w-sm mx-auto">
                When customers begin typing on the checkout page but leave before completing, their carts and contact details will appear here automatically.
              </p>
            </div>
          ) : (
            filteredCheckouts.map((draft) => {
              const isConverted = draft.status === 'converted';
              const hasPhone = Boolean(draft.phone && draft.phone.trim().length >= 5);

              return (
                <div
                  key={draft.id}
                  className={`bg-[#141414] border rounded-xs p-4 sm:p-5 transition-all space-y-4 ${
                    isConverted
                      ? 'border-emerald-500/20 hover:border-emerald-500/40 bg-emerald-950/10'
                      : 'border-white/10 hover:border-gold/40'
                  }`}
                >
                  {/* Top Bar: Customer & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isConverted
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {draft.fullName?.[0]?.toUpperCase() || 'A'}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-serif text-base text-paper font-semibold">
                            {draft.fullName}
                          </span>
                          {/* Status Badge with Interactive Dropdown */}
                          <div className="relative inline-block">
                            <button
                              type="button"
                              onClick={() => setOpenStatusMenuId(openStatusMenuId === draft.id ? null : draft.id)}
                              disabled={updatingStatusId === draft.id}
                              className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all cursor-pointer shadow-xs ${
                                isConverted
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/30'
                              }`}
                              title="Click to toggle status or convert to order"
                            >
                              {updatingStatusId === draft.id ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : isConverted ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <AlertTriangle className="w-3 h-3 text-amber-400" />
                              )}
                              <span>
                                {isConverted
                                  ? `Converted ${draft.convertedOrderId ? `(#${draft.convertedOrderId})` : ''}`
                                  : 'Abandoned Cart'}
                              </span>
                              <ChevronDown className="w-2.5 h-2.5 opacity-70" />
                            </button>

                            {/* Dropdown Menu */}
                            {openStatusMenuId === draft.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-20"
                                  onClick={() => setOpenStatusMenuId(null)}
                                />
                                <div className="absolute left-0 mt-1.5 w-64 bg-[#1C1C1C] border border-white/15 rounded-xs shadow-2xl z-30 py-1 text-xs divide-y divide-white/5 animate-in fade-in slide-in-from-top-1 duration-150">
                                  {!isConverted ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleOpenConvertModal(draft)}
                                        className="w-full text-left px-3.5 py-2.5 text-gold hover:bg-white/5 flex items-start space-x-2.5 font-medium transition-colors cursor-pointer"
                                      >
                                        <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                                        <div>
                                          <span className="block font-semibold">Convert to Official Order</span>
                                          <span className="text-[10px] text-paper/50 block font-normal">Creates Order ID & deducts stock</span>
                                        </div>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleQuickToggleStatus(draft.id, 'converted')}
                                        className="w-full text-left px-3.5 py-2.5 text-paper/90 hover:bg-white/5 flex items-start space-x-2.5 transition-colors cursor-pointer"
                                      >
                                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                        <div>
                                          <span className="block font-medium">Mark as Converted Only</span>
                                          <span className="text-[10px] text-paper/50 block">Status change without new order</span>
                                        </div>
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      {draft.convertedOrderId && (
                                        <Link
                                          href={`/admin?search=${encodeURIComponent(draft.convertedOrderId)}`}
                                          className="w-full text-left px-3.5 py-2.5 text-emerald-300 hover:bg-white/5 flex items-start space-x-2.5 font-medium transition-colors"
                                          onClick={() => setOpenStatusMenuId(null)}
                                        >
                                          <ExternalLink className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                          <div>
                                            <span className="block font-semibold">View in Orders Dashboard</span>
                                            <span className="text-[10px] text-paper/50 block">Order #{draft.convertedOrderId}</span>
                                          </div>
                                        </Link>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => handleQuickToggleStatus(draft.id, 'abandoned')}
                                        className="w-full text-left px-3.5 py-2.5 text-amber-300 hover:bg-white/5 flex items-start space-x-2.5 transition-colors cursor-pointer"
                                      >
                                        <RotateCcw className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                        <div>
                                          <span className="block font-medium">Revert to Abandoned Cart</span>
                                          <span className="text-[10px] text-paper/50 block">Mark as unrecovered checkout</span>
                                        </div>
                                      </button>
                                    </>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        <span className="text-[11px] text-paper/50 flex items-center space-x-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>Last active: {formatRelativeTime(draft.updatedAt)}</span>
                          <span>•</span>
                          <span>{new Date(draft.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </span>
                      </div>
                    </div>

                    {/* Total Value */}
                    <div className="sm:text-right mt-1 sm:mt-0">
                      <span className="text-[11px] text-paper/50 block">Potential Value</span>
                      <span className="font-serif text-lg font-bold text-gold">
                        ৳{formatPrice(draft.grandTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Middle Section: Contact & Cart Items */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Customer Info Left */}
                    <div className="lg:col-span-4 space-y-2 text-xs">
                      <span className="text-[10px] uppercase tracking-wider text-paper/40 font-semibold block">
                        Customer Coordinates
                      </span>

                      {draft.phone ? (
                        <div className="flex items-center space-x-2 text-paper">
                          <Phone className="w-3.5 h-3.5 text-gold shrink-0" />
                          <a
                            href={`tel:${draft.phone}`}
                            className="hover:text-gold transition-colors font-medium tabular-nums underline underline-offset-2"
                          >
                            {draft.phone}
                          </a>
                        </div>
                      ) : (
                        <div className="text-paper/40 italic">No phone entered yet</div>
                      )}

                      {draft.email && (
                        <div className="flex items-center space-x-2 text-paper/80">
                          <Mail className="w-3.5 h-3.5 text-paper/40 shrink-0" />
                          <span className="truncate">{draft.email}</span>
                        </div>
                      )}

                      {(draft.district || draft.address) && (
                        <div className="flex items-start space-x-2 text-paper/80 pt-1">
                          <MapPin className="w-3.5 h-3.5 text-paper/40 shrink-0 mt-0.5" />
                          <div>
                            {draft.district && (
                              <span className="font-semibold text-gold-light block">
                                {draft.district}
                              </span>
                            )}
                            {draft.address && (
                              <span className="text-paper/60 text-[11px] block leading-snug">
                                {draft.address}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {draft.giftNote && (
                        <div className="bg-[#1C1C1C] p-2 rounded-xs border border-white/5 text-[11px] text-paper/70 italic">
                          "{draft.giftNote}"
                        </div>
                      )}
                    </div>

                    {/* Cart Items Preview Right */}
                    <div className="lg:col-span-8 space-y-2">
                      <span className="text-[10px] uppercase tracking-wider text-paper/40 font-semibold block">
                        Selected Products ({draft.cartItems?.length || 0})
                      </span>

                      <div className="flex flex-wrap gap-2.5">
                        {draft.cartItems?.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center space-x-2.5 bg-[#1C1C1C] border border-white/5 p-2 rounded-xs max-w-sm"
                          >
                            <div className="w-12 h-14 bg-stone border border-line rounded-xs relative overflow-hidden shrink-0">
                              {item.product?.featuredImage ? (
                                <img
                                  src={item.product.featuredImage}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-paper/30">
                                  <ShoppingBag className="w-4 h-4" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 text-xs">
                              <span className="font-medium text-paper block truncate">
                                {item.product?.name}
                              </span>
                              <div className="flex items-center space-x-1.5 text-[11px] text-paper/50 mt-0.5">
                                {item.selectedColor && (
                                  <span className="flex items-center gap-1">
                                    <span
                                      className="w-2 h-2 rounded-full inline-block border border-white/20"
                                      style={{ backgroundColor: item.selectedColor.hex }}
                                    />
                                    <span>{item.selectedColor.name}</span>
                                  </span>
                                )}
                                {item.selectedSize && <span>• {item.selectedSize}</span>}
                                <span>• Qty: {item.quantity}</span>
                              </div>
                              <span className="text-gold font-medium text-[11px] block mt-0.5">
                                ৳{formatPrice(item.product?.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs">
                    <div className="text-[11px] text-paper/40">
                      Payment intent: <strong className="text-paper/70 font-medium">{draft.paymentMethod}</strong>
                      {draft.couponCode && (
                        <span className="ml-2 inline-flex items-center gap-1 text-gold-light">
                          <Tag className="w-3 h-3" />
                          <span>Coupon: {draft.couponCode}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Convert / Status Action Buttons */}
                      {!isConverted ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenConvertModal(draft)}
                            disabled={updatingStatusId === draft.id}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-gold hover:bg-gold-light text-ink font-semibold rounded-xs transition-colors shadow-xs text-xs disabled:opacity-50 cursor-pointer"
                            title="Create an official order from this draft checkout and mark converted"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Convert to Order</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleQuickToggleStatus(draft.id, 'converted')}
                            disabled={updatingStatusId === draft.id}
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-[#222222] hover:bg-[#2A2A2A] border border-white/10 hover:border-emerald-500/40 text-paper/80 hover:text-emerald-300 rounded-xs transition-colors text-xs disabled:opacity-50 cursor-pointer"
                            title="Mark as converted without creating a new order"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="hidden sm:inline">Mark Converted</span>
                          </button>
                        </>
                      ) : (
                        <>
                          {draft.convertedOrderId && (
                            <Link
                              href={`/admin?search=${encodeURIComponent(draft.convertedOrderId)}`}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-500 text-white font-medium rounded-xs text-xs transition-colors shadow-xs"
                              title={`Open Order #${draft.convertedOrderId} in Admin Orders`}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Order #{draft.convertedOrderId}</span>
                            </Link>
                          )}

                          <button
                            type="button"
                            onClick={() => handleQuickToggleStatus(draft.id, 'abandoned')}
                            disabled={updatingStatusId === draft.id}
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-[#222222] hover:bg-[#2A2A2A] border border-white/10 hover:border-amber-500/40 text-paper/70 hover:text-amber-300 rounded-xs transition-colors text-xs disabled:opacity-50 cursor-pointer"
                            title="Revert back to abandoned cart status"
                          >
                            <RotateCcw className="w-3 h-3 text-amber-400" />
                            <span className="hidden sm:inline">Revert</span>
                          </button>
                        </>
                      )}

                      {/* WhatsApp 1-Click Recovery */}
                      {hasPhone && !isConverted && (
                        <a
                          href={getWhatsAppRecoveryUrl(draft)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xs transition-colors shadow-xs"
                          title="Open WhatsApp chat with pre-filled recovery message"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp Recovery</span>
                          <ArrowUpRight className="w-3 h-3 opacity-70" />
                        </a>
                      )}

                      {/* Direct Call */}
                      {hasPhone && (
                        <a
                          href={`tel:${draft.phone}`}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-[#222222] hover:bg-[#2A2A2A] border border-white/10 text-paper rounded-xs transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-gold" />
                          <span className="hidden sm:inline">Call</span>
                        </a>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteCheckout(draft.id)}
                        disabled={isDeleting === draft.id}
                        className="p-1.5 bg-[#222222] hover:bg-red-950/60 hover:text-red-300 border border-white/10 hover:border-red-800/40 rounded-xs text-paper/50 transition-colors disabled:opacity-50 cursor-pointer"
                        title="Delete draft"
                        aria-label="Delete draft"
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
      ) : (
        // DRAFT SIGN-INS LIST
        <div className="space-y-3">
          {filteredSignIns.length === 0 ? (
            <div className="bg-[#141414] border border-white/10 rounded-xs p-12 text-center space-y-3">
              <UserCheck className="w-10 h-10 text-paper/30 mx-auto" />
              <h3 className="font-serif text-lg text-paper font-semibold">No Draft Sign-ins Recorded</h3>
              <p className="text-xs text-paper/50 max-w-sm mx-auto">
                When prospective customers start creating an account or signing in but do not finish, their leads will appear here for proactive concierge support.
              </p>
            </div>
          ) : (
            filteredSignIns.map((lead) => {
              const isConverted = lead.status === 'converted';
              const hasPhone = Boolean(lead.phone && lead.phone.trim().length >= 5);

              return (
                <div
                  key={lead.id}
                  className={`bg-[#141414] border rounded-xs p-4 sm:p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isConverted
                      ? 'border-emerald-500/20 bg-emerald-950/10'
                      : 'border-white/10 hover:border-gold/40'
                  }`}
                >
                  <div className="flex items-start space-x-3.5">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      lead.type === 'register'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-gold/20 text-gold border border-gold/30'
                    }`}>
                      {lead.fullName?.[0]?.toUpperCase() || 'L'}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-serif text-base text-paper font-semibold">
                          {lead.fullName}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-paper/70 uppercase tracking-wider">
                          {lead.type === 'register' ? 'Registration Lead' : 'Sign-in Lead'}
                        </span>
                        {isConverted && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Completed
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-paper/70">
                        {lead.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gold" />
                            <a href={`tel:${lead.phone}`} className="hover:text-gold tabular-nums">
                              {lead.phone}
                            </a>
                          </span>
                        )}
                        {lead.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-paper/40" />
                            <span>{lead.email}</span>
                          </span>
                        )}
                        {lead.district && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-paper/40" />
                            <span>{lead.district}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-paper/40 text-[11px]">
                          <Clock className="w-3 h-3" />
                          <span>{formatRelativeTime(lead.updatedAt)}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Right */}
                  <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                    {/* Lead Status Toggle */}
                    {!isConverted ? (
                      <button
                        type="button"
                        onClick={() => handleToggleSignInStatus(lead.id, 'converted')}
                        disabled={updatingStatusId === lead.id}
                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-[#222222] hover:bg-[#2A2A2A] border border-white/10 hover:border-emerald-500/40 text-paper/80 hover:text-emerald-300 rounded-xs text-xs transition-colors disabled:opacity-50 cursor-pointer"
                        title="Mark lead as completed"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="hidden sm:inline">Mark Completed</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleSignInStatus(lead.id, 'abandoned')}
                        disabled={updatingStatusId === lead.id}
                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-[#222222] hover:bg-[#2A2A2A] border border-white/10 hover:border-amber-500/40 text-paper/70 hover:text-amber-300 rounded-xs text-xs transition-colors disabled:opacity-50 cursor-pointer"
                        title="Mark lead as incomplete"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                        <span className="hidden sm:inline">Revert</span>
                      </button>
                    )}

                    {hasPhone && !isConverted && (
                      <a
                        href={getWhatsAppLeadUrl(lead)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xs text-xs transition-colors shadow-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp Lead</span>
                      </a>
                    )}

                    {hasPhone && (
                      <a
                        href={`tel:${lead.phone}`}
                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-[#222222] hover:bg-[#2A2A2A] border border-white/10 text-paper rounded-xs text-xs transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-gold" />
                      </a>
                    )}

                    <button
                      onClick={() => handleDeleteSignIn(lead.id)}
                      disabled={isDeleting === lead.id}
                      className="p-1.5 bg-[#222222] hover:bg-red-950/60 hover:text-red-300 border border-white/10 hover:border-red-800/40 rounded-xs text-paper/50 text-xs transition-colors disabled:opacity-50 cursor-pointer"
                      title="Delete lead"
                      aria-label="Delete lead"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* CONVERT DRAFT TO OFFICIAL ORDER MODAL */}
      {convertingDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#141414] border border-gold/40 rounded-xs max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative my-6 text-paper space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-serif text-lg sm:text-xl font-semibold text-paper flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-gold" />
                    <span>Convert to Official Order</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold/20 text-gold border border-gold/30">
                    Live Concierge
                  </span>
                </div>
                <p className="text-xs text-paper/60 mt-1">
                  Create an official continuous Order ID (AF-YYYY-XXXX), deduct inventory, and confirm customer delivery details from your call.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setConvertingDraft(null)}
                className="p-1 text-paper/40 hover:text-paper rounded-xs hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-xs">
              {/* Customer Coordinates Form */}
              <div className="space-y-3 bg-[#1A1A1A] p-4 rounded-xs border border-white/5">
                <span className="text-[11px] uppercase tracking-wider text-gold font-semibold block">
                  Customer & Delivery Details
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-paper/60 mb-1">Customer Full Name *</label>
                    <input
                      type="text"
                      value={convertModalForm.fullName}
                      onChange={(e) => setConvertModalForm((prev) => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Customer Name"
                      className="w-full bg-[#141414] border border-white/10 px-3 py-2 text-xs text-paper rounded-xs focus:outline-none focus:border-gold/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-paper/60 mb-1">Phone Number *</label>
                    <input
                      type="text"
                      value={convertModalForm.phone}
                      onChange={(e) => setConvertModalForm((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="+8801XXXXXXXXX"
                      className="w-full bg-[#141414] border border-white/10 px-3 py-2 text-xs text-paper rounded-xs focus:outline-none focus:border-gold/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-paper/60 mb-1">District / Region *</label>
                    <select
                      value={convertModalForm.district}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      className="w-full bg-[#141414] border border-white/10 px-3 py-2 text-xs text-paper rounded-xs focus:outline-none focus:border-gold/50"
                    >
                      {BANGLADESH_DISTRICTS.map((d) => (
                        <option key={d.name} value={d.name} className="bg-[#1C1C1C] text-paper">
                          {d.name} ({d.isDhakaMetro ? 'Dhaka Metro · ৳80' : 'Outside Dhaka · ৳130'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-paper/60 mb-1">Delivery Charge (৳)</label>
                    <input
                      type="number"
                      value={convertModalForm.shippingFee}
                      onChange={(e) =>
                        setConvertModalForm((prev) => ({
                          ...prev,
                          shippingFee: Number(e.target.value) || 0,
                        }))
                      }
                      className="w-full bg-[#141414] border border-white/10 px-3 py-2 text-xs text-paper rounded-xs focus:outline-none focus:border-gold/50"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-paper/60 mb-1">Full Street Address *</label>
                    <textarea
                      rows={2}
                      value={convertModalForm.address}
                      onChange={(e) => setConvertModalForm((prev) => ({ ...prev, address: e.target.value }))}
                      placeholder="Road, House, Flat, Area..."
                      className="w-full bg-[#141414] border border-white/10 px-3 py-2 text-xs text-paper rounded-xs focus:outline-none focus:border-gold/50 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-paper/60 mb-1">Payment Method</label>
                    <input
                      type="text"
                      value={convertModalForm.paymentMethod}
                      onChange={(e) => setConvertModalForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                      className="w-full bg-[#141414] border border-white/10 px-3 py-2 text-xs text-paper rounded-xs focus:outline-none focus:border-gold/50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-paper/60 mb-1">Email Address (Optional)</label>
                    <input
                      type="email"
                      value={convertModalForm.email}
                      onChange={(e) => setConvertModalForm((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="customer@example.com"
                      className="w-full bg-[#141414] border border-white/10 px-3 py-2 text-xs text-paper rounded-xs focus:outline-none focus:border-gold/50"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-paper/60 mb-1">Internal Order Note</label>
                    <input
                      type="text"
                      value={convertModalForm.internalNotes}
                      onChange={(e) => setConvertModalForm((prev) => ({ ...prev, internalNotes: e.target.value }))}
                      placeholder="Internal verification notes..."
                      className="w-full bg-[#141414] border border-white/10 px-3 py-2 text-xs text-paper rounded-xs focus:outline-none focus:border-gold/50"
                    />
                  </div>
                </div>
              </div>

              {/* Items Summary & Financial Breakdown */}
              <div className="bg-[#1A1A1A] p-4 rounded-xs border border-white/5 space-y-3">
                <span className="text-[11px] uppercase tracking-wider text-paper/50 font-semibold block">
                  Ordered Products ({convertingDraft.cartItems?.length || 0})
                </span>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {convertingDraft.cartItems?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between bg-[#141414] p-2 rounded-xs border border-white/5">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-9 h-10 bg-stone rounded-xs relative overflow-hidden shrink-0 border border-white/10">
                          {item.product?.featuredImage ? (
                            <img
                              src={item.product.featuredImage}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-paper/30">
                              <ShoppingBag className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="font-medium text-paper block truncate">{item.product?.name}</span>
                          <span className="text-[11px] text-paper/50 block">
                            {item.selectedColor?.name && `${item.selectedColor.name} • `}
                            Qty: {item.quantity}
                          </span>
                        </div>
                      </div>
                      <span className="font-medium text-gold shrink-0 tabular-nums">
                        ৳{formatPrice((item.product?.price ?? 0) * (item.quantity ?? 1))}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="pt-2 border-t border-white/10 space-y-1 text-xs">
                  <div className="flex justify-between text-paper/60">
                    <span>Subtotal</span>
                    <span className="tabular-nums">৳{formatPrice(convertingDraft.subtotal)}</span>
                  </div>
                  {convertingDraft.discountAmount && convertingDraft.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount ({convertingDraft.couponCode || 'Promo'})</span>
                      <span className="tabular-nums">-৳{formatPrice(convertingDraft.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-paper/60">
                    <span>Delivery Charge</span>
                    <span className="tabular-nums">৳{formatPrice(convertModalForm.shippingFee)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-paper pt-1 border-t border-white/5">
                    <span className="font-serif">Grand Total Payable</span>
                    <span className="font-serif text-gold text-base tabular-nums">
                      ৳{formatPrice(
                        Math.max(
                          0,
                          Math.round(
                            ((convertingDraft.subtotal || 0) -
                              (convertingDraft.discountAmount || 0) +
                              (convertModalForm.shippingFee || 0)) *
                              100
                          ) / 100
                        )
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setConvertingDraft(null)}
                disabled={isConverting}
                className="px-4 py-2 bg-[#222222] hover:bg-[#2A2A2A] border border-white/10 text-paper rounded-xs text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmConvertToOrder}
                disabled={isConverting}
                className="inline-flex items-center space-x-2 px-5 py-2 bg-gold hover:bg-gold-light text-ink font-semibold rounded-xs text-xs transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isConverting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating Official Order...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      Create Official Order (৳
                      {formatPrice(
                        Math.max(
                          0,
                          Math.round(
                            ((convertingDraft.subtotal || 0) -
                              (convertingDraft.discountAmount || 0) +
                              (convertModalForm.shippingFee || 0)) *
                              100
                          ) / 100
                        )
                      )}
                      )
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
