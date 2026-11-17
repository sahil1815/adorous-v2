import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Lock, ShieldCheck, Mail, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Adorous Fashion',
  description: 'Privacy policy and customer data protection standards for Adorous Fashion Bangladesh.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="bg-paper text-ink min-h-screen py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="border-b border-line pb-8 mb-10">
          <div className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-[0.2em] text-gold-deep mb-3">
            <Lock className="w-4 h-4" />
            <span>Customer Privacy & Data Protection</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-ink">
            Privacy Policy
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-ink/70">
            Effective Date: November 2026 · Committed to absolute privacy and zero third-party data brokerage
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-sm leading-relaxed text-ink/85">
          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-ink font-semibold">
              1. Information We Collect
            </h2>
            <p>
              When you purchase pieces or interact with Adorous Fashion, we collect only the necessary information required to confirm, assemble, and deliver your order:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Recipient Details:</strong> Full name, delivery street address, and district.
              </li>
              <li>
                <strong>Communication Channels:</strong> WhatsApp phone number and primary telephone contact for dispatch coordination.
              </li>
              <li>
                <strong>Optional Account Info:</strong> Email address for digital receipts and order tracking notifications.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-ink font-semibold">
              2. How Your Information Is Used
            </h2>
            <p>Your details are used exclusively for:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Verifying order details and wrist measurements / bangles sizing via WhatsApp.</li>
              <li>Generating delivery manifests for certified courier partners (Pathao/Steadfast).</li>
              <li>Providing real-time parcel transit updates and SMS notifications.</li>
            </ul>
            <p className="font-medium text-ink">
              We never sell, rent, or lease your personal information to third-party marketing firms or data brokers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-ink font-semibold">
              3. Data Security & Storage
            </h2>
            <p>
              All customer sessions and checkout communications are encrypted with SSL/TLS protocols. Order records are stored within secured database environments adhering to strict access controls.
            </p>
          </section>

          <section className="space-y-3 border-t border-line pt-6">
            <h2 className="font-serif text-xl sm:text-2xl text-ink font-semibold">
              4. Inquiries & Data Rights
            </h2>
            <p>
              If you wish to review, modify, or request deletion of your contact records, please contact our privacy officer directly:
            </p>
            <div className="bg-sand/40 border border-line p-5 rounded-[2px] space-y-2 text-xs sm:text-sm">
              <p>
                <strong>Privacy Officer:</strong> Adorous Fashion Concierge
              </p>
              <p>
                <strong>Email:</strong>{' '}
                <a href="mailto:support@adorousfashion.store" className="text-gold-deep hover:underline">
                  support@adorousfashion.store
                </a>
              </p>
              <p>
                <strong>Phone:</strong>{' '}
                <a href="tel:+8801577731381" className="text-gold-deep hover:underline">
                  +880 15-7773-1381
                </a>
              </p>
              <p>
                <strong>Studio Address:</strong> Rajshahi, Bangladesh
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
