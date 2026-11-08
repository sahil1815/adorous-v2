'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, CheckCircle, XCircle, Clock, Eye, ExternalLink, Package, MessageSquare } from 'lucide-react';
import { useReviews } from '@/context/ReviewsContext';
import { useInventory } from '@/context/InventoryContext';
import { Review, ReviewStatus } from '@/types';

export default function AdminReviewsPage() {
  const { reviews, updateReviewStatus } = useReviews();
  const { allProducts } = useInventory();
  const [activeTab, setActiveTab] = useState<ReviewStatus>('pending');

  const filteredReviews = reviews.filter((r) => r.status === activeTab);

  const pendingCount = reviews.filter((r) => r.status === 'pending').length;
  const approvedCount = reviews.filter((r) => r.status === 'approved').length;
  const rejectedCount = reviews.filter((r) => r.status === 'rejected').length;

  const getProductInfo = (productId: string) => {
    return allProducts.find((p) => p.id === productId || p.slug === productId);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Review Moderation Desk</h1>
            <span className="bg-gold/20 text-gold text-[10px] uppercase font-bold px-2 py-0.5 rounded-xs border border-gold/30">
              Social Proof
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Approve or reject customer reviews and testimonials before they appear on the storefront.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-zinc-400">
          <MessageSquare className="w-4 h-4 text-gold" />
          <span>Total reviews: <strong className="text-white font-mono">{reviews.length}</strong></span>
        </div>
      </div>

      <div className="flex border-b border-white/10 space-x-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors relative cursor-pointer ${
            activeTab === 'pending' ? 'text-gold border-b-2 border-gold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Pending
          {pendingCount > 0 && (
            <span className="ml-2 bg-rose-500 text-white text-[11px] font-extrabold px-1.5 py-0.5 rounded-full">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            activeTab === 'approved' ? 'text-gold border-b-2 border-gold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Approved ({approvedCount})
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            activeTab === 'rejected' ? 'text-gold border-b-2 border-gold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Rejected ({rejectedCount})
        </button>
      </div>

      {filteredReviews.length === 0 ? (
        <div className="bg-[#141414] border border-white/10 p-12 text-center flex flex-col items-center justify-center rounded-xs">
          <Clock className="w-8 h-8 text-zinc-500 mb-3" />
          <p className="text-sm text-zinc-400 font-semibold">No {activeTab} reviews found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReviews.map((review) => {
            const product = getProductInfo(review.productId);

            return (
              <div key={review.id} className="bg-[#141414] border border-white/10 p-5 flex flex-col rounded-xs hover:border-gold/30 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">{review.customerName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= review.rating ? 'fill-gold text-gold' : 'text-zinc-600 fill-transparent'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-zinc-400 font-mono font-medium">
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {review.status === 'pending' ? (
                    <span className="bg-amber-950/60 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-xs animate-pulse">
                      Action Required
                    </span>
                  ) : review.status === 'approved' ? (
                    <span className="bg-emerald-950/60 text-emerald-300 border border-emerald-600/30 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-xs">
                      Live on Store
                    </span>
                  ) : (
                    <span className="bg-rose-950/60 text-rose-300 border border-rose-600/30 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-xs">
                      Rejected
                    </span>
                  )}
                </div>

                {/* Product Context Card */}
                <div className="mb-3 p-2 bg-[#0E0E0E] rounded-xs border border-white/5 flex items-center space-x-2.5">
                  {product ? (
                    <>
                      <div className="w-8 h-8 rounded-xs overflow-hidden border border-white/10 bg-black shrink-0 relative">
                        <Image
                          src={product.featuredImage}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="32px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-semibold text-white truncate block">
                          {product.name}
                        </span>
                        <span className="text-[10px] text-zinc-400 capitalize">
                          {product.categoryLabel || product.category}
                        </span>
                      </div>
                      <Link
                        href={`/admin/inventory/edit/${product.id}`}
                        className="text-zinc-400 hover:text-gold p-1 transition-colors"
                        title="View Product in Catalogue"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </>
                  ) : (
                    <div className="text-xs text-zinc-400 font-mono flex items-center gap-1.5 font-medium">
                      <Package className="w-3.5 h-3.5 text-gold" />
                      <span>Product: {review.productId}</span>
                    </div>
                  )}
                </div>

                <div className="bg-[#1A1A1A] p-3.5 rounded-xs mb-4 text-sm text-zinc-200 leading-relaxed italic border-l-2 border-gold flex-grow">
                  &ldquo;{review.comment}&rdquo;
                </div>

                {review.photoUrl && (
                  <div className="mb-4">
                    <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2 block">
                      Attached Still-Life Photo
                    </span>
                    <div className="relative w-24 h-24 border border-white/15 rounded-xs overflow-hidden bg-black">
                      <Image
                        src={review.photoUrl}
                        alt="Review Photo"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3 mt-auto">
                  {activeTab !== 'rejected' && (
                    <button
                      onClick={() => updateReviewStatus(review.id, 'rejected')}
                      className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-400 hover:text-rose-300 transition-colors px-3 py-2 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  )}
                  {activeTab !== 'approved' && (
                    <button
                      onClick={() => updateReviewStatus(review.id, 'approved')}
                      className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-gold text-ink hover:bg-gold-light transition-colors px-4 py-2 rounded-xs cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve to Store</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
