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
  SAMPLE_PREVIEW_ORDER,
  renderWhatsAppVerificationMessage,
  buildWhatsAppChatUrl,
} from '@/lib/whatsappTemplate';
import {
  getWhatsAppSettings,
  updateWhatsAppVerificationTemplate,
  resetWhatsAppVerificationTemplate,
} from '@/app/actions/whatsappSettingsActions';

export default function AdminWhatsAppSettingsPage() {
  const [template, setTemplate] = useState<string>(DEFAULT_WHATSAPP_VERIFICATION_TEMPLATE);
  const [savedTemplate, setSavedTemplate] = useState<string>(DEFAULT_WHATSAPP_VERIFICATION_TEMPLATE);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [testPhoneNumber, setTestPhoneNumber] = useState<string>('01854411797');
  const [copiedPreview, setCopiedPreview] = useState<boolean>(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('standard-luxury');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load existing settings from DB on mount
  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await getWhatsAppSettings();
        if (isMounted && data.verificationTemplate) {
          setTemplate(data.verificationTemplate);
          setSavedTemplate(data.verificationTemplate);
        }
      } catch (err: any) {
        console.error('Failed to load WhatsApp settings:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute live rendered preview message
  const renderedMessage = renderWhatsAppVerificationMessage(template, SAMPLE_PREVIEW_ORDER);
  const isDirty = template !== savedTemplate;

  // Insert variable tag at current cursor position
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

    // Reposition cursor right after inserted variable
    setTimeout(() => {
      textarea.focus();
      const nextPos = start + varKey.length;
      textarea.setSelectionRange(nextPos, nextPos);
    }, 10);
  };

  // Handle Preset Selection
  const handleApplyPreset = (presetId: string) => {
    const preset = WHATSAPP_TEMPLATE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    if (isDirty) {
      const confirmChange = window.confirm(
        'You have unsaved changes in your current message template. Are you sure you want to load the preset "' +
          preset.name +
          '"?'
      );
      if (!confirmChange) return;
    }

    setTemplate(preset.template);
    setSelectedPresetId(presetId);
    setFeedback({
      type: 'success',
      message: `Loaded preset: "${preset.name}". Click "Save Template" to apply across the store.`,
    });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Save changes to backend database
  const handleSave = async () => {
    if (!template.trim()) {
      setFeedback({ type: 'error', message: 'Template text cannot be blank.' });
      return;
    }

    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await updateWhatsAppVerificationTemplate(template);
      if (res.success && res.settings) {
        setSavedTemplate(res.settings.verificationTemplate);
        setFeedback({
          type: 'success',
          message: 'WhatsApp Verification message format successfully saved and activated!',
        });
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Failed to update template format.',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'A network error occurred while saving.',
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  // Reset to default factory template
  const handleResetToDefault = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to restore the default factory Adorous WhatsApp verification format? Any custom edits will be replaced.'
    );
    if (!confirmed) return;

    setIsSaving(true);
    try {
      const res = await resetWhatsAppVerificationTemplate();
      if (res.success && res.settings) {
        setTemplate(res.settings.verificationTemplate);
        setSavedTemplate(res.settings.verificationTemplate);
        setSelectedPresetId('standard-luxury');
        setFeedback({
          type: 'success',
          message: 'Restored factory default WhatsApp verification template.',
        });
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to reset template.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Error resetting template.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  // Copy preview to clipboard
  const handleCopyPreview = async () => {
    try {
      await navigator.clipboard.writeText(renderedMessage);
      setCopiedPreview(true);
      setTimeout(() => setCopiedPreview(false), 2000);
    } catch (err) {
      console.warn('Clipboard copy error:', err);
    }
  };

  // Generate test WhatsApp URL with current test phone number
  const testWhatsAppUrl = buildWhatsAppChatUrl(testPhoneNumber, renderedMessage);

  return (
    <div className="space-y-6 pb-16">
      {/* Top Breadcrumb & Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs text-paper/50 mb-1">
            <Link href="/admin" className="hover:text-gold transition-colors flex items-center space-x-1">
              <ArrowLeft className="w-3 h-3" />
              <span>Orders & COD Desk</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-paper/30" />
            <span className="text-gold">WhatsApp Automation</span>
          </div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-paper flex items-center space-x-2.5">
              <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4" />
              </span>
              <span>WhatsApp Verification Message Format</span>
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
              Live Backend Engine
            </span>
          </div>
          <p className="text-xs text-paper/60 mt-1 max-w-2xl">
            Configure the default message format sent when admins click{' '}
            <strong className="text-emerald-400 font-semibold">&ldquo;Verify on WhatsApp&rdquo;</strong> on an order
            card. You can insert dynamic variables like customer name, total COD amount, and address tags.
          </p>
        </div>

        {/* Global Save / Reset Actions */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleResetToDefault}
            disabled={isSaving || isLoading}
            className="px-3 py-2 bg-[#1C1C1C] hover:bg-[#252525] border border-white/10 hover:border-red-500/40 text-paper/70 hover:text-red-300 rounded-xs text-xs font-medium flex items-center space-x-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            title="Reset to default template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset to Default</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isLoading || !isDirty}
            className={`px-4 py-2 rounded-xs text-xs font-semibold uppercase tracking-wider flex items-center space-x-2 transition-all shadow-md cursor-pointer ${
              isDirty
                ? 'bg-gold hover:bg-gold-light text-ink animate-pulse shadow-gold/20'
                : 'bg-white/10 text-paper/40 cursor-not-allowed border border-white/5'
            }`}
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-ink border-t-transparent rounded-full animate-spin" />
                <span>Saving to Backend...</span>
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
          className={`p-3.5 rounded-xs border text-xs flex items-center justify-between transition-all ${
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
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-paper/40 hover:text-paper font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main 2-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Template Editor & Variables (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Preset Selection Strip */}
          <div className="bg-[#141414] border border-white/10 rounded-xs p-4">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                <span className="text-xs font-bold uppercase tracking-wider text-paper">
                  Pre-Configured Message Formats
                </span>
              </div>
              <span className="text-[10px] text-paper/40">1-Click Apply</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {WHATSAPP_TEMPLATE_PRESETS.map((preset) => {
                const isCurrentActive = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset.id)}
                    className={`text-left p-3 rounded-xs border transition-all text-xs cursor-pointer ${
                      isCurrentActive
                        ? 'bg-gold/10 border-gold/60 text-gold-light shadow-sm'
                        : 'bg-[#1A1A1A] hover:bg-[#202020] border-white/5 hover:border-white/20 text-paper/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-paper text-[12px]">{preset.name}</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.2 rounded-full font-bold bg-white/10 text-paper/60">
                        {preset.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-paper/50 line-clamp-2 leading-relaxed">
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Core Message Template Editor */}
          <div className="bg-[#141414] border border-white/10 rounded-xs p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label
                  htmlFor="template-editor"
                  className="text-xs font-bold uppercase tracking-wider text-paper block"
                >
                  Verification Message Format
                </label>
                <span className="text-[11px] text-paper/50">
                  Write the text format. Placeholders inside curly brackets will automatically populate from each order.
                </span>
              </div>

              {isDirty && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                  Unsaved Edits
                </span>
              )}
            </div>

            {/* Variable Insertion Pills */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-paper/60">
                <span className="flex items-center space-x-1 font-semibold text-gold-light">
                  <Code2 className="w-3 h-3 text-gold" />
                  <span>Click to Insert Dynamic Placeholder:</span>
                </span>
                <span className="text-[10px] text-paper/40 italic">Inserts at text cursor</span>
              </div>

              <div className="flex flex-wrap gap-1.5 p-2.5 bg-[#0E0E0E] border border-white/5 rounded-xs max-h-36 overflow-y-auto">
                {AVAILABLE_TEMPLATE_VARIABLES.map((v) => (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => handleInsertVariable(v.key)}
                    className="px-2 py-1 bg-[#1E1E1E] hover:bg-gold/20 hover:text-gold border border-white/10 hover:border-gold/40 text-paper/80 rounded-xs text-[11px] font-mono transition-colors flex items-center space-x-1 cursor-pointer"
                    title={`${v.description} (Example: ${v.example})`}
                  >
                    <span>{v.key}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <div className="relative">
              <textarea
                id="template-editor"
                ref={textareaRef}
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                rows={12}
                disabled={isLoading}
                placeholder="Write your custom WhatsApp verification message here..."
                className="w-full bg-[#0A0A0A] border border-white/15 focus:border-gold rounded-xs p-3.5 text-xs text-paper font-sans leading-relaxed tracking-wide resize-y focus:outline-none focus:ring-1 focus:ring-gold transition-colors font-mono"
              />
            </div>

            {/* Editor Stats Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-paper/50 gap-2 border-t border-white/5 pt-3">
              <div className="flex items-center space-x-4">
                <span>
                  Length: <strong className="text-paper">{template.length}</strong> chars
                </span>
                <span>
                  Lines: <strong className="text-paper">{template.split('\n').length}</strong>
                </span>
                <span className="text-emerald-400 font-medium">Standard UTF-8 (Bangla & Emojis supported)</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving || !isDirty}
                  className="text-xs text-gold hover:underline font-semibold disabled:opacity-30 disabled:no-underline"
                >
                  Save to Database →
                </button>
              </div>
            </div>
          </div>

          {/* Placeholders Guide Cheatsheet */}
          <div className="bg-[#141414] border border-white/10 rounded-xs p-4 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-paper">
              <Info className="w-3.5 h-3.5 text-gold" />
              <span>Available Dynamic Placeholders Cheatsheet</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              {AVAILABLE_TEMPLATE_VARIABLES.map((v) => (
                <div
                  key={v.key}
                  className="p-2 bg-[#1A1A1A] border border-white/5 rounded-xs flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-gold font-bold">{v.key}</span>
                  </div>
                  <span className="text-paper/70 text-[11px] mt-0.5">{v.description}</span>
                  <span className="text-[10px] text-paper/40 font-mono truncate mt-1 bg-black/40 px-1 py-0.5 rounded-xs">
                    Ex: {v.example}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: WhatsApp Live Preview & Sandbox (5 cols) */}
        <div className="lg:col-span-5 space-y-5 sticky top-20">
          <div className="bg-[#141414] border border-white/10 rounded-xs p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-paper">
                  Live WhatsApp Chat Preview
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Real-Time</span>
              </span>
            </div>

            <p className="text-[11px] text-paper/50">
              This preview shows how your message renders using sample order{' '}
              <strong className="text-gold font-semibold">AF-2026-10087</strong>.
            </p>

            {/* Authentic WhatsApp Phone Screen Frame */}
            <div className="rounded-lg overflow-hidden border border-emerald-900/40 shadow-2xl bg-[#0B141A]">
              {/* WhatsApp App Bar */}
              <div className="bg-[#1F2C34] px-3 py-2.5 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-black border border-gold/40 p-0.5 flex items-center justify-center text-gold font-bold text-xs">
                    AF
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-semibold text-white tracking-wide">
                        Adorous Fashion
                      </span>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 rounded-xs font-bold">
                        Official
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-400/80 block leading-tight">
                      online • Atelier Desk
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-white/40 font-mono">
                  Order: AF-2026-10087
                </div>
              </div>

              {/* Chat Message Stream */}
              <div className="p-3.5 bg-[#0B141A] bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px] min-h-[300px] flex flex-col justify-end space-y-3">
                {/* Outgoing Message Bubble (Right-aligned, Emerald/Dark WhatsApp tone) */}
                <div className="self-end max-w-[94%] bg-[#005C4B] text-white rounded-lg rounded-tr-none p-3 shadow-md border border-emerald-600/30 space-y-2">
                  <div className="text-xs text-[#E9EDEF] whitespace-pre-wrap leading-relaxed font-sans select-text">
                    {renderedMessage}
                  </div>

                  {/* WhatsApp Message Metadata */}
                  <div className="flex items-center justify-end space-x-1 pt-1 text-[10px] text-emerald-200/60 font-mono">
                    <span>11:22 AM</span>
                    <CheckCheck className="w-3.5 h-3.5 text-sky-400 inline" />
                  </div>
                </div>
              </div>

              {/* WhatsApp Sandbox Action Bar */}
              <div className="p-3 bg-[#1F2C34] border-t border-white/10 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleCopyPreview}
                    className="flex-1 py-1.5 bg-[#2A3942] hover:bg-[#344550] text-paper text-[11px] font-medium rounded-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer border border-white/5"
                  >
                    {copiedPreview ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-300">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Message</span>
                      </>
                    )}
                  </button>

                  <a
                    href={testWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold rounded-xs transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Test on WhatsApp</span>
                  </a>
                </div>

                {/* Sandbox custom phone input */}
                <div className="flex items-center space-x-2 text-[11px] pt-1 border-t border-white/5">
                  <span className="text-paper/40 shrink-0">Test Phone:</span>
                  <input
                    type="text"
                    value={testPhoneNumber}
                    onChange={(e) => setTestPhoneNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="bg-[#111B21] border border-white/10 rounded-xs px-2 py-1 text-paper text-xs font-mono w-full focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Verification on Orders Page Quick Notice */}
            <div className="p-3 bg-[#1A1A1A] border border-gold/20 rounded-xs space-y-1 text-xs">
              <span className="font-semibold text-gold-light flex items-center space-x-1">
                <Check className="w-3.5 h-3.5 text-gold" />
                <span>Synchronized with Orders Desk</span>
              </span>
              <p className="text-[11px] text-paper/60 leading-relaxed">
                When you click &ldquo;Save Changes&rdquo;, every order card on the Admin Orders desk will
                instantly use this format when clicking &ldquo;Verify on WhatsApp&rdquo;.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
