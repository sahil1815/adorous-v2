'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Edit3, X, Copy, Check, ExternalLink } from 'lucide-react';
import {
  renderWhatsAppVerificationMessage,
  buildWhatsAppChatUrl,
} from './template-engine-core';

interface OrderItem {
  name: string;
  quantity: number;
  price?: number;
  variant?: string;
}

interface OrderEntity {
  orderId: string;
  customer: {
    fullName: string;
    phone: string;
    address?: string;
    district?: string;
  };
  grandTotal: number;
  items: OrderItem[];
  createdAt?: string;
}

interface WhatsAppActionGroupProps {
  order: OrderEntity;
  activeTemplate: string;
  settingsUrl?: string; // e.g. "/admin/whatsapp"
  className?: string;
}

/**
 * Dual-Action Button Group for Order Cards:
 * 1. Main Action: Direct "Verify on WhatsApp" opening wa.me immediately with template.
 * 2. Secondary Action: Pencil icon to open the custom in-situ message modal before opening WhatsApp.
 */
export function WhatsAppActionGroup({
  order,
  activeTemplate,
  settingsUrl = '/admin/whatsapp',
  className = '',
}: WhatsAppActionGroupProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editableMessage, setEditableMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const handleOpenModal = () => {
    const prefilledText = renderWhatsAppVerificationMessage(activeTemplate, order);
    setEditableMessage(prefilledText);
    setIsModalOpen(true);
    setCopied(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editableMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Clipboard copy error:', err);
    }
  };

  const directChatUrl = buildWhatsAppChatUrl(
    order.customer.phone,
    renderWhatsAppVerificationMessage(activeTemplate, order)
  );

  const customChatUrl = buildWhatsAppChatUrl(
    order.customer.phone,
    editableMessage
  );

  return (
    <>
      <div className={`flex items-center space-x-1 ${className}`}>
        {/* Direct One-Click Verify */}
        <a
          href={directChatUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2 px-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-semibold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Verify on WhatsApp</span>
        </a>

        {/* Secondary Edit Action */}
        <button
          type="button"
          onClick={handleOpenModal}
          className="py-2 px-2.5 bg-emerald-800/80 hover:bg-emerald-700 border border-emerald-600/40 text-emerald-200 hover:text-white rounded text-xs flex items-center justify-center transition-colors shadow-sm cursor-pointer"
          title="Edit message for this order before opening WhatsApp"
          aria-label="Edit message before opening WhatsApp"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* In-Situ Customization Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
        >
          <div className="bg-[#141414] border border-white/10 rounded shadow-2xl max-w-xl w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-3.5 h-3.5" />
                  </span>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Customize WhatsApp Message
                  </h3>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    {order.orderId}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Recipient: <strong className="text-white">{order.customer.fullName}</strong> ({order.customer.phone})
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 transition-colors cursor-pointer"
                aria-label="Close Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Editable Textarea Body */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Edit message text before dispatching to patron:</span>
                <span>{editableMessage.length} characters</span>
              </div>

              <textarea
                value={editableMessage}
                onChange={(e) => setEditableMessage(e.target.value)}
                rows={10}
                className="w-full bg-[#0A0A0A] border border-white/15 focus:border-emerald-500 rounded p-3 text-xs text-white font-sans leading-relaxed resize-y focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                placeholder="Type customized WhatsApp message..."
              />

              <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
                <span>💡 You can edit any line before launching WhatsApp.</span>
                {settingsUrl && (
                  <Link
                    href={settingsUrl}
                    target="_blank"
                    className="text-amber-300 hover:underline flex items-center space-x-1"
                  >
                    <span>Edit Global Template</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </Link>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-white/10 pt-3 gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 border border-white/10 text-neutral-200 rounded text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied!</span>
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
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 text-neutral-400 hover:text-white rounded text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <a
                  href={customChatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-colors shadow-sm"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Open in WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
