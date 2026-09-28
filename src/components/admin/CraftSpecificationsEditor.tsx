'use client';

import React, { useState, useRef } from 'react';
import { Bold, Trash2, Pencil, Check, X } from 'lucide-react';
import { renderFormattedText } from '@/lib/formatText';

interface CraftSpecificationsEditorProps {
  details: string[];
  onChange: (details: string[]) => void;
}

export default function CraftSpecificationsEditor({
  details,
  onChange,
}: CraftSpecificationsEditorProps) {
  const [newDetailText, setNewDetailText] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const toggleBoldOnInput = (
    input: HTMLInputElement | null,
    currentText: string,
    setText: (val: string) => void
  ) => {
    if (!input) return;
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;

    if (start === end) {
      // No text selected: insert **** and position cursor between asterisks
      const newText = currentText.slice(0, start) + '****' + currentText.slice(end);
      setText(newText);
      requestAnimationFrame(() => {
        input.focus();
        input.setSelectionRange(start + 2, start + 2);
      });
      return;
    }

    const selected = currentText.slice(start, end);

    // Case 1: Selection is already wrapped in ** (e.g. "**Craftsmanship:**")
    if (selected.startsWith('**') && selected.endsWith('**') && selected.length >= 4) {
      const unwrapped = selected.slice(2, -2);
      const newText = currentText.slice(0, start) + unwrapped + currentText.slice(end);
      setText(newText);
      requestAnimationFrame(() => {
        input.focus();
        input.setSelectionRange(start, start + unwrapped.length);
      });
      return;
    }

    // Case 2: Selected text is immediately surrounded by **
    const before2 = currentText.slice(Math.max(0, start - 2), start);
    const after2 = currentText.slice(end, end + 2);
    if (before2 === '**' && after2 === '**') {
      const newText = currentText.slice(0, start - 2) + selected + currentText.slice(end + 2);
      setText(newText);
      requestAnimationFrame(() => {
        input.focus();
        input.setSelectionRange(start - 2, end - 2);
      });
      return;
    }

    // Case 3: Wrap selected text in **
    const wrapped = `**${selected}**`;
    const newText = currentText.slice(0, start) + wrapped + currentText.slice(end);
    setText(newText);
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(start, start + wrapped.length);
    });
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    input: HTMLInputElement | null,
    text: string,
    setText: (val: string) => void,
    onEnter?: () => void,
    onCancel?: () => void
  ) => {
    if ((e.metaKey || e.ctrlKey) && (e.key === 'b' || e.key === 'B')) {
      e.preventDefault();
      toggleBoldOnInput(input, text, setText);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      onEnter?.();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel?.();
    }
  };

  const handleAddDetail = () => {
    const trimmed = newDetailText.trim();
    if (!trimmed) return;
    onChange([...details, trimmed]);
    setNewDetailText('');
  };

  const handleRemoveDetail = (index: number) => {
    onChange(details.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditingText(details[index]);
    requestAnimationFrame(() => {
      editInputRef.current?.focus();
    });
  };

  const saveEditing = () => {
    if (editingIndex === null) return;
    const trimmed = editingText.trim();
    if (trimmed) {
      const updated = [...details];
      updated[editingIndex] = trimmed;
      onChange(updated);
    } else {
      handleRemoveDetail(editingIndex);
    }
    setEditingIndex(null);
    setEditingText('');
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditingText('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-paper/70 uppercase tracking-widest text-[10px] font-semibold">
          Craft Specifications ({details.length} points)
        </label>
        <span className="text-[10px] text-paper/50">
          Tip: Select text & press <kbd className="px-1 py-0.5 bg-white/10 rounded text-[9px] font-mono">⌘B</kbd> or click <strong>B</strong> to bold
        </span>
      </div>

      {/* Existing Points List */}
      <div className="space-y-1.5">
        {details.map((d, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between bg-[#1C1C1C] p-2 rounded-xs border border-white/5 text-xs"
          >
            {editingIndex === idx ? (
              <div className="flex items-center gap-1.5 flex-1">
                <div className="relative flex-1">
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={(e) =>
                      handleKeyDown(
                        e,
                        editInputRef.current,
                        editingText,
                        setEditingText,
                        saveEditing,
                        cancelEditing
                      )
                    }
                    className="w-full bg-[#121212] border border-gold/40 px-2.5 py-1 text-paper rounded-xs focus:outline-none pr-8 text-xs"
                  />
                  <button
                    type="button"
                    title="Bold selected text (⌘+B / Ctrl+B)"
                    onClick={() =>
                      toggleBoldOnInput(editInputRef.current, editingText, setEditingText)
                    }
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 text-paper/60 hover:text-gold rounded-xs transition-colors"
                  >
                    <Bold className="w-3 h-3" />
                  </button>
                </div>
                <button
                  type="button"
                  title="Save changes"
                  onClick={saveEditing}
                  className="p-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 rounded-xs transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Cancel"
                  onClick={cancelEditing}
                  className="p-1 text-paper/40 hover:text-paper/70 rounded-xs transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <div className="text-paper/85 flex-1 leading-relaxed">
                  {renderFormattedText(d, 'font-bold text-white')}
                </div>
                <div className="flex items-center space-x-1 ml-2 shrink-0">
                  <button
                    type="button"
                    title="Edit point"
                    onClick={() => startEditing(idx)}
                    className="text-paper/40 hover:text-gold transition-colors p-1"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Remove point"
                    onClick={() => handleRemoveDetail(idx)}
                    className="text-paper/40 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add New Specification Input */}
      <div className="space-y-1 pt-1">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              placeholder="e.g. **Craftsmanship:** 100% Solid Brass with Micron Gold Plating"
              value={newDetailText}
              onChange={(e) => setNewDetailText(e.target.value)}
              onKeyDown={(e) =>
                handleKeyDown(
                  e,
                  inputRef.current,
                  newDetailText,
                  setNewDetailText,
                  handleAddDetail
                )
              }
              className="w-full bg-[#1C1C1C] border border-white/15 px-3 py-1.5 pr-10 text-paper rounded-xs focus:border-gold focus:outline-none text-xs"
            />
            <button
              type="button"
              title="Bold selected text (⌘+B or Ctrl+B)"
              onClick={() => toggleBoldOnInput(inputRef.current, newDetailText, setNewDetailText)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-paper/60 hover:text-gold hover:bg-white/10 rounded-xs transition-colors"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={handleAddDetail}
            className="px-3.5 py-1.5 bg-[#252525] hover:bg-[#303030] text-gold rounded-xs border border-white/10 text-xs font-semibold shrink-0"
          >
            Add
          </button>
        </div>

        {/* Real-time formatting preview when bold syntax is present */}
        {newDetailText &&
          (newDetailText.includes('**') ||
            newDetailText.includes('<strong>') ||
            newDetailText.includes('<b>')) && (
            <div className="text-[11px] text-paper/60 flex items-center gap-1.5 pl-1 pt-0.5">
              <span className="text-gold-light/70 font-semibold uppercase text-[9px] tracking-wider">
                Preview:
              </span>
              <span>{renderFormattedText(newDetailText, 'font-bold text-white')}</span>
            </div>
          )}
      </div>
    </div>
  );
}
