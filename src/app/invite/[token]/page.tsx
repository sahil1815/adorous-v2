import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getInvitationByTokenAction } from '@/app/actions/accessActions';
import { ShieldAlert, ArrowRight, Home } from 'lucide-react';

interface InvitePageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const res = await getInvitationByTokenAction(token);

  if (res.success && res.invitation) {
    // Redirect to the login/registration page with the invite token attached
    redirect(`/account/login?invite=${encodeURIComponent(token)}`);
  }

  // If invalid, revoked, or already claimed
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-paper">
      <div className="max-w-md w-full text-center space-y-6 bg-sand/40 border border-line p-8 rounded-[2px] shadow-sm">
        {/* Monogram */}
        <div className="w-14 h-14 rounded-full overflow-hidden border border-gold/50 mx-auto bg-sand p-0.5 shadow-sm">
          <Image
            src="/images/logo/logo-monogram.png"
            alt="Adorous Monogram"
            width={56}
            height={56}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-2">
          <span className="p-2 bg-amber-500/10 text-amber-700 rounded-full inline-flex border border-amber-500/20">
            <ShieldAlert className="w-5 h-5" />
          </span>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-ink uppercase">
            Invitation Notice
          </h1>
          <p className="text-xs text-text-muted leading-relaxed">
            {res.error || 'This invitation link is invalid, has expired, or has already been claimed.'}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 bg-paper hover:bg-sand border border-line text-ink text-xs font-semibold uppercase tracking-wider rounded-[2px] transition-colors inline-flex items-center justify-center space-x-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Store</span>
          </Link>

          <Link
            href="/account/login"
            className="w-full sm:w-auto px-5 py-2.5 bg-ink hover:bg-gold-deep text-paper text-xs font-semibold uppercase tracking-wider rounded-[2px] transition-colors inline-flex items-center justify-center space-x-1.5"
          >
            <span>Client Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
