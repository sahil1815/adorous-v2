'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { adminLogin } from '@/app/actions/authActions';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { Lock, Key, ShieldAlert, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAdminAuth();

  const [username, setUsername] = useState('admin');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to /admin immediately
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/admin');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const result = await adminLogin(pin, username);
    if (result.success) {
      // Small delay for UI smoothness
      setTimeout(() => {
        // We use window.location.href here to force a hard reload so the layout
        // fetches the fresh session properly.
        window.location.href = '/admin';
      }, 400);
    } else {
      setErrorMsg(result.error || 'Access denied. Invalid credentials.');
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = () => {
    setUsername('admin');
    setPin('adorous2026');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0E0E0E] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <span className="text-xs uppercase tracking-widest text-gold-light/60">Verifying Admin Security...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-paper flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-b from-gold/10 via-gold/5 to-transparent blur-3xl pointer-events-none" />

      {/* Top Brand Bar */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between text-xs text-paper/40">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-gold" />
          <span>Admin Secure Terminal</span>
        </div>
        <span className="font-mono text-[11px]">v2.6.4 · SSL Protected</span>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md mx-auto w-full my-auto">
        <div className="bg-[#171717] border border-gold/30 p-8 sm:p-10 rounded-[2px] shadow-2xl relative space-y-6">
          {/* Logo & Seal */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gold/40 mx-auto bg-black p-1 shadow-lg">
              <Image
                src="/images/logo/logo-monogram.png"
                alt="Adorous Admin"
                width={64}
                height={64}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <h1 className="font-serif text-2xl tracking-[0.16em] uppercase text-gold font-semibold">
                Adorous Admin
              </h1>
              <span className="text-[11px] font-sans tracking-[0.2em] text-paper/60 uppercase block mt-1">
                Dhaka Operations & Dispatch Desk
              </span>
            </div>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="p-3.5 bg-red-950/80 border border-red-800/80 text-red-200 text-xs rounded-xs flex items-start space-x-2.5 animate-shake">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-paper/70 block">
                Admin Staff ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full h-11 px-3.5 bg-[#222222] border border-gold/30 rounded-xs text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold text-xs transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-paper/70 block">
                Master Security Passcode / PIN
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-3.5 pr-10 bg-[#222222] border border-gold/30 rounded-xs text-paper placeholder:text-paper/30 focus:outline-none focus:border-gold text-xs font-mono tracking-widest transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-paper/50 hover:text-gold transition-colors"
                  aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-gold hover:bg-gold-light text-ink font-semibold text-xs tracking-wider uppercase rounded-xs transition-all flex items-center justify-center space-x-2 mt-2 shadow-md disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Authorizing Session...</span>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-ink" />
                  <span>Enter Operations Portal</span>
                  <ArrowRight className="w-3.5 h-3.5 text-ink" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Chip */}
          <div className="pt-3 border-t border-white/10 text-center">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="text-[11px] text-gold-light/70 hover:text-gold hover:underline transition-colors flex items-center justify-center gap-1.5 mx-auto"
            >
              <Key className="w-3.5 h-3.5 text-gold" />
              <span>Quick Demo Fill (admin / adorous2026)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Legal / Security Notice */}
      <div className="max-w-md mx-auto w-full text-center text-[10px] text-paper/40 space-y-1">
        <p>© {new Date().getFullYear()} Adorous Fashion Ltd. Restricted Admin Access.</p>
        <p className="text-paper/30">
          Unauthorized inspection or penetration testing attempts are logged.
        </p>
      </div>
    </div>
  );
}
