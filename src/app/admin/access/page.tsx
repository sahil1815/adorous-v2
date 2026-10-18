'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  createInvitationAction,
  getAllInvitationsAction,
  getPendingApprovalsAction,
  approveUserAction,
  rejectUserAction,
  revokeInvitationAction,
  getAccessStatsAction,
} from '@/app/actions/accessActions';
import { InvitationData } from '@/types';
import {
  KeyRound,
  UserCheck,
  UserX,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Send,
  Copy,
  Check,
  RefreshCw,
  Search,
  MessageCircle,
  Phone,
  Mail,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  UserPlus,
  Trash2,
  CheckCircle2,
  X,
} from 'lucide-react';

export default function AdminAccessPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'invites' | 'create'>('pending');
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<InvitationData[]>([]);
  const [stats, setStats] = useState<{
    pendingApprovalsCount: number;
    approvedUsersCount: number;
    totalInvitesCount: number;
    activeInvitesCount: number;
    modifiedPendingCount: number;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Form State for Creating Invitation
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteNote, setInviteNote] = useState('');
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [generatedInvite, setGeneratedInvite] = useState<{
    token: string;
    inviteeName: string;
    inviteeEmail: string;
    inviteLink: string;
  } | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Search Filter
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [pendingList, inviteList, statData] = await Promise.all([
        getPendingApprovalsAction(),
        getAllInvitationsAction(),
        getAccessStatsAction(),
      ]);
      setPendingUsers(pendingList);
      setInvitations(inviteList);
      setStats(statData);
    } catch (e) {
      console.error('Failed to load access management data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Create Invitation Submit
  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setIsCreatingInvite(true);

    const res = await createInvitationAction({
      name: inviteName,
      email: inviteEmail,
      note: inviteNote,
    });
    setIsCreatingInvite(false);

    if (res.success && res.invitation) {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const fullUrl = `${origin}/invite/${res.invitation.token}`;

      setGeneratedInvite({
        token: res.invitation.token,
        inviteeName: res.invitation.inviteeName,
        inviteeEmail: res.invitation.inviteeEmail,
        inviteLink: fullUrl,
      });

      setInviteName('');
      setInviteEmail('');
      setInviteNote('');
      loadData();
    } else {
      setCreateError(res.error || 'Failed to create invitation.');
    }
  };

  // Copy Link Helper
  const handleCopyLink = (token: string, directUrl?: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = directUrl || `${origin}/invite/${token}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2500);
    }
  };

  // Approve User
  const handleApprove = async (userId: string) => {
    setActionInProgress(userId);
    const res = await approveUserAction(userId);
    setActionInProgress(null);
    if (res.success) {
      loadData();
    } else {
      alert(res.error || 'Failed to approve user');
    }
  };

  // Reject User
  const handleReject = async (userId: string) => {
    if (!confirm('Are you sure you want to decline access for this account?')) return;
    setActionInProgress(userId);
    const res = await rejectUserAction(userId);
    setActionInProgress(null);
    if (res.success) {
      loadData();
    } else {
      alert(res.error || 'Failed to reject user');
    }
  };

  // Revoke Invitation
  const handleRevokeInvite = async (invitationId: string) => {
    if (!confirm('Revoke this invitation link? The recipient will no longer be able to use it.')) return;
    setActionInProgress(invitationId);
    const res = await revokeInvitationAction(invitationId);
    setActionInProgress(null);
    if (res.success) {
      loadData();
    }
  };

  // WhatsApp quick contact
  const getWhatsAppLink = (phone: string, name: string, isApproval = false) => {
    let clean = phone.replace(/[^\d+]/g, '');
    if (clean.startsWith('0')) clean = '880' + clean.slice(1);
    else if (clean.startsWith('+')) clean = clean.replace('+', '');
    else if (!clean.startsWith('880')) clean = '880' + clean;

    const text = isApproval
      ? `Assalamu Alaikum ${name}. Greetings from Adorous Fashion. Your patron account has been approved by the owner! You can now log in at https://adorous.com/account/login`
      : `Assalamu Alaikum ${name}. Greetings from Adorous Fashion Atelier regarding your account application.`;

    return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
  };

  // Filtered lists
  const filteredPending = useMemo(() => {
    if (!searchQuery.trim()) return pendingUsers;
    const q = searchQuery.toLowerCase();
    return pendingUsers.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.invitation && u.invitation.inviteeEmail.toLowerCase().includes(q))
    );
  }, [pendingUsers, searchQuery]);

  const filteredInvites = useMemo(() => {
    if (!searchQuery.trim()) return invitations;
    const q = searchQuery.toLowerCase();
    return invitations.filter(
      (inv) =>
        inv.inviteeName.toLowerCase().includes(q) ||
        inv.inviteeEmail.toLowerCase().includes(q) ||
        inv.token.toLowerCase().includes(q) ||
        (inv.note && inv.note.toLowerCase().includes(q))
    );
  }, [invitations, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/20 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-gold/10 text-gold rounded-xs border border-gold/30">
              <KeyRound className="w-4 h-4" />
            </span>
            <h1 className="text-2xl font-extrabold tracking-[0.12em] uppercase text-gold">
              Access & Invitations Desk
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 font-medium mt-1 max-w-xl">
            Generate pre-approved VIP invite links and review pending accounts requiring owner authorization.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-gold hover:bg-gold-light text-ink font-bold text-xs rounded-xs transition-colors cursor-pointer shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Generate New Invite</span>
          </button>

          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#1C1C1C] hover:bg-[#252525] border border-white/10 hover:border-gold/40 text-zinc-200 hover:text-gold text-xs font-semibold rounded-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Pending Approvals */}
        <div
          onClick={() => setActiveTab('pending')}
          className={`bg-[#171717] border p-4 rounded-xs space-y-1 cursor-pointer transition-all ${
            activeTab === 'pending'
              ? 'border-amber-500 shadow-md bg-[#1B1914]'
              : 'border-white/10 hover:border-amber-500/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-amber-400 uppercase">
              Pending Approvals
            </span>
            <span className="p-1 rounded-full bg-amber-950/60 text-amber-400 border border-amber-700/40">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-amber-300 tabular-nums tracking-tight mt-1.5">
            {stats ? stats.pendingApprovalsCount : '—'}
          </div>
          <div className="text-xs text-zinc-400 font-medium mt-1">
            Accounts awaiting owner review
          </div>
          {stats && stats.modifiedPendingCount > 0 && (
            <div className="mt-2 text-[10px] text-amber-300 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded-xs border border-amber-500/20 inline-block">
              {stats.modifiedPendingCount} modified invited email
            </div>
          )}
        </div>

        {/* Card 2: Active Invitations */}
        <div
          onClick={() => setActiveTab('invites')}
          className={`bg-[#171717] border p-4 rounded-xs space-y-1 cursor-pointer transition-all ${
            activeTab === 'invites'
              ? 'border-gold shadow-md bg-[#1D1B14]'
              : 'border-white/10 hover:border-gold/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-gold-light uppercase">
              Active Invitations
            </span>
            <span className="p-1 rounded-full bg-gold/10 text-gold border border-gold/30">
              <Send className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-gold tabular-nums tracking-tight mt-1.5">
            {stats ? stats.activeInvitesCount : '—'}
          </div>
          <div className="text-xs text-zinc-400 font-medium mt-1">
            Sent VIP links awaiting registration
          </div>
          <div className="mt-2 text-xs text-zinc-400">
            {stats ? stats.totalInvitesCount : '0'} Total links generated
          </div>
        </div>

        {/* Card 3: Approved Patrons */}
        <div className="bg-[#171717] border border-white/10 p-4 rounded-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-emerald-400 uppercase">
              Authorized Patrons
            </span>
            <span className="p-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-700/40">
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-300 tabular-nums tracking-tight mt-1.5">
            {stats ? stats.approvedUsersCount : '—'}
          </div>
          <div className="text-xs text-zinc-400 font-medium mt-1">
            Full portal & checkout clearance
          </div>
          <div className="mt-2 text-xs text-emerald-400 font-semibold">
            Active verified accounts
          </div>
        </div>

        {/* Card 4: Quick Action */}
        <div
          onClick={() => setActiveTab('create')}
          className="bg-gradient-to-br from-gold/15 via-[#171717] to-[#171717] border border-gold/40 hover:border-gold p-4 rounded-xs space-y-1 cursor-pointer transition-colors flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-gold uppercase">
                Direct Invite
              </span>
              <Sparkles className="w-4 h-4 text-gold" />
            </div>
            <div className="text-sm font-bold text-white mt-2">
              Send Pre-Approved Access
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Give someone immediate entry with their name and email address.
            </p>
          </div>
          <div className="mt-3 text-xs text-gold-light font-bold flex items-center space-x-1">
            <span>Create Invitation &rarr;</span>
          </div>
        </div>
      </div>

      {/* Main Tabs Container */}
      <div className="bg-[#141414] border border-gold/20 rounded-xs overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-[#171717]">
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`flex-1 sm:flex-none px-6 py-3.5 text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 border-b-2 ${
              activeTab === 'pending'
                ? 'border-amber-400 text-amber-300 bg-[#1F1D17]'
                : 'border-transparent text-paper/60 hover:text-paper hover:bg-[#1A1A1A]'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Pending Approvals Queue</span>
            {pendingUsers.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-mono font-bold">
                {pendingUsers.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('invites')}
            className={`flex-1 sm:flex-none px-6 py-3.5 text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 border-b-2 ${
              activeTab === 'invites'
                ? 'border-gold text-gold bg-[#1F1F1F]'
                : 'border-transparent text-paper/60 hover:text-paper hover:bg-[#1A1A1A]'
            }`}
          >
            <Send className="w-4 h-4 text-gold" />
            <span>Sent VIP Invitations</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-gold/20 text-gold-light font-mono font-bold">
              {invitations.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`flex-1 sm:flex-none px-6 py-3.5 text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 border-b-2 ${
              activeTab === 'create'
                ? 'border-gold text-gold bg-[#1F1F1F]'
                : 'border-transparent text-paper/60 hover:text-paper hover:bg-[#1A1A1A]'
            }`}
          >
            <UserPlus className="w-4 h-4 text-gold-light" />
            <span>Generate New Invitation</span>
          </button>
        </div>

        {/* Filter Bar (for Pending & Invites tabs) */}
        {activeTab !== 'create' && (
          <div className="p-4 border-b border-white/10 bg-[#181818] flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-paper/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === 'pending'
                    ? 'Search pending users by name, phone, or email...'
                    : 'Search invitations by recipient name, email, or token...'
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

            <span className="text-xs text-zinc-400 hidden sm:inline-block">
              {activeTab === 'pending'
                ? `${filteredPending.length} pending review`
                : `${filteredInvites.length} invitations listed`}
            </span>
          </div>
        )}

        {/* ── TAB 1: PENDING APPROVALS QUEUE ── */}
        {activeTab === 'pending' && (
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-20 text-center text-xs text-paper/50 space-y-2">
                <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
                <span>Loading pending requests...</span>
              </div>
            ) : filteredPending.length === 0 ? (
              <div className="py-16 text-center text-paper/50 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-700/40 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-white">No Pending Approvals</p>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  All accounts have been reviewed. When someone signs up publicly or changes their
                  invited email address, their approval request will appear here.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-[#161616] text-[10px] text-paper/50 uppercase tracking-widest">
                    <th className="py-3 px-4">Applicant & Contact</th>
                    <th className="py-3 px-4">Approval Type</th>
                    <th className="py-3 px-4">Original Invite vs Registered Email</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4 text-right">Registered At</th>
                    <th className="py-3 px-4 text-right">Owner Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredPending.map((user) => {
                    const isEmailModified = Boolean(
                      user.invitation &&
                        user.invitation.inviteeEmail.trim().toLowerCase() !==
                          (user.email || '').trim().toLowerCase()
                    );

                    return (
                      <tr key={user.id} className="hover:bg-white/5 transition-colors">
                        {/* Name & Phone */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-paper text-sm">
                                {user.fullName}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1.5 font-mono text-zinc-300 text-[11px]">
                              <Phone className="w-3 h-3 text-gold/70 shrink-0" />
                              <span>{user.phone || 'No phone'}</span>
                            </div>
                            {user.email && (
                              <div className="flex items-center space-x-1.5 text-[11px] text-zinc-400 font-mono">
                                <Mail className="w-3 h-3 text-zinc-500 shrink-0" />
                                <span>{user.email}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Approval Type Badge */}
                        <td className="py-3.5 px-4">
                          {isEmailModified ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-xs text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-600/60 uppercase">
                                <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                                <span>Email Modified from Invite</span>
                              </span>
                              <p className="text-[10px] text-zinc-400">
                                Recipient changed the sender's given email
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-xs text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700 uppercase">
                                <UserX className="w-3 h-3 text-zinc-400 shrink-0" />
                                <span>Direct Public Registration</span>
                              </span>
                              <p className="text-[10px] text-zinc-400">
                                Signed up without an invitation link
                              </p>
                            </div>
                          )}
                        </td>

                        {/* Email Comparison */}
                        <td className="py-3.5 px-4">
                          {user.invitation ? (
                            <div className="space-y-1.5 bg-[#1B1B1B] p-2 rounded-xs border border-white/5 text-[11px]">
                              <div className="flex items-center justify-between text-zinc-400">
                                <span>Invited for:</span>
                                <span className="font-mono text-zinc-400 line-through">
                                  {user.invitation.inviteeEmail}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-amber-300 font-bold border-t border-white/5 pt-1">
                                <span>Registered as:</span>
                                <span className="font-mono text-amber-200">
                                  {user.email || 'None'}
                                </span>
                              </div>
                              {user.invitation.note && (
                                <p className="text-[10px] text-zinc-500 italic pt-0.5">
                                  Note: "{user.invitation.note}"
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-zinc-500 font-mono">
                              {user.email || 'No email provided'}
                            </span>
                          )}
                        </td>

                        {/* Location */}
                        <td className="py-3.5 px-4">
                          <span className="text-gold-light text-xs font-semibold block">
                            {user.district || 'Unassigned District'}
                          </span>
                          <span className="text-[10px] text-zinc-400 block truncate max-w-[180px]">
                            {user.address || 'No street address'}
                          </span>
                        </td>

                        {/* Registered At */}
                        <td className="py-3.5 px-4 text-right text-[11px] text-zinc-400 tabular-nums">
                          {new Date(user.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>

                        {/* Actions: Approve / Decline */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {user.phone && (
                              <a
                                href={getWhatsAppLink(user.phone, user.fullName)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-400 rounded-xs transition-colors"
                                title="Message applicant on WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            )}

                            <button
                              type="button"
                              onClick={() => handleReject(user.id)}
                              disabled={actionInProgress === user.id}
                              className="px-2.5 py-1.5 bg-[#252525] hover:bg-rose-950 text-zinc-300 hover:text-rose-200 border border-white/10 hover:border-rose-700/60 rounded-xs text-[11px] font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              Decline
                            </button>

                            <button
                              type="button"
                              onClick={() => handleApprove(user.id)}
                              disabled={actionInProgress === user.id}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xs text-[11px] font-bold transition-colors disabled:opacity-50 flex items-center space-x-1 cursor-pointer shadow-sm"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Accept & Grant Access</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── TAB 2: SENT VIP INVITATIONS DIRECTORY ── */}
        {activeTab === 'invites' && (
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-20 text-center text-xs text-paper/50 space-y-2">
                <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
                <span>Loading VIP invitations...</span>
              </div>
            ) : filteredInvites.length === 0 ? (
              <div className="py-16 text-center text-paper/50 space-y-3">
                <Send className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-sm font-bold text-white">No VIP Invitations Found</p>
                <p className="text-xs text-zinc-400">
                  Generate an invitation link to invite exclusive patrons to the boutique.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('create')}
                  className="px-3 py-1.5 bg-gold hover:bg-gold-light text-ink font-bold text-xs rounded-xs mt-2"
                >
                  Create First Invitation
                </button>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-[#161616] text-[10px] text-paper/50 uppercase tracking-widest">
                    <th className="py-3 px-4">Invited Recipient</th>
                    <th className="py-3 px-4">Authorized Email</th>
                    <th className="py-3 px-4">Invitation Status</th>
                    <th className="py-3 px-4">Claimed Account</th>
                    <th className="py-3 px-4 text-right">Created Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredInvites.map((inv) => (
                    <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                      {/* Name & Token */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-paper block text-sm">
                            {inv.inviteeName}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500 block">
                            Token: {inv.token}
                          </span>
                          {inv.note && (
                            <span className="text-[10px] text-zinc-400 italic block">
                              Note: {inv.note}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Authorized Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1.5 font-mono text-zinc-200">
                          <Mail className="w-3.5 h-3.5 text-gold/70 shrink-0" />
                          <span>{inv.inviteeEmail}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {inv.status === 'ACCEPTED' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60 inline-flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Claimed & Auto-Approved</span>
                          </span>
                        ) : inv.status === 'MODIFIED_PENDING' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-600/60 inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            <span>Claimed with Modified Email</span>
                          </span>
                        ) : inv.status === 'REVOKED' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-700/60 inline-flex items-center gap-1">
                            <X className="w-3 h-3 text-rose-400" />
                            <span>Revoked</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold/15 text-gold border border-gold/40 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gold" />
                            <span>Pending Claim (Link Active)</span>
                          </span>
                        )}
                      </td>

                      {/* Claimed Account */}
                      <td className="py-3.5 px-4">
                        {inv.claimedByUser ? (
                          <div className="space-y-0.5">
                            <span className="text-xs font-semibold text-paper block">
                              {inv.claimedByUser.fullName}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400 block">
                              {inv.registeredEmail || inv.claimedByUser.email}
                            </span>
                          </div>
                        ) : (
                          <span className="text-zinc-500 text-[11px] italic">
                            Unclaimed
                          </span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-4 text-right text-[11px] text-zinc-400 tabular-nums">
                        {new Date(inv.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => handleCopyLink(inv.token)}
                            className="px-2.5 py-1 bg-[#222222] hover:bg-gold hover:text-ink text-gold border border-gold/40 rounded-xs text-[11px] font-medium transition-colors flex items-center space-x-1 cursor-pointer"
                            title="Copy invitation link"
                          >
                            {copiedToken === inv.token ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>

                          {inv.status === 'PENDING' && (
                            <button
                              type="button"
                              onClick={() => handleRevokeInvite(inv.id)}
                              disabled={actionInProgress === inv.id}
                              className="p-1 bg-[#222222] hover:bg-rose-950 text-zinc-400 hover:text-rose-300 border border-white/10 hover:border-rose-800/40 rounded-xs transition-colors cursor-pointer"
                              title="Revoke invitation"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── TAB 3: GENERATE NEW VIP INVITATION ── */}
        {activeTab === 'create' && (
          <div className="p-6 max-w-2xl mx-auto space-y-6">
            <div className="space-y-1 text-center sm:text-left">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold" />
                <span>Create Pre-Approved Invitation</span>
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                When you generate an invitation for a recipient, their display name and email address
                will be automatically filled on the registration page. If they keep the email, their
                account will be immediately active. If they change it, it will require your approval.
              </p>
            </div>

            {/* Generated Invite Alert Modal / Card */}
            {generatedInvite && (
              <div className="p-5 bg-gradient-to-r from-emerald-950/80 via-[#1C281F] to-emerald-950/80 border border-emerald-500/60 rounded-xs shadow-xl space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-emerald-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="font-bold text-sm">VIP Invitation Ready!</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGeneratedInvite(null)}
                    className="text-zinc-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-zinc-300 space-y-1">
                  <p>
                    Recipient: <strong className="text-white">{generatedInvite.inviteeName}</strong> (
                    <span className="font-mono text-emerald-300">{generatedInvite.inviteeEmail}</span>)
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Share this unique invitation link directly with the recipient:
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-black/60 p-2.5 rounded-xs border border-white/10">
                  <input
                    type="text"
                    readOnly
                    value={generatedInvite.inviteLink}
                    className="w-full bg-transparent text-xs text-gold font-mono focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyLink(generatedInvite.token, generatedInvite.inviteLink)}
                    className="px-3 py-1.5 bg-gold hover:bg-gold-light text-ink font-bold text-xs rounded-xs shrink-0 flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    {copiedToken === generatedInvite.token ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `Assalamu Alaikum ${generatedInvite.inviteeName}. You have been invited to Adorous Fashion Atelier as a VIP patron. Please complete your exclusive registration here: ${generatedInvite.inviteLink}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Share on WhatsApp</span>
                  </a>
                  <span className="text-zinc-600">·</span>
                  <a
                    href={generatedInvite.inviteLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gold-light hover:underline flex items-center gap-1"
                  >
                    <span>Test / Preview Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {/* Error Message */}
            {createError && (
              <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-200 text-xs rounded-xs flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleCreateInvite} className="space-y-4 bg-[#1B1B1B] p-5 rounded-xs border border-white/5 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Recipient Full Name <span className="text-gold">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="e.g. Nusrat Jahan"
                    className="w-full h-10 px-3.5 bg-[#242424] border border-white/15 focus:border-gold rounded-xs text-white placeholder:text-zinc-500 focus:outline-none transition-colors"
                  />
                </div>
                <span className="text-[10px] text-zinc-400 mt-1 block">
                  This will pre-fill the "Full Name" field on their sign-in / registration screen.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Recipient Email Address <span className="text-gold">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="e.g. nusrat@gmail.com"
                    className="w-full h-10 px-3.5 bg-[#242424] border border-white/15 focus:border-gold rounded-xs text-white placeholder:text-zinc-500 focus:outline-none transition-colors font-mono"
                  />
                </div>
                <span className="text-[10px] text-zinc-400 mt-1 block">
                  Pre-fills their email. If they keep this exact email, they get instant access. If they change it, it requires your approval.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Internal Reference / Note <span className="text-zinc-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={inviteNote}
                  onChange={(e) => setInviteNote(e.target.value)}
                  placeholder="e.g. VIP Bridal client / Referral from Director"
                  className="w-full h-10 px-3.5 bg-[#242424] border border-white/15 focus:border-gold rounded-xs text-white placeholder:text-zinc-500 focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isCreatingInvite}
                className="w-full h-11 bg-gold hover:bg-gold-light text-ink font-bold text-xs uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer shadow-md mt-2"
              >
                {isCreatingInvite ? (
                  <span>Generating Secure Link...</span>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Create & Generate VIP Invite Link</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
