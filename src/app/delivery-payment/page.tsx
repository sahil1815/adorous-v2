import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Truck, ShieldCheck, Clock, MapPin, Check, AlertCircle, MessageCircle, ArrowRight } from 'lucide-react';
import { BANGLADESH_DISTRICTS } from '@/data/districts';

export const metadata: Metadata = {
  title: 'Delivery & Cash on Delivery (COD) Policy | Adorous Fashion',
  description:
    'Complete guide to Cash on Delivery (COD), shipping charges, and delivery timelines across all 64 districts of Bangladesh by Adorous Fashion.',
};

export default function DeliveryPaymentPage() {
  return (
    <div className="bg-paper min-h-screen">
      {/* Header */}
      <section className="border-b border-line bg-[#F7F5EE] py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-3">
          <nav className="flex items-center justify-center space-x-2 text-xs text-text-muted tracking-wider uppercase mb-2">
            <Link href="/" className="hover:text-ink transition-colors">Home</Link>
            <span>/</span>
            <span className="text-ink font-medium">Delivery & COD Info</span>
          </nav>
          <span className="text-[11px] font-semibold tracking-[0.25em] text-gold-ink uppercase block">
            Nationwide Fulfillment
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif text-ink font-normal tracking-tight">
            Delivery & Payment Information
          </h1>
          <p className="text-xs sm:text-sm text-text-muted max-w-xl mx-auto leading-relaxed">
            Reliable door-to-door courier service across all 64 districts of Bangladesh with zero advance payment Cash on Delivery.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12 text-xs sm:text-sm text-text-muted">
        {/* Key Highlights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-sand/30 border border-line rounded-xs space-y-2">
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold-deep mb-3">
              <Truck className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-base text-ink font-medium">Dhaka & Gazipur</h3>
            <p className="text-xs leading-relaxed">
              <strong>৳80 Flat Rate</strong> · Delivered within 24–48 hours directly to your doorstep.
            </p>
          </div>

          <div className="p-6 bg-sand/30 border border-line rounded-xs space-y-2">
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold-deep mb-3">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-base text-ink font-medium">All Other Districts (62 Districts)</h3>
            <p className="text-xs leading-relaxed">
              <strong>৳130 Flat Rate</strong> · Delivered within 48–72 hours via Express Courier.
            </p>
          </div>

          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xs space-y-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 mb-3">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-base text-emerald-900 font-medium">Free Shipping</h3>
            <p className="text-xs text-emerald-800 leading-relaxed">
              <strong>Orders over ৳2,000</strong> automatically qualify for 100% complimentary delivery nationwide.
            </p>
          </div>
        </div>

        {/* Section 1: Cash on Delivery (COD) Explained */}
        <section className="space-y-4 pt-4 border-t border-line">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold tracking-wider text-gold-ink uppercase">
              Transparent Checkout
            </span>
            <h2 className="text-xl sm:text-2xl font-serif text-ink">
              How Cash on Delivery (COD) Works
            </h2>
          </div>

          <p className="leading-relaxed">
            We understand the importance of trust when shopping for boutique fine accessories online in Bangladesh. Therefore, <strong>Cash on Delivery (COD) is our primary and default payment method</strong>.
          </p>

          <div className="space-y-2.5 bg-[#FAF7F0] p-5 border border-line rounded-xs">
            <div className="flex items-start space-x-2.5">
              <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span><strong>Zero Advance Payment:</strong> For standard orders, you do not need to make any partial or advance bKash transfer. You pay 100% of the bill to the delivery agent.</span>
            </div>
            <div className="flex items-start space-x-2.5">
              <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span><strong>Package Exterior Inspection:</strong> You have the right to inspect the parcel outer box, tamper-proof seal, and invoice before handing cash to the courier.</span>
            </div>
            <div className="flex items-start space-x-2.5">
              <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span><strong>Digital Payment on Delivery:</strong> Many courier agents in Rajshahi Metro and major district hubs accept bKash or Nagad transfers at your doorstep if you do not have physical cash ready.</span>
            </div>
          </div>
        </section>

        {/* Section 2: WhatsApp Confirmation */}
        <section className="space-y-4 pt-4 border-t border-line">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold tracking-wider text-gold-ink uppercase">
              Pre-Dispatch Guarantee
            </span>
            <h2 className="text-xl sm:text-2xl font-serif text-ink">
              Mandatory WhatsApp Order Confirmation
            </h2>
          </div>

          <p className="leading-relaxed">
            To prevent accidental orders, wrong phone numbers, or courier return fees, our Adorous Fashion team confirms all orders via Calling before sealing the parcel:
          </p>

          <ol className="list-decimal list-inside space-y-2 pl-2">
            <li>Upon checkout, you receive an instant confirmation message and WhatsApp prompt.</li>
            <li>Our concierge team verifies your delivery address, landmark, and selected size/colorway.</li>
            <li>Once confirmed, the parcel is packed in our rigid keepsake box and handed over to the courier partner for immediate dispatch.</li>
          </ol>
        </section>

        {/* Section 3: All 64 Districts Coverage */}
        <section className="space-y-4 pt-4 border-t border-line">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold tracking-wider text-gold-ink uppercase">
              Nationwide Reach
            </span>
            <h2 className="text-xl sm:text-2xl font-serif text-ink">
              All 64 Districts Covered
            </h2>
          </div>

          <p className="leading-relaxed">
            We deliver to upazilas, sadars, and metropolitan zones across all 8 administrative divisions of Bangladesh:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
            {['Dhaka Division', 'Chittagong Division', 'Sylhet Division', 'Rajshahi Division', 'Khulna Division', 'Barisal Division', 'Rangpur Division', 'Mymensingh Division'].map((div) => (
              <div key={div} className="p-3 bg-sand/30 border border-line rounded-xs">
                <span className="font-semibold text-ink block">{div}</span>
                <span className="text-[10px] text-text-muted">Doorstep Courier Delivery</span>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="pt-8 border-t border-line text-center space-y-4">
          <h3 className="font-serif text-xl text-ink">Have a specific question about your location?</h3>
          <p className="text-xs text-text-muted max-w-md mx-auto">
            Contact our Gulshan studio delivery coordinator directly on WhatsApp for real-time tracking and delivery updates.
          </p>
          <a
            href="https://wa.me/8801577731381?text=Hi%20Adorous%20Fashion,%20I%20have%20a%20question%20regarding%20delivery."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-ink hover:bg-black text-gold-light text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>Chat with Delivery Coordinator</span>
          </a>
        </div>
      </main>
    </div>
  );
}
