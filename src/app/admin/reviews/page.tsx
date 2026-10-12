'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { useReviews } from '@/context/ReviewsContext';
import { Review, ReviewStatus } from '@/types';

export default function AdminReviewsPage() {
  const { reviews, updateReviewStatus } = useReviews();
  const [activeTab, setActiveTab] = useState<ReviewStatus>('pending');

  const filteredReviews = reviews.filter((r) => r.status === activeTab);

  const pendingCount = reviews.filter((r) => r.status === 'pending').length;
  const approvedCount = reviews.filter((r) => r.status === 'approved').length;
  const rejectedCount = reviews.filter((r) => r.status === 'rejected').length;

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Review Moderation Desk</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Approve or reject customer reviews and testimonials before they appear on the storefront.
        </p>
      </div>

      <div className="flex border-b border-white/10 space-x-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors relative ${
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
          className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'approved' ? 'text-gold border-b-2 border-gold' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Approved ({approvedCount})
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors ${
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
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-[#141414] border border-white/10 p-5 flex flex-col rounded-xs">
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
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                {review.status === 'pending' && (
                  <span className="bg-amber-950/60 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-xs">
                    Action Required
                  </span>
                )}
              </div>
              
              <div className="mb-3 text-xs text-zinc-400 font-mono flex items-center gap-1.5 font-medium">
                <Eye className="w-3.5 h-3.5 text-gold" />
                <span>Product ID: {review.productId}</span>
              </div>

              <div className="bg-[#1A1A1A] p-3.5 rounded-xs mb-4 text-sm text-zinc-200 leading-relaxed italic border-l-2 border-gold flex-grow">
                "{review.comment}"
              </div>

              {review.photoUrl && (
                <div className="mb-4">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2 block">
                    Attached Photo
                  </span>
                  <div className="relative w-24 h-24 border border-white/15 rounded-xs overflow-hidden">
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
                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-400 hover:text-rose-300 transition-colors px-3 py-2"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                )}
                {activeTab !== 'approved' && (
                  <button
                    onClick={() => updateReviewStatus(review.id, 'approved')}
                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-gold text-ink hover:bg-gold-light transition-colors px-4 py-2 rounded-xs"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve to Store</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
