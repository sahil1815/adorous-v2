'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Clock, ShieldAlert, MessageCircle, Home, LogIn, ArrowRight } from 'lucide-react';

function PendingContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') || 'public_signup';
  const email = searchParams.get('email');
  const originalEmail = searchParams.get('originalEmail');
  const name = searchParams.get('name');

  const isEmailModified = reason === 'email_modified';

  // Construct pre-filled WhatsApp message
  const waText = isEmailModified
    ? `Assalamu Alaikum Adorous Owner. I received an invitation for ${originalEmail || 'my email'} and registered my account under ${email || 'my new email'}. Kindly approve my account access.`
    : `Assalamu Alaikum Adorous Owner. I registered a new patron account under ${email || 'my email'} (${name || ''}). Kindly review and approve my account access.`;

  const waLink = `https://wa.me/8801577731381?text=${encodeURIComponent(waText)}`;

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-paper">
      <div className="max-w-lg w-full space-y-6 bg-sand/30 border border-line p-8 sm:p-10 rounded-[2px] shadow-sm text-center">
        {/* Monogram Seal */}
        <div className="w-16 h-16 rounded-full overflow-hidden border border-gold/50 mx-auto bg-sand p-1 shadow-sm">
          <Image
            src="/images/logo/logo-monogram.png"
            alt="Adorous Monogram"
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Badge & Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-800 border border-amber-600/30">
            <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
            <span>Account Pending Owner Approval</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-ink uppercase">
            Atelier Access Verification
          </h1>

          <p className="text-xs text-text-muted max-w-md mx-auto leading-relaxed pt-1">
            {isEmailModified ? (
              <>
                Your invitation was originally authorized for{' '}
                <strong className="text-ink font-semibold font-mono">{originalEmail}</strong>, but
                you registered using{' '}
                <strong className="text-ink font-semibold font-mono">{email}</strong>. To ensure
                security and client verification, the owner must manually approve this account
                before access is granted.
              </>
            ) : (
              <>
                Thank you for creating an account at Adorous. To preserve our personalized boutique
                experience, all new accounts are verified and accepted by the owner before access is
                enabled.
              </>
            )}
          </p>
        </div>

        {/* Summary Details Box */}
        {(email || name) && (
          <div className="bg-paper border border-line p-4 rounded-[2px] text-xs text-left space-y-2">
            <span className="text-[10px] font-bold text-gold-deep uppercase tracking-wider block">
              Submitted Account Details
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {name && (
                <div>
                  <span className="text-[10px] text-text-muted block">Full Name</span>
                  <span className="font-semibold text-ink">{name}</span>
                </div>
              )}
              {email && (
                <div>
                  <span className="text-[10px] text-text-muted block">Registered Email</span>
                  <span className="font-semibold text-ink font-mono truncate block">{email}</span>
                </div>
              )}
            </div>
            {isEmailModified && originalEmail && (
              <div className="pt-2 border-t border-line/60 flex items-center justify-between text-[11px]">
                <span className="text-text-muted">Original Invite:</span>
                <span className="font-mono text-zinc-500 line-through">{originalEmail}</span>
              </div>
            )}
          </div>
        )}

        {/* Owner Contact Card */}
        <div className="pt-2 space-y-3">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-11 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs uppercase tracking-wider rounded-[2px] transition-colors flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Message Owner on WhatsApp for Quick Approval</span>
          </a>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <Link
              href="/"
              className="h-10 bg-paper hover:bg-sand border border-line text-ink text-xs font-semibold uppercase tracking-wider rounded-[2px] transition-colors inline-flex items-center justify-center space-x-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Browse Store</span>
            </Link>

            <Link
              href="/account/login"
              className="h-10 bg-[#1A1A1A] hover:bg-gold-deep text-paper text-xs font-semibold uppercase tracking-wider rounded-[2px] transition-colors inline-flex items-center justify-center space-x-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>

        {/* Security Notice */}
        <p className="text-[10px] text-text-muted border-t border-line/60 pt-4">
          Once the owner accepts your account, you will be able to log in immediately with your
          password.
        </p>
      </div>
    </div>
  );
}

export default function AccountPendingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PendingContent />
    </Suspense>
  );
}
