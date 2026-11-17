import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Truck, RotateCcw, MessageCircle, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | Adorous Fashion',
  description: 'Terms of service, sales policy, Cash on Delivery procedures, and customer agreements for Adorous Fashion Bangladesh.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsPage() {
  return (
    <div className="bg-paper text-ink min-h-screen py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="border-b border-line pb-8 mb-10">
          <div className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-[0.2em] text-gold-deep mb-3">
            <FileText className="w-4 h-4" />
            <span>Legal & Studio Policy</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-ink">
            Terms of Service & Customer Agreement
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-ink/70">
            Last Updated: November 2026 · Operating under Bangladesh E-Commerce Guidelines
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-sm leading-relaxed text-ink/85">
          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-ink font-semibold">
              1. Overview & Brand Identity
            </h2>
            <p>
              Welcome to Adorous Fashion (accessible at{' '}
              <Link href="/" className="text-gold-deep underline">
                adorousfashion.store
              </Link>
              ). Adorous Fashion is a luxury direct-to-consumer boutique studio based in Bangladesh, curating handcrafted South Asian bridal suites, velvet churi bangles, luxury bags, and fashion accessories.
            </p>
            <p>
              By accessing our storefront or placing an order through our website or official WhatsApp channel, you agree to comply with and be bound by the following terms and conditions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-ink font-semibold">
              2. Cash on Delivery (COD) & Order Confirmation
            </h2>
            <p>
              To protect both our patrons and our studio logistics, all orders placed through the website are subjected to a mandatory verification protocol:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>WhatsApp Order Confirmation:</strong> Our atelier concierge contacts you via WhatsApp (+8801577731381) to verify delivery address, product selections, and sizing (especially for churi stacks).
              </li>
              <li>
                <strong>Dispatch Commitment:</strong> Unverified orders without an active contact number or confirmation response will not be dispatched.
              </li>
              <li>
                <strong>Payment on Delivery:</strong> For Cash on Delivery parcels, the full payable amount in Bangladeshi Taka (৳ BDT) must be handed over to the courier representative upon delivery.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-ink font-semibold">
              3. Delivery Timelines & Charges
            </h2>
            <p>
              We provide delivery coverage across all 64 districts of Bangladesh through reputable nationwide logistics partners (including Steadfast and Pathao Courier):
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Inside Dhaka Metro:</strong> 1–2 business days (Standard shipping fee: ৳80).
              </li>
              <li>
                <strong>Outside Dhaka (Nationwide):</strong> 2–4 business days (Standard shipping fee: ৳130).
              </li>
              <li>
                Weather disruptions or festive peak seasons (Eid, Puja, Wedding seasons) may result in minor courier delays beyond our direct control.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-ink font-semibold">
              4. 7-Day Exchange &amp; 6-Month Color Warranty
            </h2>
            <p>
              We maintain meticulous quality inspection prior to packaging. In the rare event of transit damage, sizing discrepancy, or plating issues:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Clients are requested to inspect the parcel exterior upon receipt and contact us within 24 hours if a transit defect is observed.
              </li>
              <li>
                Unworn pieces in original luxury packaging with seals intact qualify for a 7-day size or style exchange.
              </li>
              <li>
                <strong>6-Month Color Assurance:</strong> Authentic electroplated pieces are covered by a 6-month color assurance against premature fading under standard non-chemical wear.
              </li>
              <li>
                Full policy details are accessible at{' '}
                <Link href="/returns-exchange" className="text-gold-deep underline">
                  Returns & Exchange Policy
                </Link>
                .
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-ink font-semibold">
              5. Intellectual Property & Photography Policy
            </h2>
            <p>
              All still-life imagery, product photography, text descriptions, branding assets, and software code on adorousfashion.store are the exclusive intellectual property of Adorous Fashion.
            </p>
            <p>
              In accordance with our strict brand ethos, all visual assets consist exclusively of high-end still-life product photography (warm stone architectural plinths, velvet display stands, and macro craftsmanship details). Unauthorized replication, scraping, or commercial reuse of our media is strictly prohibited.
            </p>
          </section>

          <section className="space-y-3 border-t border-line pt-6">
            <h2 className="font-serif text-xl sm:text-2xl text-ink font-semibold">
              6. Studio Contact & Official Inquiries
            </h2>
            <p>For inquiries regarding our terms, custom orders, or corporate gifting suites:</p>
            <div className="bg-sand/40 border border-line p-5 rounded-[2px] space-y-2 text-xs sm:text-sm">
              <p>
                <strong>Studio Concierge:</strong> Adorous Fashion Atelier
              </p>
              <p>
                <strong>Phone & Tel:</strong>{' '}
                <a href="tel:+8801577731381" className="text-gold-deep hover:underline">
                  +880 15-7773-1381
                </a>
              </p>
              <p>
                <strong>WhatsApp:</strong>{' '}
                <a
                  href="https://wa.me/8801577731381"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-deep hover:underline"
                >
                  +880 15-7773-1381
                </a>
              </p>
              <p>
                <strong>Email:</strong>{' '}
                <a href="mailto:support@adorousfashion.store" className="text-gold-deep hover:underline">
                  support@adorousfashion.store
                </a>
              </p>
              <p>
                <strong>Studio Location:</strong> Rajshahi, Bangladesh (Serving all 64 districts)
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
