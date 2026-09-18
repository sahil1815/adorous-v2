'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Phone, Mail, MapPin, Clock, Send, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Styling Consultation');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
  };

  return (
    <div className="bg-paper min-h-screen">
      {/* Header */}
      <section className="border-b border-line bg-[#F7F5EE] py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-3">
          <nav className="flex items-center justify-center space-x-2 text-xs text-text-muted tracking-wider uppercase mb-2">
            <Link href="/" className="hover:text-ink transition-colors">Home</Link>
            <span>/</span>
            <span className="text-ink font-medium">Contact Studio</span>
          </nav>
          <span className="text-[11px] font-semibold tracking-[0.25em] text-gold-ink uppercase block">
            Adorous Atelier Concierge
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif text-ink font-normal tracking-tight">
            Contact the Atelier
          </h1>
          <p className="text-xs sm:text-sm text-text-muted max-w-xl mx-auto leading-relaxed">
            Whether you seek personal styling guidance for an upcoming bridal celebration, custom churi sizing, or corporate gifting, our team is at your service.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Left Column: Direct Studio Contact Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-3">
              <span className="text-[11px] font-semibold text-gold-ink uppercase tracking-wider">
                Direct Channels
              </span>
              <h2 className="text-2xl font-serif text-ink">
                Reach Our Concierge Desk
              </h2>
              <p className="text-xs text-text-muted leading-relaxed">
                For the quickest response regarding order updates or fabric matching, we recommend connecting via WhatsApp.
              </p>
            </div>

            {/* Contact Details List */}
            <div className="space-y-4 text-xs">
              {/* WhatsApp Card */}
              <a
                href="https://wa.me/8801577731381?text=Hello%20Adorous%20Fashion"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-emerald-50 border border-emerald-200 rounded-xs flex items-start space-x-3.5 hover:bg-emerald-100/70 transition-colors group block"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-emerald-950 text-sm font-medium">WhatsApp Priority Desk</strong>
                    <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.2 rounded-xs font-semibold uppercase">
                      Fastest
                    </span>
                  </div>
                  <p className="text-emerald-850 mt-1 font-mono">+880 15-7773-1381</p>
                  <p className="text-[11px] text-emerald-700/80 mt-0.5">Average reply time: under 15 minutes</p>
                </div>
              </a>

              {/* Atelier Address */}
              <div className="p-4 bg-sand/30 border border-line rounded-xs flex items-start space-x-3.5">
                <div className="w-9 h-9 rounded-full bg-sand flex items-center justify-center shrink-0 mt-0.5 text-ink">
                  <MapPin className="w-4 h-4 text-gold-deep" />
                </div>
                <div>
                  <strong className="text-ink text-sm font-medium">Adorous Fashion</strong>
                  <p className="text-text-muted mt-1 leading-relaxed">
                    Devisingpara, Islampara area of Boalia<br />
                    Rajshahi, Bangladesh
                  </p>
                </div>
              </div>

              {/* Hours */}
              <div className="p-4 bg-sand/30 border border-line rounded-xs flex items-start space-x-3.5">
                <div className="w-9 h-9 rounded-full bg-sand flex items-center justify-center shrink-0 mt-0.5 text-ink">
                  <Clock className="w-4 h-4 text-gold-deep" />
                </div>
                <div>
                  <strong className="text-ink text-sm font-medium">Operating Hours</strong>
                  <p className="text-text-muted mt-1">
                    Saturday – Thursday: 10:00 AM – 10:00 PM BST<br />
                    Friday: 2:30 PM – 10:00 PM BST
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="p-4 bg-sand/30 border border-line rounded-xs flex items-start space-x-3.5">
                <div className="w-9 h-9 rounded-full bg-sand flex items-center justify-center shrink-0 mt-0.5 text-ink">
                  <Mail className="w-4 h-4 text-gold-deep" />
                </div>
                <div>
                  <strong className="text-ink text-sm font-medium">Email Desk</strong>
                  <p className="text-text-muted mt-1 font-mono">adorous.fashion@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="lg:col-span-7 bg-paper border border-line p-6 sm:p-10 rounded-[2px] shadow-xs space-y-6">
            <div className="space-y-1 border-b border-line pb-4">
              <h3 className="font-serif text-xl text-ink font-medium">
                Send an Atelier Inquiry
              </h3>
              <p className="text-xs text-text-muted">
                Fill in the details below and our client coordinator will reach out via WhatsApp or phone.
              </p>
            </div>

            {isSent ? (
              <div className="p-8 text-center space-y-3 bg-emerald-50 border border-emerald-200 rounded-xs">
                <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
                <h4 className="font-serif text-xl text-emerald-950 font-medium">
                  Inquiry Received with Grace
                </h4>
                <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{name}</strong>. Our Adorous Fashion Team has received your note regarding "{subject}". We will contact you at <strong>{phone}</strong> shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSent(false)}
                  className="mt-3 text-xs text-emerald-900 font-semibold underline"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-ink font-medium">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Samira Chowdhury"
                      className="w-full px-3.5 py-2.5 bg-sand/30 border border-line text-ink focus:outline-none focus:border-gold rounded-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-ink font-medium">
                      Mobile Number (WhatsApp) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+880 1712 345678"
                      className="w-full px-3.5 py-2.5 bg-sand/30 border border-line text-ink focus:outline-none focus:border-gold rounded-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-ink font-medium">
                    Topic of Inquiry <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-sand/30 border border-line text-ink focus:outline-none focus:border-gold rounded-xs cursor-pointer"
                  >
                    <option value="Gift Selection">Jewelry Gift Selection & Recommendations</option>
                    <option value="Styling Consultation">Bridal / Festive Styling Consultation</option>
                    <option value="Custom Churi Sizing">Custom Churi (Bangle) Sizing Question</option>
                    <option value="Wedding & Corporate Bulk Favours">Wedding Favours & Bulk Corporate Gifting</option>
                    <option value="Existing Order Status">Existing Order Inquiry / Tracking</option>
                    <option value="General Question">General Inquiry</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-ink font-medium">
                    Message / Outfit Details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your outfit, desired colors, wedding date, or specific questions..."
                    className="w-full px-3.5 py-2.5 bg-sand/30 border border-line text-ink focus:outline-none focus:border-gold rounded-xs placeholder:text-text-muted leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 bg-gold hover:bg-gold-light text-ink font-semibold text-xs tracking-wider uppercase rounded-xs transition-all flex items-center justify-center space-x-2 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Inquiry to Atelier</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
