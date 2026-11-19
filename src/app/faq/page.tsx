'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, MessageCircle, HelpCircle, ShieldCheck, Truck, RotateCcw, Gem } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqCategory {
  category: string;
  icon: any;
  items: FaqItem[];
}

const FAQ_DATA: FaqCategory[] = [
  {
    category: 'Cash on Delivery & Ordering',
    icon: ShieldCheck,
    items: [
      {
        question: 'Do I have to pay any bKash advance before delivery?',
        answer:
          'No! Cash on Delivery (COD) across all 64 districts requires zero advance payment for standard orders. You pay 100% of your bill directly to the courier delivery agent when the parcel reaches your doorstep.',
      },
      {
        question: 'Can I place an order directly through WhatsApp?',
        answer:
          'Yes, absolutely. Every product detail page and cart view features an "Order via WhatsApp" button with pre-filled details. You can also chat directly with our Adorous desk at +880 15-7773-1381.',
      },
      {
        question: 'Why does Adorous confirm orders via WhatsApp before dispatch?',
        answer:
          'To ensure swift, flawless delivery. Pre-dispatch WhatsApp confirmation allows our team to double-check your exact street address, apartment details, and size selection, eliminating incorrect deliveries and courier delays.',
      },
    ],
  },
  {
    category: 'Delivery & Shipping Charges',
    icon: Truck,
    items: [
      {
        question: 'What are the courier delivery charges?',
        answer:
          'We offer flat-rate transparent delivery: ৳80 within Dhaka, and ৳130 for all other districts across Bangladesh. Furthermore, all orders of ৳2,000 and above qualify for 100% Complimentary Free Delivery.',
      },
      {
        question: 'How long does delivery take?',
        answer:
          'Orders within Dhaka arrive in 24 to 48 hours. Deliveries to district sadars and upazilas across Bangladesh arrive within 48 to 72 hours via our express courier delivery partners.',
      },
      {
        question: 'Can I inspect the parcel before paying the courier rider?',
        answer:
          'Yes. You are fully entitled to inspect the exterior condition of the transit carton, security tamper-evident seals, and invoice before handing payment to the rider.',
      },
    ],
  },
  {
    category: 'Churi Sizing & 7-Day Exchange',
    icon: RotateCcw,
    items: [
      {
        question: 'What if my Churi (bangle) size does not fit?',
        answer:
          'We offer a 7-day doorstep size exchange across Bangladesh. If your bangles are too snug or loose, message our WhatsApp desk within 7 days. Our courier delivers your replacement size and collects the original at your door.',
      },
      {
        question: 'How do I choose between sizes 2-4, 2-6, and 2-8?',
        answer:
          'Because bangles are rigid and slide over the hand knuckles, measure the widest part of your hand knuckles with your fingers pinched together. Size 2-4 fits petite hands (7.0"–7.5" circumference), 2-6 is the standard size for ~70% of Bangladeshi women (7.5"–8.0"), and 2-8 provides comfort for wider hands (8.0"–8.5").',
      },
    ],
  },
  {
    category: 'Quality & Jewelry Care',
    icon: Gem,
    items: [
      {
        question: 'আপনাদের কি ৬ মাসের গ্যারান্টি আছে? / Do you offer an official 6-Month Guarantee?',
        answer:
          'হ্যাঁ, নিশ্চয়ই! প্রতিটি অ্যাডোরেবল জুয়েলারিতে রয়েছে আমাদের অফিসিয়াল ৬ মাসের গ্যারান্টি (6-Month Official Atelier Guarantee)। এর আওতায় অন্তর্ভুক্ত: (১) কালার ও প্লেটিং স্থায়িত্ব—স্বাভাবিক ব্যবহারে ৬ মাসের মধ্যে কালার ফেইড হলে ফ্রি এক্সচেঞ্জ বা পলিশিং; (২) পাথর সেটিং সুরক্ষা—ফিটিং বা ম্যানুফ্যাকচারিং ত্রুটির কারণে পাথর আলগা হলে ফ্রি রিপেয়ার বা পিস রিপ্লেসমেন্ট। ক্লেইম করতে শুধুমাত্র আপনার অর্ডার আইডি ও সমস্যাযুক্ত অংশের ছবি আমাদের হোয়াটসঅ্যাপে (+8801577731381) পাঠালেই ডোরস্টেপ সমাধান পাবেন।',
      },
      {
        question: 'Will the antique gold-tone finish last in Bangladesh humidity?',
        answer:
          'Our brass and alloy pieces are finished with a rich antique gold-tone polish and sealed with a skin-gentle protective coat formulated to help resist oxidation in South Asian festive and humid conditions. To maintain eternal luster, avoid direct spray of perfumes, alcohol sanitizers, and water.',
      },
      {
        question: 'How should I store and care for my accessories?',
        answer:
          'Always store each piece in the micro-suede velvet dust pouch provided inside your rigid keepsake box. Keep away from direct spray of perfumes, hairsprays, and moisture to ensure lifelong brilliance.',
      },
      {
        question: 'Why does Adorous only photograph pieces in still life without human models?',
        answer:
          'We believe in the sovereign dignity of our products. By photographing exclusively on warm limestone plinths, velvet neckforms, and keepsake trays, we let the uncut polki, intricate filigree, and lush velvet speak clearly without the distraction of human models.',
      },
    ],
  },
];

