'use client';

import React from 'react';
import Image from 'next/image';
import { ShieldAlert, X, Loader2, Trash2 } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/formatPrice';

interface ProductDeleteModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
  isDeleting: boolean;
}

export default function ProductDeleteModal({
  product,
  isOpen,
  onClose,
  onConfirmDelete,
  isDeleting,
}: ProductDeleteModalProps) {
  if (!isOpen || !product) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div className="bg-[#171717] border border-white/15 max-w-md w-full p-6 rounded-xs shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-2.5 text-rose-400">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <h3 className="text-lg font-bold text-white tracking-tight">Delete Product</h3>
          </div>
          <button
            type="button"
            onClick={() => !isDeleting && onClose()}
            className="text-zinc-400 hover:text-white transition-colors p-1 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product Summary Preview */}
        <div className="flex items-center space-x-3.5 bg-[#1F1F1F] p-3 rounded-xs border border-white/10">
          <div className="relative w-12 h-14 bg-stone rounded-xs overflow-hidden shrink-0">
            {product.featuredImage?.startsWith('data:') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.featuredImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src={product.featuredImage || '/hero-jewel.png'}
                alt={product.name}
                fill
                sizes="48px"
                className="object-cover"
              />
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-gold tracking-wider block">
              {product.categoryLabel}
            </span>
            <p className="text-sm text-white font-bold truncate">
              {product.name}
            </p>
            <p className="text-xs text-gold font-extrabold tabular-nums font-mono">
              ৳{formatPrice(product.price)}
            </p>
          </div>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed font-medium">
          Are you sure you want to permanently remove this piece from the Adorous catalogue and live storefront?
        </p>

        <div className="bg-red-950/20 border border-red-800/30 p-2.5 rounded-xs text-[11px] text-red-300/80 leading-normal">
          Warning: This action will permanently purge this design from the PostgreSQL database, including all associated gallery photos, piece breakdowns, and finish colorways.
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 bg-[#222222] hover:bg-[#2A2A2A] border border-white/10 text-paper/70 hover:text-paper text-xs rounded-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirmDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white font-medium text-xs rounded-xs transition-colors flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting piece...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Permanently</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
