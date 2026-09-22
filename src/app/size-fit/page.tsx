import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Ruler, ShieldCheck, RotateCcw, Check, ArrowRight, MessageCircle, Info } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Churi & Jewelry Sizing Guide | Adorous Fashion',
  description:
    'Comprehensive sizing chart for traditional South Asian Churi bangles, rigid Hasli collars, and bridal chokers. Measure hand knuckle circumference accurately.',
};

export default function SizeFitPage() {
  return (
    <div className="bg-paper min-h-screen">
      {/* Header */}
      <section className="border-b border-line bg-[#F7F5EE] py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-3">
          <nav className="flex items-center justify-center space-x-2 text-xs text-text-muted tracking-wider uppercase mb-2">
            <Link href="/" className="hover:text-ink transition-colors">Home</Link>
            <span>/</span>
            <span className="text-ink font-medium">Size & Fit Guide</span>
          </nav>
          <span className="text-[11px] font-semibold tracking-[0.25em] text-gold-ink uppercase block">
            Fit & Comfort Blueprint
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif text-ink font-normal tracking-tight">
            Churi (Bangle) & Jewelry Sizing Guide
          </h1>
          <p className="text-xs sm:text-sm text-text-muted max-w-xl mx-auto leading-relaxed">
            Because bangles are rigid and must slip over the hand, traditional South Asian bangle sizing is measured at the hand knuckles, not the wrist.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12 text-xs sm:text-sm text-text-muted">
        {/* Critical Alert */}
        <div className="p-5 bg-sand/40 border border-gold/40 rounded-xs flex items-start space-x-3 text-ink">
          <Info className="w-5 h-5 text-gold-deep shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-xs sm:text-sm font-semibold block">Important: Measure Hand Knuckles, Not Wrist!</strong>
            <p className="text-xs text-text-muted leading-relaxed">
              Rigid metal and velvet bangles cannot expand. The size you need depends solely on whether the bangle can slide over the widest part of your hand knuckles when your fingers are brought together.
            </p>
          </div>
        </div>

        {/* Churi Sizing Table */}
        <section className="space-y-4">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold tracking-wider text-gold-ink uppercase">
              Bangladesh Standard Dimensions
            </span>
            <h2 className="text-xl sm:text-2xl font-serif text-ink">
              Churi (Bangle) Sizing Chart
            </h2>
          </div>

          <div className="overflow-x-auto border border-line rounded-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-sand/60 border-b border-line text-ink uppercase tracking-wider text-[11px]">
                  <th className="p-3.5 sm:p-4 font-semibold">Size (BD/Indian)</th>
                  <th className="p-3.5 sm:p-4 font-semibold">Inner Diameter</th>
                  <th className="p-3.5 sm:p-4 font-semibold">Hand Knuckle Circumference</th>
                  <th className="p-3.5 sm:p-4 font-semibold">Fit Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-paper">
                <tr className="hover:bg-sand/20 transition-colors">
                  <td className="p-3.5 sm:p-4 font-bold text-ink">2-4</td>
                  <td className="p-3.5 sm:p-4 tabular-nums">2.25&quot; (5.7 cm)</td>
                  <td className="p-3.5 sm:p-4 tabular-nums">7.0&quot; – 7.5&quot; (17.8 – 19.0 cm)</td>
                  <td className="p-3.5 sm:p-4 text-text-muted">Petite / Slender Hand</td>
                </tr>
                <tr className="bg-sand/15 hover:bg-sand/30 transition-colors">
                  <td className="p-3.5 sm:p-4 font-bold text-gold-deep flex items-center gap-1.5">
                    <span>2-6</span>
                    <span className="text-[9px] bg-gold/20 text-gold-deep px-1.5 py-0.5 rounded-xs font-semibold uppercase">
                      Most Common
                    </span>
                  </td>
                  <td className="p-3.5 sm:p-4 tabular-nums font-medium text-ink">2.37&quot; (6.0 cm)</td>
                  <td className="p-3.5 sm:p-4 tabular-nums font-medium text-ink">7.5&quot; – 8.0&quot; (19.0 – 20.3 cm)</td>
                  <td className="p-3.5 sm:p-4 text-ink font-medium">Standard Bangladeshi Hand (70% of patrons)</td>
                </tr>
                <tr className="hover:bg-sand/20 transition-colors">
                  <td className="p-3.5 sm:p-4 font-bold text-ink">2-8</td>
                  <td className="p-3.5 sm:p-4 tabular-nums">2.50&quot; (6.4 cm)</td>
                  <td className="p-3.5 sm:p-4 tabular-nums">8.0&quot; – 8.5&quot; (20.3 – 21.6 cm)</td>
                  <td className="p-3.5 sm:p-4 text-text-muted">Comfort / Wider Knuckles</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 3 Step Measurement Method */}
        <section className="space-y-4 pt-4 border-t border-line">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold tracking-wider text-gold-ink uppercase">
              Quick 2-Minute Technique
            </span>
            <h2 className="text-xl sm:text-2xl font-serif text-ink">
              How to Measure at Home in 3 Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-sand/30 border border-line rounded-xs space-y-2">
              <span className="w-6 h-6 rounded-full bg-sand text-gold-deep text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="font-serif text-base text-ink font-medium">Pinch Fingers</h3>
              <p className="text-xs leading-relaxed text-text-muted">
                Bring your thumb and little finger together tightly, mimicking the hand posture when sliding on a rigid bangle.
              </p>
            </div>

            <div className="p-5 bg-sand/30 border border-line rounded-xs space-y-2">
              <span className="w-6 h-6 rounded-full bg-sand text-gold-deep text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h3 className="font-serif text-base text-ink font-medium">Wrap String or Tape</h3>
              <p className="text-xs leading-relaxed text-text-muted">
                Wrap a piece of string around the widest part of your hand knuckles snugly. Mark the exact overlapping point.
              </p>
            </div>

            <div className="p-5 bg-sand/30 border border-line rounded-xs space-y-2">
              <span className="w-6 h-6 rounded-full bg-sand text-gold-deep text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h3 className="font-serif text-base text-ink font-medium">Measure Against Ruler</h3>
              <p className="text-xs leading-relaxed text-text-muted">
                Flatten the string against a standard centimeter or inch ruler and compare with our chart above.
              </p>
            </div>
          </div>
        </section>

        {/* Necklace & Choker Guide */}
        <section className="space-y-4 pt-4 border-t border-line">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold tracking-wider text-gold-ink uppercase">
              Neckwear Profiles
            </span>
            <h2 className="text-xl sm:text-2xl font-serif text-ink">
              Necklace & Choker Fit Guide
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-paper border border-line rounded-xs space-y-1.5">
              <h4 className="font-serif text-sm font-semibold text-ink">Bridal Filigree Choker (14&quot;–16&quot;)</h4>
              <p className="text-xs leading-relaxed">
                Hugs the base of the throat. Features an artisanal adjustable zari dori tie-back cords that effortlessly fit all neck circumferences.
              </p>
            </div>

            <div className="p-4 bg-paper border border-line rounded-xs space-y-1.5">
              <h4 className="font-serif text-sm font-semibold text-ink">Rigid Hasli Collar (16&quot;–17&quot;)</h4>
              <p className="text-xs leading-relaxed">
                Rests along the collarbones with structured ergonomic curvature. Designed with flexible hollow-core brass for gentle slip-on placement.
              </p>
            </div>
          </div>
        </section>

        {/* Reassurance Footer */}
        <div className="pt-8 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-sand/20 border border-line rounded-xs">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-gold-deep font-semibold text-xs">
              <RotateCcw className="w-4 h-4" />
              <span>7-Day Doorstep Size Exchange Guarantee</span>
            </div>
            <p className="text-xs text-text-muted">
              Still unsure of your size? Select size 2-6 (most common), and if it doesn't fit like a dream, we exchange it at your doorstep.
            </p>
          </div>

          <Link
            href="/churi"
            className="shrink-0 px-6 py-3 bg-sand hover:bg-black text-gold-deep text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors flex items-center space-x-2"
          >
            <span>Shop Churi Stacks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>
    </div>
  );
}
