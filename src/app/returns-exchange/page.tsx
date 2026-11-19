import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { RotateCcw, ShieldCheck, Check, Clock, AlertCircle, MessageCircle, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: '7-Day Doorstep Exchange & 6-Month Guarantee',
  description:
    'Hassle-free 7-day doorstep size and style exchange policy across Bangladesh with our official 6-Month Guarantee on all artisan jewelry and Churi bangles.',
  alternates: {
    canonical: 'https://adorousfashion.store/returns-exchange',
  },
  openGraph: {
    title: '7-Day Doorstep Exchange & 6-Month Guarantee | Adorous Fashion',
    description:
      'Hassle-free 7-day doorstep size and style exchange policy across Bangladesh with our official 6-Month Guarantee on all artisan jewelry and Churi bangles.',
    url: 'https://adorousfashion.store/returns-exchange',
    siteName: 'Adorous Fashion',
    images: [
      {
        url: '/images/hero/hero-still-life.jpg',
        width: 1200,
        height: 675,
        alt: 'Adorous Fashion 7-Day Exchange & 6-Month Guarantee Policy',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '7-Day Doorstep Exchange & 6-Month Guarantee | Adorous Fashion',
    description:
      'Hassle-free 7-day doorstep size and style exchange policy across Bangladesh with our official 6-Month Guarantee on all artisan jewelry.',
    images: ['/images/hero/hero-still-life.jpg'],
  },
};

export default function ReturnsExchangePage() {
  return (
    <div className="bg-paper min-h-screen">
      {/* Header */}
      <section className="border-b border-line bg-[#F7F5EE] py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-3">
          <nav className="flex items-center justify-center space-x-2 text-xs text-text-muted tracking-wider uppercase mb-2">
            <Link href="/" className="hover:text-ink transition-colors">Home</Link>
            <span>/</span>
            <span className="text-ink font-medium">Returns & Exchange</span>
          </nav>
          <span className="text-[11px] font-semibold tracking-[0.25em] text-gold-ink uppercase block">
            Confidence & Peace of Mind
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif text-ink font-normal tracking-tight">
            7-Day Doorstep Exchange Policy
          </h1>
          <p className="text-xs sm:text-sm text-text-muted max-w-xl mx-auto leading-relaxed">
            We want you to adore your jewellery and accessories without hesitation. If the fit, color, or style isn't perfect, we arrange doorstep exchange across Bangladesh.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12 text-xs sm:text-sm text-text-muted">
        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-sand/30 border border-line rounded-xs space-y-2">
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold-deep mb-3">
              <RotateCcw className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-base text-ink font-medium">7-Day Window</h3>
            <p className="text-xs leading-relaxed">
              Notify our team within 7 calendar days of courier delivery to initiate an exchange.
            </p>
          </div>

          <div className="p-6 bg-sand/30 border border-line rounded-xs space-y-2">
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold-deep mb-3">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-base text-ink font-medium">Doorstep Pickup</h3>
            <p className="text-xs leading-relaxed">
              No need to visit courier branches. The courier brings the replacement and collects the original at your door.
            </p>
          </div>

          <div className="p-6 bg-sand/30 border border-line rounded-xs space-y-2">
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold-deep mb-3">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-base text-ink font-medium">Guaranteed Churi Fit</h3>
            <p className="text-xs leading-relaxed">
              Ordered 2-6 but need 2-4 or 2-8? We swap bangle sizes promptly with zero fuss.
            </p>
          </div>
        </div>

        {/* ৬ মাসের গ্যারান্টি (6-Month Official Atelier Guarantee) Banner */}
        <section className="p-6 sm:p-8 bg-sand/40 border border-gold/40 rounded-xs space-y-4">
          <div className="flex items-center space-x-2.5 text-gold-deep">
            <ShieldCheck className="w-5 h-5 text-gold-deep shrink-0" />
            <span className="text-[11px] font-semibold tracking-wider text-gold-ink uppercase">
              Official Quality Promise · অফিসিয়াল গুণগত নিশ্চয়তা
            </span>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-serif text-ink font-medium">
              ৬ মাসের গ্যারান্টি (6-Month Official Atelier Guarantee)
            </h2>
            <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed">
              অ্যাডোরেবল ফ্যাশনের প্রতিটি জুয়েলারি তৈরিতে ব্যবহার করা হয় প্রিমিয়াম অ্যান্টিক গোল্ড-ফিনিশ কোটিং এবং সূক্ষ্ম হ্যান্ড-সেটিং। আমাদের প্রতিটি পিসের সাথে গ্রাহক পাচ্ছেন পূর্ণ ৬ মাসের নিশ্চয়তা:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs text-ink/90">
            <div className="flex items-start gap-2.5 bg-paper p-3.5 border border-line rounded-xs">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-ink font-semibold">১. কালার ও প্লেটিং স্থায়িত্ব (Color Longevity):</strong>
                <span className="text-text-muted">স্বাভাবিক ব্যবহারে ৬ মাসের মধ্যে দৃশ্যমান কোনো কালার ফেইড বা ডিসকালারেশন হলে বিনামূল্যে রিপ্লেসমেন্ট বা সার্ভিসিং।</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-paper p-3.5 border border-line rounded-xs">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-ink font-semibold">২. পাথর সেটিং ও কারিগরী সুরক্ষা (Stone Setting &amp; Craft):</strong>
                <span className="text-text-muted">ফিটিং বা ম্যানুফ্যাকচারিং কোনো ত্রুটির কারণে পাথর আলগা হলে আমাদের নিজস্ব কারিগর দ্বারা ফ্রি মেরামত বা পিস রিপ্লেসমেন্ট।</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-paper p-3.5 border border-line rounded-xs">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-ink font-semibold">৩. সহজ হোয়াটসঅ্যাপ ক্লেইম (Easy WhatsApp Claim):</strong>
                <span className="text-text-muted">কোনো জটিল শর্ত নেই। শুধুমাত্র অর্ডার আইডি এবং সমস্যাযুক্ত পিসের ছবি আমাদের অফিসিয়াল হোয়াটসঅ্যাপে (+8801577731381) পাঠালেই সমাধান।</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-paper p-3.5 border border-line rounded-xs">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-ink font-semibold">৪. ডোরস্টেপ রিপ্লেসমেন্ট সুবিধা (Doorstep Pickup):</strong>
                <span className="text-text-muted">কুরিয়ার অফিসে গিয়ে ভোগান্তি পোহাতে হবে না; কুরিয়ার ডেলিভারিম্যান আপনার বাসায় নতুন পিস পৌঁছে দিয়ে পুরাতন পিস সংগ্রহ করবে।</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-text-muted italic pt-1 border-t border-line/60">
            * ব্যবহারের শর্তাবলী: উৎসব বা ঘরোয়া সাধারণ ব্যবহারে এই গ্যারান্টি পূর্ণ কার্যকর। প্রটেক্টিভ কোটিং ও পাথরের দীর্ঘস্থায়িত্ব রক্ষার জন্য পারফিউম স্প্রে, স্যানিটাইজার বা সরাসরি পানির দীর্ঘ সংস্পর্শ পরিহার করুন এবং অসাবধানতাবশত আছাড় লেগে ভেঙে ফেলা বা বিকৃত করা থেকে বিরত থাকুন।
          </p>
        </section>

        {/* Section 1: How Doorstep Exchange Works */}
        <section className="space-y-4 pt-4 border-t border-line">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold tracking-wider text-gold-ink uppercase">
              Step-by-Step
            </span>
            <h2 className="text-xl sm:text-2xl font-serif text-ink">
              How to Request an Exchange
            </h2>
          </div>

          <div className="space-y-3 bg-[#FAF7F0] p-6 border border-line rounded-xs">
            <div className="flex items-start space-x-3">
              <span className="w-6 h-6 rounded-full bg-sand text-gold-deep text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <div>
                <strong className="text-ink text-xs sm:text-sm block">Message Our WhatsApp Desk</strong>
                <p className="text-xs text-text-muted mt-0.5">
                  Send a message to <strong>+880 15-7773-1381</strong> with your Order ID (e.g. AF-2026-10001) and the reason for exchange (e.g. "Need size 2-8 instead of 2-6").
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="w-6 h-6 rounded-full bg-sand text-gold-deep text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <div>
                <strong className="text-ink text-xs sm:text-sm block">Review & Replacement Prep</strong>
                <p className="text-xs text-text-muted mt-0.5">
                  Our stylist confirms availability of the replacement piece, inspects it, and prepares a new dispatch parcel within 24 hours.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="w-6 h-6 rounded-full bg-sand text-gold-deep text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                3
              </span>
              <div>
                <strong className="text-ink text-xs sm:text-sm block">Doorstep Swap via Courier Rider</strong>
                <p className="text-xs text-text-muted mt-0.5">
                  Our delivery partner (Steadfast / Pathao) arrives with your new item. You hand over the original boxed item to the rider upon receiving the replacement.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Eligibility Criteria */}
        <section className="space-y-4 pt-4 border-t border-line">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold tracking-wider text-gold-ink uppercase">
              Guidelines
            </span>
            <h2 className="text-xl sm:text-2xl font-serif text-ink">
              Exchange Eligibility Guidelines
            </h2>
          </div>

          <p className="leading-relaxed">
            To qualify for an exchange, items must meet the following simple conditions:
          </p>

          <ul className="space-y-2">
            <li className="flex items-start space-x-2">
              <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span><strong>Unworn & Pristine:</strong> Accessories must not show scratches, perfume spray residue, or signs of wear.</span>
            </li>
            <li className="flex items-start space-x-2">
              <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span><strong>Complete Packaging:</strong> Must be returned in the original rigid warm stone keepsake box with velvet pouches and tags.</span>
            </li>
            <li className="flex items-start space-x-2">
              <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span><strong>Notification Period:</strong> Initial notification must be sent within 7 calendar days of receipt.</span>
            </li>
          </ul>
        </section>

        {/* Section 3: Damaged or Incorrect Items */}
        <section className="space-y-4 pt-4 border-t border-line">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold tracking-wider text-gold-ink uppercase">
              100% Protection
            </span>
            <h2 className="text-xl sm:text-2xl font-serif text-ink">
              Transit Damage or Defect Guarantee
            </h2>
          </div>

          <p className="leading-relaxed">
            In the rare event that a transit mishap occurs and your piece arrives damaged or defective, Adorous covers 100% of return courier costs and dispatches an immediate brand-new replacement at zero cost to you. Simply take a quick photo or video upon unboxing and send it to our WhatsApp desk within 24 hours.
          </p>
        </section>

        {/* CTA */}
        <div className="pt-8 border-t border-line text-center space-y-4">
          <h3 className="font-serif text-xl text-ink">Ready to initiate an exchange?</h3>
          <p className="text-xs text-text-muted max-w-md mx-auto">
            Our Adorous Customer Care Team is available daily from 10:00 AM to 10:00 PM BST.
          </p>
          <a
            href="https://wa.me/8801577731381?text=Hi%20Adorous%20Fashion,%20I%20would%20like%20to%20request%20an%20exchange%20for%20my%20order."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-sand hover:bg-black text-gold-deep text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shadow-sm"
          >
            <MessageCircle className="w-4 h-4 text-whatsapp" />
            <span>Initiate Exchange via WhatsApp</span>
          </a>
        </div>
      </main>
    </div>
  );
}
