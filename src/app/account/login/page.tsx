'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import {
  Lock,
  Phone,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/account';

  const { customer, login, register, isLoading } = useCustomerAuth();

  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sign In Form State
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Register Form State
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDistrict, setRegDistrict] = useState('Dhaka');
  const [regAddress, setRegAddress] = useState('');
  const [regWhatsapp, setRegWhatsapp] = useState(true);

  // If already logged in, redirect immediately
  useEffect(() => {
    if (customer && !isLoading) {
      router.push(redirectPath);
    }
  }, [customer, isLoading, redirectPath, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!signInIdentifier.trim()) {
      setErrorMsg('Please enter your phone number or email address.');
      return;
    }
    if (!signInPassword) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    const res = await login(signInIdentifier.trim(), signInPassword);
    setIsSubmitting(false);

    if (res.success) {
      router.push(redirectPath);
    } else {
      setErrorMsg(res.error || 'Invalid credentials. Please try again.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!regFullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!regPhone.trim()) {
      setErrorMsg('Please enter your mobile phone number.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    const res = await register({
      fullName: regFullName.trim(),
      phone: regPhone.trim(),
      email: regEmail.trim() || undefined,
      password: regPassword,
      district: regDistrict,
      address: regAddress.trim() || undefined,
      whatsappUpdates: regWhatsapp,
    });
    setIsSubmitting(false);

    if (res.success) {
      router.push(redirectPath);
    } else {
      setErrorMsg(res.error || 'Failed to create your account.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-paper">
      <div className="max-w-md w-full space-y-6">
        {/* Header / Brand Wordmark */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex flex-col items-center group">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-gold/50 shadow-sm shrink-0 bg-sand p-0.5 group-hover:scale-105 transition-transform">
              <Image
                src="/images/logo/logo-monogram.png"
                alt="Adorous Monogram"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-serif text-2xl tracking-[0.2em] font-semibold text-ink uppercase mt-2 block leading-none">
              Adorous
            </span>
            <span className="font-sans text-[9px] tracking-[0.3em] text-text-muted uppercase block font-medium mt-1">
              Client Portal
            </span>
          </Link>

          <p className="text-xs text-text-muted pt-1">
            {mode === 'signin'
              ? 'Sign in to access your order history, live parcel tracking, and saved delivery addresses.'
              : 'Create an Adorous account for 1-click fast checkout and real-time delivery status.'}
          </p>
        </div>

        {/* Auth Mode Tabs */}
        <div className="grid grid-cols-2 p-1 bg-sand/80 border border-line rounded-[2px] text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
            }}
            className={`py-2 text-center rounded-[2px] tracking-wider uppercase transition-all ${
              mode === 'signin'
                ? 'bg-paper text-ink font-semibold shadow-xs border border-line/60'
                : 'text-text-muted hover:text-ink'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
            }}
            className={`py-2 text-center rounded-[2px] tracking-wider uppercase transition-all ${
              mode === 'register'
                ? 'bg-paper text-ink font-semibold shadow-xs border border-line/60'
                : 'text-text-muted hover:text-ink'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-[2px] flex items-start space-x-2 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ── Sign In Form ── */}
        {mode === 'signin' ? (
          <form onSubmit={handleSignIn} className="bg-sand/30 border border-line p-6 rounded-[2px] space-y-4 shadow-sm">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-ink mb-1.5">
                Phone Number or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={signInIdentifier}
                  onChange={(e) => setSignInIdentifier(e.target.value)}
                  placeholder="01712345678 or email@example.com"
                  autoComplete="username"
                  required
                  className="w-full h-11 pl-3.5 pr-10 bg-paper border border-line rounded-[2px] text-xs text-ink placeholder:text-text-muted focus:outline-none focus:border-gold transition-colors font-mono"
                />
                <Phone className="w-4 h-4 text-text-muted absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <span className="text-[10px] text-text-muted mt-1 block">
                Enter your 11-digit mobile number or account email.
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-medium uppercase tracking-wider text-ink">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] text-gold-deep hover:underline flex items-center gap-1"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full h-11 pl-3.5 pr-10 bg-paper border border-line rounded-[2px] text-xs text-ink placeholder:text-text-muted focus:outline-none focus:border-gold transition-colors"
                />
                <Lock className="w-4 h-4 text-text-muted absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-ink hover:bg-gold-deep text-paper font-semibold text-xs uppercase tracking-widest rounded-[2px] transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 shadow-sm mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-gold" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center text-xs text-text-muted">
              <span>Don't have an account yet? </span>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg(null);
                }}
                className="text-gold-deep font-semibold hover:underline"
              >
                Register now
              </button>
            </div>
          </form>
        ) : (
          /* ── Registration Form ── */
          <form onSubmit={handleRegister} className="bg-sand/30 border border-line p-6 rounded-[2px] space-y-4 shadow-sm">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-ink mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="e.g. Nusrat Jahan"
                  autoComplete="name"
                  required
                  className="w-full h-11 pl-3.5 pr-10 bg-paper border border-line rounded-[2px] text-xs text-ink placeholder:text-text-muted focus:outline-none focus:border-gold transition-colors"
                />
                <User className="w-4 h-4 text-text-muted absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-ink mb-1.5">
                Bangladeshi Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  autoComplete="tel"
                  required
                  className="w-full h-11 pl-3.5 pr-10 bg-paper border border-line rounded-[2px] text-xs text-ink placeholder:text-text-muted focus:outline-none focus:border-gold transition-colors font-mono"
                />
                <Phone className="w-4 h-4 text-text-muted absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <span className="text-[10px] text-text-muted mt-1 block">
                Used for courier delivery confirmation and WhatsApp tracking updates.
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-ink mb-1.5">
                Email Address <span className="text-text-muted text-[10px] font-normal lowercase">(optional)</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="nusrat@example.com"
                  autoComplete="email"
                  className="w-full h-11 pl-3.5 pr-10 bg-paper border border-line rounded-[2px] text-xs text-ink placeholder:text-text-muted focus:outline-none focus:border-gold transition-colors"
                />
                <Mail className="w-4 h-4 text-text-muted absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-medium uppercase tracking-wider text-ink">
                  Password <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] text-gold-deep hover:underline flex items-center gap-1"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="w-full h-11 pl-3.5 pr-10 bg-paper border border-line rounded-[2px] text-xs text-ink placeholder:text-text-muted focus:outline-none focus:border-gold transition-colors"
                />
                <Lock className="w-4 h-4 text-text-muted absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Optional Fast Address Setup */}
            <div className="pt-2 border-t border-line/60 space-y-3">
              <span className="text-[10px] font-medium tracking-wider uppercase text-gold-deep block">
                Primary Delivery Address (Optional for 1-Click Checkout)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-text-muted mb-1">
                    District
                  </label>
                  <select
                    value={regDistrict}
                    onChange={(e) => setRegDistrict(e.target.value)}
                    className="w-full h-10 px-3 bg-paper border border-line rounded-[2px] text-xs text-ink focus:outline-none focus:border-gold"
                  >
                    <option value="Dhaka">Dhaka (Inside Dhaka ৳70)</option>
                    <option value="Gazipur">Gazipur (৳130)</option>
                    <option value="Narayanganj">Narayanganj (৳130)</option>
                    <option value="Chittagong">Chittagong (৳130)</option>
                    <option value="Rajshahi">Rajshahi (৳130)</option>
                    <option value="Sylhet">Sylhet (৳130)</option>
                    <option value="Khulna">Khulna (৳130)</option>
                    <option value="Barisal">Barisal (৳130)</option>
                    <option value="Rangpur">Rangpur (৳130)</option>
                    <option value="Mymensingh">Mymensingh (৳130)</option>
                    <option value="Other District">All Other 64 Districts (৳130)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-text-muted mb-1">
                    Street Address / Thana
                  </label>
                  <input
                    type="text"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="House, Road, Area"
                    className="w-full h-10 px-3 bg-paper border border-line rounded-[2px] text-xs text-ink placeholder:text-text-muted focus:outline-none focus:border-gold"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="whatsappUpdates"
                checked={regWhatsapp}
                onChange={(e) => setRegWhatsapp(e.target.checked)}
                className="w-4 h-4 rounded-[2px] accent-gold cursor-pointer"
              />
              <label htmlFor="whatsappUpdates" className="text-xs text-text-muted cursor-pointer">
                Send live dispatch & courier tracking updates via WhatsApp
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-gold hover:bg-gold-light text-ink font-semibold text-xs uppercase tracking-widest rounded-[2px] transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 shadow-sm mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-ink" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center text-xs text-text-muted">
              <span>Already have an account? </span>
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                }}
                className="text-gold-deep font-semibold hover:underline"
              >
                Sign in here
              </button>
            </div>
          </form>
        )}

        {/* Trust Badges */}
        <div className="flex items-center justify-center space-x-6 text-[11px] text-text-muted pt-4 border-t border-line/60">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted Session</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <ShoppingBag className="w-4 h-4 text-gold-deep" />
            <span>1-Click Fast Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-gold animate-spin" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
