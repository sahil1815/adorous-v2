'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  MessageCircle,
  Save,
  RotateCcw,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  Smartphone,
  Info,
  CheckCheck,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Code2,
  FileCheck2,
} from 'lucide-react';
import {
  DEFAULT_WHATSAPP_VERIFICATION_TEMPLATE,
  WHATSAPP_TEMPLATE_PRESETS,
  AVAILABLE_TEMPLATE_VARIABLES,
  renderWhatsAppVerificationMessage,
  buildWhatsAppChatUrl,
} from './template-engine-core';

// Mock sample order for real-time live preview
const SAMPLE_PREVIEW_ORDER = {
  orderId: 'ORD-2026-10087',
  createdAt: new Date().toISOString(),
  customer: {
    fullName: 'MD RIFAT MOZUMDER',
    phone: '+8801854411797',
    address: '7/5, Bosir Uddin Road, Kalabagan',
    district: 'Dhaka (Metro & Greater)',
  },
  items: [
    {
      name: 'Luxe Crystal Gemstone Suite',
      variant: 'Silver White',
      quantity: 1,
      price: 1149,
    },
  ],
  subtotal: 1149,
  shippingFee: 80,
  discountAmount: 230,
  grandTotal: 999,
};

interface AdminWhatsAppSettingsProps {
  initialTemplate?: string;
  onSaveAction?: (template: string) => Promise<{ success: boolean; error?: string }>;
  onResetAction?: () => Promise<{ success: boolean; template?: string; error?: string }>;
}