export default function FaqPage() {
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({
    'Cash on Delivery & Ordering-0': true,
    'Delivery & Shipping Charges-0': true,
    'Quality & Jewelry Care-0': true,
  });

  const toggleItem = (category: string, idx: number) => {
    const key = `${category}-${idx}`;
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const allFaqItems = FAQ_DATA.flatMap((cat) => cat.items);
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allFaqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <div className="bg-paper min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* Header */}
      <section className="border-b border-line bg-[#F7F5EE] py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-3">
          <nav className="flex items-center justify-center space-x-2 text-xs text-text-muted tracking-wider uppercase mb-2">
            <Link href="/" className="hover:text-ink transition-colors">Home</Link>
            <span>/</span>
            <span className="text-ink font-medium">FAQ</span>
          </nav>
          <span className="text-[11px] font-semibold tracking-[0.25em] text-gold-ink uppercase block">
            Common Questions Answered
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif text-ink font-normal tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-text-muted max-w-xl mx-auto leading-relaxed">
            Everything you need to know about our Cash on Delivery process, nationwide delivery, sizing, and quality standards.
          </p>
        </div>
      </section>

      {/* Main FAQ Accordions */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
        {FAQ_DATA.map((catGroup) => {
          const IconComponent = catGroup.icon;
          return (
            <section key={catGroup.category} className="space-y-4">
              <div className="flex items-center space-x-2.5 pb-2 border-b border-line text-ink">
                <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center text-gold-deep">
                  <IconComponent className="w-3.5 h-3.5" />
                </div>
                <h2 className="font-serif text-lg sm:text-xl font-medium">
                  {catGroup.category}
                </h2>
              </div>

              <div className="divide-y divide-line border border-line bg-sand/20 rounded-xs">
                {catGroup.items.map((item, idx) => {
                  const key = `${catGroup.category}-${idx}`;
                  const isOpen = !!openItems[key];

                  return (
                    <div key={idx} className="transition-colors">
                      <button
                        type="button"
                        onClick={() => toggleItem(catGroup.category, idx)}
                        className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 text-xs sm:text-sm font-medium text-ink hover:text-gold-deep transition-colors"
                      >
                        <span>{item.question}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-text-muted shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-gold-deep' : ''
                          }`}
                        />
                      </button>

                      <div className={`px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-text-muted leading-relaxed pt-0 ${isOpen ? 'block' : 'hidden'}`}>
                        <p>{item.answer}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Still Have Questions? */}
        <div className="pt-8 border-t border-line text-center space-y-4 p-8 bg-[#FAF7F0] border border-line rounded-xs">
          <h3 className="font-serif text-xl sm:text-2xl text-ink">
            Still Have an Unanswered Question?
          </h3>
          <p className="text-xs text-text-muted max-w-md mx-auto">
            Our Adorous Fashion stylists are available daily on WhatsApp to answer any queries about sizing, fabric matching, or custom gifting.
          </p>
          <a
            href="https://wa.me/8801577731381?text=Hello%20Adorous%20Fashion,%20I%20have%20a%20question."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gold hover:bg-gold-light text-ink text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shadow-sm"
          >
            <MessageCircle className="w-4 h-4 text-emerald-800" />
            <span>Chat Directly on WhatsApp</span>
          </a>
        </div>
      </main>
    </div>
  );
}
