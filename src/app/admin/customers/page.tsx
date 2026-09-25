'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  getAdminRegisteredUsersAction,
  getAdminGuestCustomersAction,
  getCustomersOverviewStatsAction,
  AdminRegisteredCustomer,
  AdminGuestCustomer,
  CustomersOverviewStats,
  AdminCustomerOrderSummary,
} from '@/app/actions/customerAdminActions';
import {
  Users,
  UserCheck,
  UserX,
  Search,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShoppingBag,
  ExternalLink,
  MessageCircle,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  ChevronRight,
  X,
  ShieldCheck,
  Sparkles,
  ArrowUpDown,
  Home,
  Tag,
} from 'lucide-react';

export default function AdminCustomersPage() {
  const [activeTab, setActiveTab] = useState<'registered' | 'guests'>('registered');
  const [registeredUsers, setRegisteredUsers] = useState<AdminRegisteredCustomer[]>([]);
  const [guestCustomers, setGuestCustomers] = useState<AdminGuestCustomer[]>([]);
  const [stats, setStats] = useState<CustomersOverviewStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'orders' | 'spend'>('newest');

  // Customer Detail Drawer
  const [selectedCustomer, setSelectedCustomer] = useState<{
    type: 'registered' | 'guest';
    data: AdminRegisteredCustomer | AdminGuestCustomer;
  } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [reg, guests, overview] = await Promise.all([
        getAdminRegisteredUsersAction(),
        getAdminGuestCustomersAction(),
        getCustomersOverviewStatsAction(),
      ]);
      setRegisteredUsers(reg);
      setGuestCustomers(guests);
      setStats(overview);
    } catch (e) {
      console.error('Failed to load customers:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute unique districts for filter dropdown
  const allDistricts = useMemo(() => {
    const set = new Set<string>();
    registeredUsers.forEach((u) => {
      if (u.district) set.add(u.district.trim());
    });
    guestCustomers.forEach((g) => {
      if (g.district) set.add(g.district.trim());
    });
    return Array.from(set).sort();
  }, [registeredUsers, guestCustomers]);

  // Filter & Sort Registered Patrons
  const filteredRegistered = useMemo(() => {
    return registeredUsers
      .filter((u) => {
        if (selectedDistrict !== 'all' && u.district !== selectedDistrict) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = u.fullName.toLowerCase().includes(q);
          const matchPhone = u.phone.includes(q);
          const matchEmail = u.email ? u.email.toLowerCase().includes(q) : false;
          const matchDistrict = u.district ? u.district.toLowerCase().includes(q) : false;
          const matchOrder = u.orders.some((o) => o.orderId.toLowerCase().includes(q));
          if (!matchName && !matchPhone && !matchEmail && !matchDistrict && !matchOrder) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'spend') return b.totalSpent - a.totalSpent;
        if (sortBy === 'orders') return b.orderCount - a.orderCount;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [registeredUsers, searchQuery, selectedDistrict, sortBy]);

  // Filter & Sort Guest Buyers
  const filteredGuests = useMemo(() => {
    return guestCustomers
      .filter((g) => {
        if (selectedDistrict !== 'all' && g.district !== selectedDistrict) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = g.fullName.toLowerCase().includes(q);
          const matchPhone = g.phone.includes(q);
          const matchEmail = g.email ? g.email.toLowerCase().includes(q) : false;
          const matchDistrict = g.district ? g.district.toLowerCase().includes(q) : false;
          const matchOrder = g.orders.some((o) => o.orderId.toLowerCase().includes(q));
          if (!matchName && !matchPhone && !matchEmail && !matchDistrict && !matchOrder) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'spend') return b.totalSpent - a.totalSpent;
        if (sortBy === 'orders') return b.orderCount - a.orderCount;
        return new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime();
      });
  }, [guestCustomers, searchQuery, selectedDistrict, sortBy]);

  // Quick WhatsApp link generator
  const getWhatsAppLink = (phone: string, name: string) => {
    let clean = phone.replace(/[^\d+]/g, '');
    if (clean.startsWith('0')) {
      clean = '880' + clean.slice(1);
    } else if (clean.startsWith('+')) {
      clean = clean.replace('+', '');
    } else if (!clean.startsWith('880')) {
      clean = '880' + clean;
    }
    const text = `Assalamu Alaikum ${name}, greetings from Adorous Fashion. We are contacting you regarding your boutique orders with us.`;
    return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
  };

  // Export to CSV
  const handleExportCSV = () => {
    const list = activeTab === 'registered' ? filteredRegistered : filteredGuests;
    if (list.length === 0) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    if (activeTab === 'registered') {
      csvContent += 'Type,Full Name,Phone,Email,District,Address,Orders Count,Total Spent (BDT),Joined Date\n';
      (list as AdminRegisteredCustomer[]).forEach((u) => {
        const row = [
          'Registered',
          `"${u.fullName}"`,
          `"${u.phone}"`,
          `"${u.email || ''}"`,
          `"${u.district || ''}"`,
          `"${(u.address || '').replace(/"/g, '""')}"`,
          u.orderCount,
          u.totalSpent,
          `"${new Date(u.createdAt).toLocaleDateString()}"`,
        ];
        csvContent += row.join(',') + '\n';
      });
    } else {
      csvContent += 'Type,Full Name,Phone,Email,District,Address,Orders Count,Total Spent (BDT),Last Order Date\n';
      (list as AdminGuestCustomer[]).forEach((g) => {
        const row = [
          'Guest',
          `"${g.fullName}"`,
          `"${g.phone}"`,
          `"${g.email || ''}"`,
          `"${g.district || ''}"`,
          `"${(g.address || '').replace(/"/g, '""')}"`,
          g.orderCount,
          g.totalSpent,
          `"${new Date(g.lastOrderDate).toLocaleDateString()}"`,
        ];
        csvContent += row.join(',') + '\n';
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `adorous_${activeTab}_customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/20 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-gold/10 text-gold rounded-xs border border-gold/30">
              <Users className="w-4 h-4" />
            </span>
            <h1 className="font-serif text-2xl tracking-[0.12em] uppercase text-gold font-semibold">
              Customers & Patrons
            </h1>
          </div>
          <p className="text-xs text-paper/60 mt-1 max-w-xl">
            Complete database of signed-in account holders and guest customers across all 64 districts in Bangladesh.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#1C1C1C] hover:bg-[#252525] border border-white/10 hover:border-gold/40 text-paper/80 hover:text-gold text-xs rounded-xs transition-colors"
            title="Download CSV report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-gold hover:bg-gold-light text-ink font-semibold text-xs rounded-xs transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Registered Patrons */}
        <div className="bg-[#171717] border border-gold/30 p-4 rounded-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-paper/60 uppercase">
              Registered Patrons
            </span>
            <span className="p-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-700/40">
              <UserCheck className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-gold font-semibold mt-2">
            {stats ? stats.registeredCount : '—'}
          </div>
          <div className="text-[10px] text-paper/50 mt-1">
            Accounts with password & saved addresses
          </div>
          <div className="mt-2 text-[11px] text-emerald-400/90 font-medium">
            ৳{stats ? stats.registeredRevenue.toLocaleString('en-US') : '0'} Lifetime Spend
          </div>
        </div>

        {/* Card 2: Guest Buyers */}
        <div className="bg-[#171717] border border-white/10 p-4 rounded-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-paper/60 uppercase">
              Guest Order Buyers
            </span>
            <span className="p-1 rounded-full bg-amber-950/60 text-amber-400 border border-amber-700/40">
              <UserX className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-paper font-semibold mt-2">
            {stats ? stats.guestCount : '—'}
          </div>
          <div className="text-[10px] text-paper/50 mt-1">
            Checked out without creating an account
          </div>
          <div className="mt-2 text-[11px] text-amber-400/90 font-medium">
            ৳{stats ? stats.guestRevenue.toLocaleString('en-US') : '0'} Lifetime Spend
          </div>
        </div>

        {/* Card 3: Total Unique Customers */}
        <div className="bg-[#171717] border border-white/10 p-4 rounded-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-paper/60 uppercase">
              Total Patron Reach
            </span>
            <span className="p-1 rounded-full bg-gold/10 text-gold border border-gold/30">
              <Users className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-paper font-semibold mt-2">
            {stats ? stats.totalUniqueBuyers : '—'}
          </div>
          <div className="text-[10px] text-paper/50 mt-1">
            Combined unique customer base
          </div>
          <div className="mt-2 text-[11px] text-gold-light/90 font-medium">
            ৳{stats ? stats.totalRevenue.toLocaleString('en-US') : '0'} Total Orders Value
          </div>
        </div>

        {/* Card 4: Repeat Guest Buyers */}
        <div className="bg-[#171717] border border-white/10 p-4 rounded-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-paper/60 uppercase">
              Repeat Guest Buyers
            </span>
            <span className="p-1 rounded-full bg-blue-950/60 text-blue-400 border border-blue-700/40">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-blue-300 font-semibold mt-2">
            {stats ? stats.repeatGuestCount : '—'}
          </div>
          <div className="text-[10px] text-paper/50 mt-1">
            Guests with 2+ orders (VIP conversion candidates)
          </div>
          <div className="mt-2 text-[11px] text-blue-400/90 font-medium">
            Prime candidates for loyalty invite
          </div>
        </div>
      </div>

      {/* Main Container with Tabs */}
      <div className="bg-[#141414] border border-gold/20 rounded-xs overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-white/10 bg-[#171717]">
          <button
            type="button"
            onClick={() => setActiveTab('registered')}
            className={`flex-1 sm:flex-none px-6 py-3.5 text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 border-b-2 ${
              activeTab === 'registered'
                ? 'border-gold text-gold bg-[#1F1F1F]'
                : 'border-transparent text-paper/60 hover:text-paper hover:bg-[#1A1A1A]'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Registered Patrons</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-gold/20 text-gold-light font-mono font-bold">
              {registeredUsers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guests')}
            className={`flex-1 sm:flex-none px-6 py-3.5 text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 border-b-2 ${
              activeTab === 'guests'
                ? 'border-gold text-gold bg-[#1F1F1F]'
                : 'border-transparent text-paper/60 hover:text-paper hover:bg-[#1A1A1A]'
            }`}
          >
            <UserX className="w-4 h-4 text-amber-400" />
            <span>Guest Order Buyers</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-mono font-bold">
              {guestCustomers.length}
            </span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-white/10 bg-[#181818] flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-paper/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'registered'
                  ? 'Search by name, phone, email, district, or order ID...'
                  : 'Search guest buyers by name, phone, district, or order ID...'
              }
              className="w-full h-9 pl-9 pr-3 bg-[#222222] border border-white/15 focus:border-gold rounded-xs text-xs text-paper placeholder:text-paper/30 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-paper/40 hover:text-paper"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* District & Sort Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {/* District */}
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] text-paper/50">District:</span>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="h-9 px-2.5 bg-[#222222] border border-white/15 focus:border-gold rounded-xs text-xs text-paper focus:outline-none cursor-pointer"
              >
                <option value="all">All Districts ({allDistricts.length})</option>
                {allDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] text-paper/50">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-9 px-2.5 bg-[#222222] border border-white/15 focus:border-gold rounded-xs text-xs text-paper focus:outline-none cursor-pointer"
              >
                <option value="newest">Latest Activity</option>
                <option value="spend">Highest Spend (VIP)</option>
                <option value="orders">Most Orders</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 1: Registered Patrons View */}
        {activeTab === 'registered' && (
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-20 text-center text-xs text-paper/50 space-y-2">
                <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
                <span>Loading Registered Patrons...</span>
              </div>
            ) : filteredRegistered.length === 0 ? (
              <div className="py-16 text-center text-paper/50 space-y-2">
                <UserCheck className="w-8 h-8 text-paper/30 mx-auto" />
                <p className="text-sm font-serif text-paper/70">No registered patrons match your filter</p>
                <p className="text-xs text-paper/40">Try adjusting your search query or district selection.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-[#161616] text-[10px] text-paper/50 uppercase tracking-widest">
                    <th className="py-3 px-4">Patron Details</th>
                    <th className="py-3 px-4">Contact & WhatsApp</th>
                    <th className="py-3 px-4">Location & Addresses</th>
                    <th className="py-3 px-4 text-center">Orders Placed</th>
                    <th className="py-3 px-4 text-right">Total Spent</th>
                    <th className="py-3 px-4 text-right">Registered On</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredRegistered.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-white/5 transition-colors group cursor-pointer"
                      onClick={() => setSelectedCustomer({ type: 'registered', data: user })}
                    >
                      {/* Name & Badge */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gold/15 text-gold border border-gold/30 flex items-center justify-center font-serif text-xs font-semibold shrink-0">
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-paper block group-hover:text-gold transition-colors">
                              {user.fullName}
                            </span>
                            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Verified Patron Account</span>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Phone & Email */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1.5 font-mono text-paper/90">
                            <Phone className="w-3 h-3 text-gold/70 shrink-0" />
                            <span>{user.phone}</span>
                          </div>
                          {user.email && (
                            <div className="flex items-center space-x-1.5 text-[11px] text-paper/60">
                              <Mail className="w-3 h-3 text-paper/40 shrink-0" />
                              <span className="truncate max-w-[160px]">{user.email}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1 text-gold-light text-[11px] font-medium">
                            <MapPin className="w-3 h-3 text-gold shrink-0" />
                            <span>{user.district || 'Unassigned District'}</span>
                          </div>
                          <span className="text-[10px] text-paper/50 block truncate max-w-[200px]">
                            {user.address || 'No street address saved'}
                          </span>
                          {user.savedAddressesCount > 0 && (
                            <span className="inline-block px-1.5 py-0.2 rounded-xs bg-[#222] border border-white/10 text-[9px] text-paper/60">
                              {user.savedAddressesCount} saved {user.savedAddressesCount === 1 ? 'address' : 'addresses'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Order Count */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gold/15 text-gold border border-gold/30">
                          {user.orderCount} {user.orderCount === 1 ? 'Order' : 'Orders'}
                        </span>
                      </td>

                      {/* Total Spent */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-semibold text-paper tabular-nums text-xs">
                          ৳{user.totalSpent.toLocaleString('en-US')}
                        </span>
                        <span className="block text-[10px] text-paper/40">Lifetime Value</span>
                      </td>

                      {/* Join Date */}
                      <td className="py-3.5 px-4 text-right text-[11px] text-paper/60 tabular-nums">
                        {new Date(user.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-2">
                          <a
                            href={getWhatsAppLink(user.phone, user.fullName)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-400 rounded-xs transition-colors"
                            title="Open WhatsApp chat"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>

                          <a
                            href={`tel:${user.phone}`}
                            className="p-1.5 bg-[#222222] hover:bg-[#2A2A2A] border border-white/10 text-paper/70 hover:text-paper rounded-xs transition-colors"
                            title="Call patron"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>

                          <button
                            type="button"
                            onClick={() => setSelectedCustomer({ type: 'registered', data: user })}
                            className="px-2 py-1 bg-gold/15 hover:bg-gold text-gold hover:text-ink text-[11px] font-medium rounded-xs border border-gold/40 transition-colors flex items-center space-x-1"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Section 2: Guest Order Buyers View */}
        {activeTab === 'guests' && (
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-20 text-center text-xs text-paper/50 space-y-2">
                <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
                <span>Loading Guest Customers...</span>
              </div>
            ) : filteredGuests.length === 0 ? (
              <div className="py-16 text-center text-paper/50 space-y-2">
                <UserX className="w-8 h-8 text-paper/30 mx-auto" />
                <p className="text-sm font-serif text-paper/70">No guest customers found</p>
                <p className="text-xs text-paper/40">
                  When visitors place orders without signing in, their details will appear right here.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-[#161616] text-[10px] text-paper/50 uppercase tracking-widest">
                    <th className="py-3 px-4">Guest Customer</th>
                    <th className="py-3 px-4">Contact Phone</th>
                    <th className="py-3 px-4">Delivery District & Address</th>
                    <th className="py-3 px-4 text-center">Guest Orders</th>
                    <th className="py-3 px-4 text-right">Total Spent</th>
                    <th className="py-3 px-4 text-right">Latest Order</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredGuests.map((guest) => (
                    <tr
                      key={guest.phone}
                      className="hover:bg-white/5 transition-colors group cursor-pointer"
                      onClick={() => setSelectedCustomer({ type: 'guest', data: guest })}
                    >
                      {/* Name & Badge */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-amber-950/60 text-amber-300 border border-amber-700/40 flex items-center justify-center font-serif text-xs font-semibold shrink-0">
                            {guest.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-paper block group-hover:text-gold transition-colors">
                              {guest.fullName}
                            </span>
                            <span className="text-[10px] text-amber-400/80 font-medium flex items-center gap-1 mt-0.5">
                              <UserX className="w-3 h-3" />
                              <span>Guest Checkout (Unregistered)</span>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-1.5 font-mono text-paper/90">
                            <Phone className="w-3 h-3 text-amber-400/70 shrink-0" />
                            <span>{guest.phone}</span>
                          </div>
                          {guest.email && (
                            <span className="text-[10px] text-paper/50 block truncate max-w-[150px]">
                              {guest.email}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Delivery Address */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-1 text-gold-light text-[11px] font-medium">
                            <MapPin className="w-3 h-3 text-gold shrink-0" />
                            <span>{guest.district}</span>
                          </div>
                          <span className="text-[10px] text-paper/50 block truncate max-w-[220px]">
                            {guest.address}
                          </span>
                        </div>
                      </td>

                      {/* Orders Count */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center space-x-1">
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-600/30">
                            {guest.orderCount} {guest.orderCount === 1 ? 'Order' : 'Orders'}
                          </span>
                          {guest.orderCount > 1 && (
                            <span className="text-[9px] text-emerald-400 font-bold bg-emerald-950/60 px-1 py-0.2 rounded-xs border border-emerald-700/40">
                              Repeat
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Total Spent */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-semibold text-paper tabular-nums text-xs">
                          ৳{guest.totalSpent.toLocaleString('en-US')}
                        </span>
                        <span className="block text-[10px] text-paper/40">Lifetime Value</span>
                      </td>

                      {/* Last Order Date */}
                      <td className="py-3.5 px-4 text-right text-[11px] text-paper/60 tabular-nums">
                        {new Date(guest.lastOrderDate).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-2">
                          <a
                            href={getWhatsAppLink(guest.phone, guest.fullName)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-400 rounded-xs transition-colors"
                            title="Contact via WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>

                          <a
                            href={`tel:${guest.phone}`}
                            className="p-1.5 bg-[#222222] hover:bg-[#2A2A2A] border border-white/10 text-paper/70 hover:text-paper rounded-xs transition-colors"
                            title="Call guest"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>

                          <button
                            type="button"
                            onClick={() => setSelectedCustomer({ type: 'guest', data: guest })}
                            className="px-2 py-1 bg-white/10 hover:bg-gold text-paper hover:text-ink text-[11px] font-medium rounded-xs border border-white/20 hover:border-gold transition-colors flex items-center space-x-1"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Customer Detail Slide-Over Modal / Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#171717] border border-gold/40 max-w-2xl w-full rounded-xs shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Drawer Header */}
            <div className="p-5 border-b border-white/10 flex items-start justify-between bg-[#1F1F1F]">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-full bg-gold/15 text-gold border border-gold/30 flex items-center justify-center font-serif text-lg font-semibold shrink-0">
                  {selectedCustomer.data.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-serif text-paper font-semibold">
                      {selectedCustomer.data.fullName}
                    </h2>
                    {selectedCustomer.type === 'registered' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-700/50">
                        Registered Account
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/70 text-amber-300 border border-amber-700/50">
                        Guest Customer
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-paper/50 block mt-0.5 font-mono">
                    Phone: {selectedCustomer.data.phone}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 text-paper/50 hover:text-paper bg-white/5 hover:bg-white/10 rounded-xs transition-colors"
                title="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-5 overflow-y-auto space-y-6 text-xs flex-1">
              {/* Communication Bar */}
              <div className="flex items-center gap-3">
                <a
                  href={getWhatsAppLink(selectedCustomer.data.phone, selectedCustomer.data.fullName)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/60 text-emerald-300 rounded-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send WhatsApp Message</span>
                </a>

                <a
                  href={`tel:${selectedCustomer.data.phone}`}
                  className="flex-1 py-2.5 px-3 bg-[#222222] hover:bg-[#2C2C2C] border border-white/15 text-paper rounded-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
                >
                  <Phone className="w-4 h-4 text-gold" />
                  <span>Call Phone Number</span>
                </a>
              </div>

              {/* Profile Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#1B1B1B] p-4 rounded-xs border border-white/5">
                <div>
                  <span className="text-[10px] text-paper/40 uppercase tracking-wider block">Total Spent</span>
                  <span className="text-base font-semibold text-gold font-serif tabular-nums">
                    ৳{selectedCustomer.data.totalSpent.toLocaleString('en-US')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-paper/40 uppercase tracking-wider block">Total Orders</span>
                  <span className="text-base font-semibold text-paper font-serif tabular-nums">
                    {selectedCustomer.data.orderCount}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-paper/40 uppercase tracking-wider block">District</span>
                  <span className="text-xs font-semibold text-paper truncate block">
                    {selectedCustomer.data.district || 'Unassigned'}
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-3 pt-2 border-t border-white/5">
                  <span className="text-[10px] text-paper/40 uppercase tracking-wider block">Primary Delivery Address</span>
                  <span className="text-xs text-paper/80 block mt-0.5">
                    {selectedCustomer.data.address || 'No street address specified'}
                  </span>
                </div>
              </div>

              {/* Saved Addresses (Registered Customers Only) */}
              {selectedCustomer.type === 'registered' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-gold-light uppercase tracking-wider">
                      Saved Delivery Addresses
                    </span>
                    <span className="text-[10px] text-paper/40">
                      {(selectedCustomer.data as AdminRegisteredCustomer).savedAddresses.length} saved
                    </span>
                  </div>

                  {(selectedCustomer.data as AdminRegisteredCustomer).savedAddresses.length === 0 ? (
                    <div className="p-3 bg-[#1A1A1A] border border-dashed border-white/10 text-paper/40 text-center rounded-xs">
                      No additional delivery addresses saved
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(selectedCustomer.data as AdminRegisteredCustomer).savedAddresses.map((addr) => (
                        <div
                          key={addr.id}
                          className="p-3 bg-[#1A1A1A] border border-white/10 rounded-xs flex items-start justify-between gap-3"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <Home className="w-3.5 h-3.5 text-gold" />
                              <span className="font-semibold text-paper text-xs">{addr.label}</span>
                              {addr.isDefault && (
                                <span className="text-[9px] bg-gold/20 text-gold px-1.5 py-0.2 rounded-xs border border-gold/30">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-paper/70">
                              Recipient: {addr.recipientName} ({addr.phone})
                            </p>
                            <p className="text-[11px] text-paper/50">
                              {addr.address}, {addr.district}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Order History Timeline */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-gold-light uppercase tracking-wider">
                    Order History ({selectedCustomer.data.orders.length})
                  </span>
                  <Link
                    href="/admin"
                    className="text-[10px] text-gold hover:underline flex items-center space-x-1"
                  >
                    <span>Go to Orders Desk</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                {selectedCustomer.data.orders.length === 0 ? (
                  <div className="p-4 bg-[#1A1A1A] border border-dashed border-white/10 text-paper/40 text-center rounded-xs">
                    No orders placed yet by this account.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedCustomer.data.orders.map((ord) => (
                      <div
                        key={ord.orderId}
                        className="p-3 bg-[#1A1A1A] border border-white/10 rounded-xs flex items-center justify-between gap-3 hover:border-gold/30 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-semibold text-paper">
                              {ord.orderId}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded-xs font-medium uppercase ${
                                ord.status === 'delivered'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/50'
                                  : ord.status === 'cancelled'
                                  ? 'bg-red-950 text-red-400 border border-red-700/50'
                                  : 'bg-amber-950 text-amber-400 border border-amber-700/50'
                              }`}
                            >
                              {ord.status.replace('_', ' ')}
                            </span>
                          </div>
                          <span className="text-[10px] text-paper/40 block">
                            {new Date(ord.createdAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })} · {ord.itemsCount} {ord.itemsCount === 1 ? 'item' : 'items'} · {ord.paymentMethod}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-semibold text-gold font-serif tabular-nums">
                            ৳{ord.grandTotal.toLocaleString('en-US')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-white/10 bg-[#1A1A1A] flex items-center justify-between text-xs text-paper/50">
              <span>Customer ID / Phone: {selectedCustomer.data.phone}</span>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-1.5 bg-[#252525] hover:bg-[#303030] text-paper rounded-xs transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
