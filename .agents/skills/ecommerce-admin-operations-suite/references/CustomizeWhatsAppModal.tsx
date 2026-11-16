'use client';

import React from 'react';
import Link from 'next/link';
import { MessageCircle, X, ExternalLink, Copy, Check } from 'lucide-react';
import { AdminOrder } from '@/context/OrdersContext';
import { buildWhatsAppChatUrl } from '@/lib/whatsappTemplate';

interface CustomizeWhatsAppModalProps {
  order: AdminOrder;
  message: string;
  onMessageChange: (msg: string) => void;
  onClose: () => void;
  onCopy: () => void;
  copied: boolean;
}

export default function CustomizeWhatsAppModal({
  order,
  message,
  onMessageChange,
  onClose,
  onCopy,
  copied,
}: CustomizeWhatsAppModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-[#141414] border border-white/10 rounded-xs shadow-2xl max-w-xl w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <MessageCircle className="w-3.5 h-3.5" />
              </span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-paper">
                Edit WhatsApp Message
              </h3>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-xs bg-gold/15 text-gold border border-gold/30">
                {order.orderId}
              </span>
            </div>
            <p className="text-[11px] text-paper/50 mt-1">
              Recipient: <strong className="text-paper">{order.customer.fullName}</strong> ({order.customer.phone})
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-paper/40 hover:text-paper p-1 transition-colors cursor-pointer"
            aria-label="Close Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-paper/50">
            <span>Review or edit message text before sending:</span>
            <span className="font-mono">{message.length} characters</span>
          </div>

          <textarea
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            rows={10}
            className="w-full bg-[#0A0A0A] border border-white/15 focus:border-emerald-500 rounded-xs p-3 text-xs text-paper font-sans leading-relaxed resize-y focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
            placeholder="Type customized WhatsApp message..."
          />

          <div className="flex items-center justify-between text-[11px] text-paper/40 pt-1">
            <span>💡 You can edit any line before opening WhatsApp.</span>
            <Link
              href="/admin/whatsapp"
              target="_blank"
              className="text-gold-light hover:text-gold hover:underline flex items-center space-x-1"
            >
              <span>Edit Default Format</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </Link>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between border-t border-white/10 pt-3 gap-2">
          <button
            type="button"
            onClick={onCopy}
            className="px-3 py-2 bg-[#222222] hover:bg-[#2A2A2A] border border-white/10 text-paper/80 rounded-xs text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Text</span>
              </>
            )}
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 bg-transparent hover:bg-white/5 text-paper/60 hover:text-paper rounded-xs text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <a
              href={buildWhatsAppChatUrl(order.customer.phone, message)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xs text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Open in WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
