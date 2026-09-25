'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import {
  addSavedAddressAction,
  deleteSavedAddressAction,
} from '@/app/actions/customerAuthActions';
import {
  MapPin,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Home,
  Briefcase,
  Building,
} from 'lucide-react';

const DISTRICT_OPTIONS = [
  'Dhaka',
  'Gazipur',
  'Narayanganj',
  'Chittagong',
  'Rajshahi',
  'Sylhet',
  'Khulna',
  'Barisal',
  'Rangpur',
  'Mymensingh',
  'Bagerhat',
  'Bandarban',
  'Barguna',
  'Bhola',
  'Bogra',
  'Brahmanbaria',
  'Chandpur',
  'Chapainawabganj',
  'Chuadanga',
  'Comilla',
  'Cox\'s Bazar',
  'Dinajpur',
  'Faridpur',
  'Feni',
  'Gaibandha',
  'Gopalganj',
  'Habiganj',
  'Jamalpur',
  'Jessore',
  'Jhalokati',
  'Jhenaidah',
  'Joypurhat',
  'Kishoreganj',
  'Kurigram',
  'Kushtia',
  'Lakshmipur',
  'Lalmonirhat',
  'Madaripur',
  'Magura',
  'Manikganj',
  'Meherpur',
  'Moulvibazar',
  'Munshiganj',
  'Naogaon',
  'Narail',
  'Narsingdi',
  'Natore',
  'Netrokona',
  'Nilphamari',
  'Noakhali',
  'Pabna',
  'Panchagarh',
  'Patuakhali',
  'Pirojpur',
  'Rajbari',
  'Rangamati',
  'Satkhira',
  'Shariatpur',
  'Sherpur',
  'Sirajganj',
  'Sunamganj',
  'Tangail',
  'Thakurgaon',
];

export default function CustomerAddressesPage() {
  const router = useRouter();
  const { customer, isLoading, refreshCustomer } = useCustomerAuth();

  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [label, setLabel] = useState('Home');
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [address, setAddress] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (!isLoading && !customer) {
      router.push('/account/login?redirect=/account/addresses');
    } else if (customer) {
      setRecipientName(customer.fullName || '');
      setPhone(customer.phone || '');
      if (customer.district) setDistrict(customer.district);
    }
  }, [customer, isLoading, router]);

  if (isLoading || !customer) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3 bg-paper">
        <Loader2 className="w-6 h-6 text-gold animate-spin" />
        <p className="text-xs text-text-muted">Loading your addresses...</p>
      </div>
    );
  }

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!recipientName.trim() || !address.trim() || !phone.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    const res = await addSavedAddressAction({
      label,
      recipientName: recipientName.trim(),
      phone: phone.trim(),
      district,
      address: address.trim(),
      isDefault,
    });
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg('New delivery address added successfully.');
      setShowAddForm(false);
      setAddress('');
      await refreshCustomer();
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setErrorMsg(res.error || 'Failed to save address.');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (confirm('Are you sure you want to remove this saved delivery address?')) {
      await deleteSavedAddressAction(id);
      await refreshCustomer();
    }
  };

  const addresses = customer.savedAddresses || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-paper">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div className="flex items-center space-x-3">
          <Link
            href="/account"
            className="p-2 bg-sand hover:bg-sand/70 border border-line rounded-[2px] text-ink hover:text-gold-deep transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl text-ink font-normal">
              Saved Delivery Addresses
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              Manage your residential and work addresses across Bangladesh for rapid 1-click checkout.
            </p>
          </div>
        </div>

        {!showAddForm && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-ink hover:bg-gold-deep text-paper font-semibold text-xs uppercase tracking-wider rounded-[2px] transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Address</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-[2px] flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-[2px] flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Add Address Form Modal / Inline Box */}
      {showAddForm && (
        <form
          onSubmit={handleAddAddress}
          className="bg-sand/30 border border-line p-5 sm:p-6 rounded-[2px] space-y-4 shadow-sm animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between border-b border-line/60 pb-3">
            <h3 className="font-serif text-base text-ink font-medium">Add New Delivery Address</h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-text-muted hover:text-ink"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-ink mb-1">
                Address Tag
              </label>
              <select
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full h-10 px-3 bg-paper border border-line rounded-[2px] text-xs text-ink focus:outline-none focus:border-gold"
              >
                <option value="Home">Home</option>
                <option value="Office">Office</option>
                <option value="Studio">Studio / Atelier</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-ink mb-1">
                Recipient Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                required
                className="w-full h-10 px-3 bg-paper border border-line rounded-[2px] text-xs text-ink focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-ink mb-1">
                Contact Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full h-10 px-3 bg-paper border border-line rounded-[2px] text-xs text-ink focus:outline-none focus:border-gold font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-ink mb-1">
                District <span className="text-red-500">*</span>
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full h-10 px-3 bg-paper border border-line rounded-[2px] text-xs text-ink focus:outline-none focus:border-gold"
              >
                {DISTRICT_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d} {d === 'Dhaka' ? '(Inside Dhaka ৳70)' : '(৳130)'}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] uppercase tracking-wider text-ink mb-1">
                Detailed Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House, Flat, Road, Thana"
                required
                className="w-full h-10 px-3 bg-paper border border-line rounded-[2px] text-xs text-ink focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="isDefault"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 rounded-[2px] accent-gold cursor-pointer"
            />
            <label htmlFor="isDefault" className="text-xs text-text-muted cursor-pointer">
              Set as my primary default delivery address
            </label>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-line bg-paper text-ink text-xs rounded-[2px] hover:bg-sand transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-gold hover:bg-gold-light text-ink font-semibold text-xs rounded-[2px] transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Address</span>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Address Cards List */}
      {addresses.length === 0 ? (
        <div className="py-16 text-center bg-sand/20 border border-line rounded-[2px] space-y-3">
          <MapPin className="w-10 h-10 text-text-muted mx-auto" />
          <p className="text-sm font-medium text-ink">No saved addresses yet</p>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            Save your home or office address to enjoy instant auto-fill when ordering from our atelier.
          </p>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-gold hover:bg-gold-light text-ink text-xs font-semibold rounded-[2px] transition-colors mt-2"
          >
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-5 rounded-[2px] border transition-colors space-y-3 relative ${
                addr.isDefault
                  ? 'bg-sand/30 border-gold/60 shadow-xs'
                  : 'bg-paper border-line hover:border-gold/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 bg-paper rounded-[2px] border border-line text-gold-deep">
                    {addr.label === 'Home' ? (
                      <Home className="w-3.5 h-3.5" />
                    ) : addr.label === 'Office' ? (
                      <Briefcase className="w-3.5 h-3.5" />
                    ) : (
                      <Building className="w-3.5 h-3.5" />
                    )}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink">
                    {addr.label}
                  </span>
                  {addr.isDefault && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-[2px] bg-gold/15 text-gold-deep border border-gold/30 font-semibold uppercase">
                      Default
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="text-text-muted hover:text-red-600 transition-colors p-1"
                  title="Remove address"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-xs text-ink/80 space-y-1">
                <p className="font-semibold text-ink">{addr.recipientName}</p>
                <p className="text-text-muted font-mono">{addr.phone}</p>
                <p className="leading-relaxed">{addr.address}</p>
                <p className="font-medium text-ink">{addr.district}, Bangladesh</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
