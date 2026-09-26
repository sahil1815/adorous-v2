'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, MessageSquare, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { useReviews } from '@/context/ReviewsContext';
import { Product, Review } from '@/types';

// Mock presets for the simulated photo upload to strictly enforce "NO HUMAN IMAGERY"
const STILL_LIFE_PRESETS = [
  '/images/inventory/presets/stone-plinth.jpg',
  '/images/inventory/presets/velvet-bust.jpg',
  '/images/inventory/presets/flat-lay-tray.jpg',
];

interface ReviewSectionProps {
  product: Product;
}

export default function ReviewSection({ product }: ReviewSectionProps) {
  const { addReview, getReviewsForProduct } = useReviews();
  const allReviews = getReviewsForProduct(product.id);
  const approvedReviews = allReviews.filter((r) => r.status === 'approved');

  const [isWriting, setIsWriting] = useState(false);
  const [formState, setFormState] = useState({
    name: '',
    rating: 5,
    comment: '',
    photoUrl: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isPhotoSelectorOpen, setIsPhotoSelectorOpen] = useState(false);

  // Calculate Average Rating
  const averageRating = approvedReviews.length > 0
    ? approvedReviews.reduce((acc, rev) => acc + rev.rating, 0) / approvedReviews.length
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim() || !formState.comment.trim()) return;

    addReview(
      product.id,
      formState.name,
      formState.rating,
      formState.comment,
      formState.photoUrl || undefined
    );
    
    setSubmitted(true);
    setIsWriting(false);
    
    // Reset form after a few seconds to allow another review if needed
    setTimeout(() => {
      setSubmitted(false);
      setFormState({ name: '', rating: 5, comment: '', photoUrl: '' });
    }, 4000);
  };

  const fallbackReviews: Review[] = [
    {
      id: `seed-rev-1-${product.id}`,
      productId: product.id,
      customerName: 'Manik',
      rating: 4,
      colorwayName: product.colorways[1]?.name || product.colorways[0]?.name || 'Dark Grey',
      comment: 'Daily use e kono problem hoy nai, onek comfortable lage.',
      status: 'approved',
      createdAt: '2026-06-28T12:00:00.000Z',
    },
    {
      id: `seed-rev-2-${product.id}`,
      productId: product.id,
      customerName: 'Manik',
      rating: 5,
      colorwayName: product.colorways[0]?.name || 'Black',
      comment: 'Delivery expected time er moddhei chole esheche, eta amar kache onek positive ekta dik mone hoyeche.',
      status: 'approved',
      createdAt: '2026-05-18T15:30:00.000Z',
    },
  ];

  const displayReviews: Review[] = approvedReviews.length > 0 ? approvedReviews : fallbackReviews;

  return (
    <div className="mt-14 pt-10 border-t border-line">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gold-ink">
            Verified Feedback
          </div>
          <h2 className="font-serif text-xl sm:text-2xl text-ink font-semibold mt-0.5">
            Rating & Reviews
          </h2>
        </div>

        {!isWriting && !submitted && (
          <button
            onClick={() => setIsWriting(true)}
            className="h-9 px-4 bg-gold hover:bg-gold-deep text-ink text-xs font-semibold uppercase tracking-wider rounded-[3px] transition-colors"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Rating & Reviews Breakdown Card (Screenshot 2 matching) */}
      <div className="mb-8 p-4 sm:p-5 bg-paper border border-line rounded-lg flex items-center justify-between gap-4 shadow-xs">
        {/* Left: Overall Score */}
        <div className="flex flex-col items-center justify-center shrink-0 pr-4 sm:pr-8 border-r border-line min-w-[110px] sm:min-w-[130px]">
          <div className="text-3xl sm:text-4xl font-bold text-ink flex items-center gap-1.5">
            <span>4.8</span>
            <span className="text-amber-500 text-2xl sm:text-3xl">★</span>
          </div>
          <span className="text-[11px] text-text-muted mt-1 text-center whitespace-nowrap">
            By Verified Buyers
          </span>
        </div>

        {/* Right: Star Distribution Bars */}
        <div className="flex-1 space-y-1.5 max-w-sm">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = displayReviews.filter((r) => r.rating === star).length;
            const percentage = displayReviews.length > 0 ? (count / displayReviews.length) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-5 text-right font-medium text-ink flex items-center justify-end gap-0.5">
                  {star} <span className="text-amber-500 text-[10px]">★</span>
                </span>
                <div className="flex-1 h-2 bg-sand/70 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold-deep rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-4 text-left text-text-muted tabular-nums text-[11px]">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {submitted && (
        <div className="mb-8 p-4 bg-success/10 border border-success/20 text-success text-sm flex items-center gap-3 rounded-[3px]">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Thank you! Your review has been submitted and is pending moderation by our atelier team.</span>
        </div>
      )}

      {isWriting && (
        <form onSubmit={handleSubmit} className="mb-10 p-5 bg-sand/30 border border-line rounded-lg">
          <h3 className="font-serif text-lg text-ink font-semibold mb-4">Share Your Experience</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink uppercase tracking-wider mb-2">
                Overall Rating
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormState({ ...formState, rating: star })}
                    className="p-1 hover:scale-110 transition-transform focus:outline-none"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= formState.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-line fill-transparent hover:text-amber-400/50'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-ink uppercase tracking-wider mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  placeholder="e.g. Samira R."
                  className="w-full bg-paper border border-line p-2.5 text-sm focus:border-gold outline-none transition-colors rounded-[3px]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Attach Photo (Optional)</span>
                  <span className="text-text-muted text-[10px] normal-case">Still-Life Only</span>
                </label>
                
                {!formState.photoUrl ? (
                  <button
                    type="button"
                    onClick={() => setIsPhotoSelectorOpen(!isPhotoSelectorOpen)}
                    className="w-full h-[42px] bg-paper border border-line border-dashed rounded-[3px] flex items-center justify-center gap-2 text-xs text-text-muted hover:border-gold hover:text-ink transition-colors"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Select Still-Life Photo
                  </button>
                ) : (
                  <div className="relative h-[42px] w-full border border-line bg-paper rounded-[3px] flex items-center justify-between px-3">
                    <span className="text-xs text-ink truncate">Photo attached</span>
                    <button
                      type="button"
                      onClick={() => setFormState({ ...formState, photoUrl: '' })}
                      className="text-xs text-rose-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
                
                {isPhotoSelectorOpen && !formState.photoUrl && (
                  <div className="mt-2 p-3 bg-paper border border-line rounded-[3px] grid grid-cols-3 gap-2">
                    {STILL_LIFE_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setFormState({ ...formState, photoUrl: preset });
                          setIsPhotoSelectorOpen(false);
                        }}
                        className="relative aspect-square border border-transparent hover:border-gold transition-colors overflow-hidden rounded-xs"
                      >
                        <Image src={preset} alt="Preset" fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-ink uppercase tracking-wider mb-1.5">
                Your Review
              </label>
              <textarea
                required
                value={formState.comment}
                onChange={(e) => setFormState({ ...formState, comment: e.target.value })}
                placeholder="Share details about the craftsmanship, finish, and delivery..."
                rows={3}
                className="w-full bg-paper border border-line p-2.5 text-sm focus:border-gold outline-none transition-colors resize-none rounded-[3px]"
              />
            </div>
            
            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                className="h-10 px-5 bg-gold text-ink text-xs font-semibold uppercase tracking-wider hover:bg-gold-light transition-colors rounded-[3px]"
              >
                Submit Review
              </button>
              <button
                type="button"
                onClick={() => setIsWriting(false)}
                className="h-10 px-5 bg-transparent text-text-muted text-xs font-medium uppercase tracking-wider hover:text-ink transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Product Reviews Heading (Screenshot 2 matching) */}
      <h3 className="font-serif text-base sm:text-lg text-ink font-semibold mb-4">
        Product Reviews ({displayReviews.length})
      </h3>

      {/* Review List (Screenshot 2 matching) */}
      <div className="space-y-3.5">
        {displayReviews.map((review) => {
          const dateObj = new Date(review.createdAt);
          const formattedDate = !isNaN(dateObj.getTime())
            ? `${String(dateObj.getDate()).padStart(2, '0')}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${dateObj.getFullYear()}`
            : '28-06-2026';

          return (
            <div key={review.id} className="p-4 bg-paper border border-line rounded-lg shadow-2xs">
              {/* Header: Name and Star Rating */}
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-ink text-sm">{review.customerName}</h4>
                <div className="flex items-center gap-0.5 text-amber-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-sm">
                      {star <= review.rating ? '★' : '☆'}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sub-row: Color & Date */}
              <div className="text-[11px] text-text-muted mt-0.5 mb-2 flex items-center gap-2">
                <span>Color: {review.colorwayName || product.colorways[0]?.name || 'Standard Finish'}</span>
                <span>•</span>
                <span>{formattedDate}</span>
              </div>

              {/* Review Comment */}
              <p className="text-xs sm:text-sm text-ink/90 leading-relaxed">
                {review.comment}
              </p>

              {review.photoUrl && (
                <div className="mt-3 relative w-16 h-16 border border-line rounded-xs overflow-hidden shrink-0">
                  <Image
                    src={review.photoUrl}
                    alt="Customer product photo"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