export default function AdminWhatsAppSettingsDesk({
  initialTemplate,
  onSaveAction,
  onResetAction,
}: AdminWhatsAppSettingsProps) {
  const [template, setTemplate] = useState<string>(initialTemplate || DEFAULT_WHATSAPP_VERIFICATION_TEMPLATE);
  const [savedTemplate, setSavedTemplate] = useState<string>(initialTemplate || DEFAULT_WHATSAPP_VERIFICATION_TEMPLATE);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [testPhoneNumber, setTestPhoneNumber] = useState<string>('01854411797');
  const [copiedPreview, setCopiedPreview] = useState<boolean>(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('standard-luxury');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const renderedMessage = renderWhatsAppVerificationMessage(template, SAMPLE_PREVIEW_ORDER);
  const isDirty = template !== savedTemplate;

  // Insert variable at cursor position
  const handleInsertVariable = (varKey: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setTemplate((prev) => prev + ' ' + varKey);
      return;
    }

    const start = textarea.selectionStart ?? template.length;
    const end = textarea.selectionEnd ?? template.length;
    const newText = template.substring(0, start) + varKey + template.substring(end);

    setTemplate(newText);

    setTimeout(() => {
      textarea.focus();
      const nextPos = start + varKey.length;
      textarea.setSelectionRange(nextPos, nextPos);
    }, 10);
  };

  const handleApplyPreset = (presetId: string) => {
    const preset = WHATSAPP_TEMPLATE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    if (isDirty) {
      const confirmChange = window.confirm(
        `You have unsaved changes. Are you sure you want to replace them with the "${preset.name}" preset?`
      );
      if (!confirmChange) return;
    }

    setTemplate(preset.template);
    setSelectedPresetId(presetId);
    setFeedback({
      type: 'success',
      message: `Loaded preset: "${preset.name}". Click "Save Template" to activate.`,
    });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSave = async () => {
    if (!template.trim()) {
      setFeedback({ type: 'error', message: 'Template text cannot be blank.' });
      return;
    }

    setIsSaving(true);
    setFeedback(null);
    try {
      if (onSaveAction) {
        const res = await onSaveAction(template);
        if (res.success) {
          setSavedTemplate(template);
          setFeedback({ type: 'success', message: 'WhatsApp message format saved successfully!' });
        } else {
          setFeedback({ type: 'error', message: res.error || 'Failed to save format.' });
        }
      } else {
        // Fallback to local storage or API
        setSavedTemplate(template);
        setFeedback({ type: 'success', message: 'Template updated successfully.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Error occurred while saving.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Restore factory default WhatsApp verification format?')) return;

    setIsSaving(true);
    try {
      if (onResetAction) {
        const res = await onResetAction();
        if (res.success && res.template) {
          setTemplate(res.template);
          setSavedTemplate(res.template);
        }
      } else {
        setTemplate(DEFAULT_WHATSAPP_VERIFICATION_TEMPLATE);
        setSavedTemplate(DEFAULT_WHATSAPP_VERIFICATION_TEMPLATE);
      }
      setSelectedPresetId('standard-luxury');
      setFeedback({ type: 'success', message: 'Restored factory default format.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleCopyPreview = async () => {
    try {
      await navigator.clipboard.writeText(renderedMessage);
      setCopiedPreview(true);
      setTimeout(() => setCopiedPreview(false), 2000);
    } catch (err) {
      console.warn(err);
    }
  };

  const testWhatsAppUrl = buildWhatsAppChatUrl(testPhoneNumber, renderedMessage);

  return (
    <div className="space-y-6 pb-16 text-neutral-100">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs text-neutral-400 mb-1">
            <Link href="/admin" className="hover:text-amber-400 transition-colors flex items-center space-x-1">
              <ArrowLeft className="w-3 h-3" />
              <span>Orders Desk</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-neutral-600" />
            <span className="text-amber-400">WhatsApp Automation</span>
          </div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight flex items-center space-x-2.5">
              <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4" />
              </span>
              <span>WhatsApp Message Template Settings</span>
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
              Active Engine
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
            Configure the message format sent when staff click <strong>&ldquo;Verify on WhatsApp&rdquo;</strong> on an order.
            Placeholders inside curly brackets automatically populate from order records.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            disabled={isSaving}
            className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 rounded text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className={`px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider flex items-center space-x-2 transition-all cursor-pointer ${
              isDirty
                ? 'bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-md font-bold'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
            }`}
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : isDirty ? (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Format Saved</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded border text-xs flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/60 border-red-500/40 text-red-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? (
              <FileCheck2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button type="button" onClick={() => setFeedback(null)} className="text-neutral-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Grid: Editor Left (7), Live Preview Right (5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Editor Column */}
        <div className="lg:col-span-7 space-y-5">
          {/* Preset Buttons */}
          <div className="bg-neutral-900 border border-neutral-800 rounded p-4 space-y-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-200">
                Pre-Configured Message Presets
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {WHATSAPP_TEMPLATE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset.id)}
                  className={`text-left p-3 rounded border text-xs cursor-pointer transition-all ${
                    selectedPresetId === preset.id
                      ? 'bg-amber-400/10 border-amber-400/60 text-amber-300'
                      : 'bg-neutral-950 hover:bg-neutral-800 border-neutral-800 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white">{preset.name}</span>
                    <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 font-bold">
                      {preset.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 line-clamp-2">{preset.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Textarea Editor */}
          <div className="bg-neutral-900 border border-neutral-800 rounded p-4 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="wp-template-editor" className="text-xs font-bold uppercase tracking-wider block text-white">
                Message Template Format
              </label>
              <div className="flex flex-wrap gap-1.5 p-2 bg-neutral-950 border border-neutral-800 rounded max-h-32 overflow-y-auto">
                {AVAILABLE_TEMPLATE_VARIABLES.map((v) => (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => handleInsertVariable(v.key)}
                    className="px-2 py-1 bg-neutral-800 hover:bg-amber-400/20 hover:text-amber-300 border border-neutral-700 rounded text-xs font-mono transition-colors cursor-pointer"
                    title={`${v.description} (e.g. ${v.example})`}
                  >
                    {v.key}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              id="wp-template-editor"
              ref={textareaRef}
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              rows={12}
              className="w-full bg-neutral-950 border border-neutral-700 focus:border-amber-400 rounded p-3 text-xs font-mono leading-relaxed resize-y focus:outline-none focus:ring-1 focus:ring-amber-400 text-white"
            />

            <div className="flex items-center justify-between text-xs text-neutral-400 border-t border-neutral-800 pt-3">
              <span>{template.length} characters • {template.split('\n').length} lines</span>
              <span className="text-emerald-400">UTF-8 & Emoji Safe</span>
            </div>
          </div>

          {/* Variable Reference Cheatsheet */}
          <div className="bg-neutral-900 border border-neutral-800 rounded p-4 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-white">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>Variable Tag Cheatsheet</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {AVAILABLE_TEMPLATE_VARIABLES.map((v) => (
                <div key={v.key} className="p-2 bg-neutral-950 border border-neutral-800 rounded">
                  <div className="font-mono text-amber-300 font-bold">{v.key}</div>
                  <div className="text-neutral-400 text-[11px] mt-0.5">{v.description}</div>
                  <div className="text-neutral-500 text-[10px] font-mono mt-1 bg-black/40 px-1 py-0.5 rounded truncate">
                    Ex: {v.example}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-5 space-y-5 sticky top-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Live WhatsApp Preview
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Real-Time
              </span>
            </div>

            {/* Chat Frame */}
            <div className="rounded-lg overflow-hidden border border-neutral-800 shadow-2xl bg-[#0B141A]">
              {/* WhatsApp App Bar */}
              <div className="bg-[#1F2C34] px-3 py-2.5 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-xs">
                    AF
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Store Verification Desk</div>
                    <div className="text-[10px] text-emerald-400">online</div>
                  </div>
                </div>
              </div>

              {/* Chat Bubble Area */}
              <div className="p-3.5 bg-[#0B141A] min-h-[280px] flex flex-col justify-end">
                <div className="self-end max-w-[94%] bg-[#005C4B] text-white rounded-lg rounded-tr-none p-3 shadow-md space-y-2">
                  <div className="text-xs whitespace-pre-wrap leading-relaxed select-text">
                    {renderedMessage}
                  </div>
                  <div className="flex items-center justify-end space-x-1 text-[10px] text-emerald-200/60 font-mono">
                    <span>11:22 AM</span>
                    <CheckCheck className="w-3.5 h-3.5 text-sky-400 inline" />
                  </div>
                </div>
              </div>

              {/* Sandbox Bar */}
              <div className="p-3 bg-[#1F2C34] border-t border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyPreview}
                    className="flex-1 py-1.5 bg-[#2A3942] hover:bg-[#344550] text-white text-xs rounded transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    {copiedPreview ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedPreview ? 'Copied' : 'Copy'}</span>
                  </button>

                  <a
                    href={testWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded transition-colors flex items-center justify-center space-x-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Test Send</span>
                  </a>
                </div>

                <div className="flex items-center space-x-2 text-xs pt-1 border-t border-white/5">
                  <span className="text-neutral-400 shrink-0">Test Phone:</span>
                  <input
                    type="text"
                    value={testPhoneNumber}
                    onChange={(e) => setTestPhoneNumber(e.target.value)}
                    className="bg-[#111B21] border border-white/10 rounded px-2 py-1 text-white text-xs font-mono w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
