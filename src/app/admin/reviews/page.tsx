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
        <h1 className="font-serif text-2xl text-ink font-medium">Review Moderation Desk</h1>
        <p className="text-sm text-text-muted mt-1">
          Approve or reject customer reviews and testimonials before they appear on the storefront.
        </p>
      </div>

      <div className="flex border-b border-line space-x-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 text-sm font-medium uppercase tracking-wider transition-colors relative ${
            activeTab === 'pending' ? 'text-ink border-b-2 border-ink' : 'text-text-muted hover:text-ink'
          }`}
        >
          Pending
          {pendingCount > 0 && (
            <span className="ml-2 bg-error text-white text-[10px] px-1.5 py-0.5 rounded-full">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`pb-3 text-sm font-medium uppercase tracking-wider transition-colors ${
            activeTab === 'approved' ? 'text-ink border-b-2 border-ink' : 'text-text-muted hover:text-ink'
          }`}
        >
          Approved ({approvedCount})
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          className={`pb-3 text-sm font-medium uppercase tracking-wider transition-colors ${
            activeTab === 'rejected' ? 'text-ink border-b-2 border-ink' : 'text-text-muted hover:text-ink'
          }`}
        >
          Rejected ({rejectedCount})
        </button>
      </div>

      {filteredReviews.length === 0 ? (
        <div className="bg-paper border border-line p-12 text-center flex flex-col items-center justify-center">
          <Clock className="w-8 h-8 text-line mb-3" />
          <p className="text-sm text-text-muted font-medium">No {activeTab} reviews found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-paper border border-line p-5 flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-ink">{review.customerName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= review.rating ? 'fill-gold text-gold' : 'text-line fill-transparent'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-text-muted font-mono">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                {review.status === 'pending' && (
                  <span className="bg-alert/10 text-alert border border-alert/20 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-[2px]">
                    Action Required
                  </span>
                )}
              </div>
              
              <div className="mb-3 text-xs text-text-muted font-mono flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span>Product ID: {review.productId}</span>
              </div>

              <div className="bg-sand/30 p-3 rounded-[2px] mb-4 text-sm text-ink/90 leading-relaxed italic border-l-2 border-gold-light flex-grow">
                "{review.comment}"
              </div>

              {review.photoUrl && (
                <div className="mb-4">
                  <span className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 block">
                    Attached Photo
                  </span>
                  <div className="relative w-24 h-24 border border-line">
                    <Image
                      src={review.photoUrl}
                      alt="Review Photo"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-line flex items-center justify-end gap-3 mt-auto">
                {activeTab !== 'rejected' && (
                  <button
                    onClick={() => updateReviewStatus(review.id, 'rejected')}
                    className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted hover:text-error transition-colors px-3 py-2"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                )}
                {activeTab !== 'approved' && (
                  <button
                    onClick={() => updateReviewStatus(review.id, 'approved')}
                    className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider bg-ink text-gold-light hover:bg-ink-soft transition-colors px-4 py-2 rounded-[2px]"
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
