'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, MessageSquare, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { useReviews } from '@/context/ReviewsContext';
import { Product } from '@/types';

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

  return (
    <div className="mt-16 pt-12 border-t border-line">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <div className="text-xs font-semibold tracking-[0.2em] uppercase text-gold-ink">
            Atelier Testimonials
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-ink font-medium mt-1">
            Customer Reviews
          </h2>
          
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(averageRating)
                      ? 'fill-gold text-gold'
                      : 'text-line fill-transparent'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-text-muted font-medium">
              {averageRating > 0 ? averageRating.toFixed(1) : 'No reviews yet'} 
              {' '}({approvedReviews.length} {approvedReviews.length === 1 ? 'Review' : 'Reviews'})
            </span>
          </div>
        </div>

        {!isWriting && !submitted && (
          <button
            onClick={() => setIsWriting(true)}
            className="h-11 px-6 bg-ink text-gold-light text-xs font-medium uppercase tracking-wider hover:bg-ink-soft transition-colors"
          >
            Write a Review
          </button>
        )}
      </div>

      {submitted && (
        <div className="mb-10 p-4 bg-success/10 border border-success/20 text-success text-sm flex items-center gap-3 rounded-[2px]">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Thank you! Your review has been submitted and is pending moderation by our atelier team.</span>
        </div>
      )}

      {isWriting && (
        <form onSubmit={handleSubmit} className="mb-12 p-6 bg-sand/30 border border-line rounded-[2px]">
          <h3 className="font-serif text-lg text-ink mb-4">Share Your Experience</h3>
          
          <div className="space-y-5">
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
                      className={`w-6 h-6 ${
                        star <= formState.rating
                          ? 'fill-gold text-gold'
                          : 'text-line fill-transparent hover:text-gold/50'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-ink uppercase tracking-wider mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  placeholder="e.g. Samira R."
                  className="w-full bg-paper border border-line p-3 text-sm focus:border-gold outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Attach Photo (Optional)</span>
                  <span className="text-text-muted text-[10px] normal-case tracking-normal">Simulated Upload</span>
                </label>
                
                {!formState.photoUrl ? (
                  <button
                    type="button"
                    onClick={() => setIsPhotoSelectorOpen(!isPhotoSelectorOpen)}
                    className="w-full h-[46px] bg-paper border border-line border-dashed flex items-center justify-center gap-2 text-sm text-text-muted hover:border-gold hover:text-ink transition-colors"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Select Still-Life Photo
                  </button>
                ) : (
                  <div className="relative h-[46px] w-full border border-line bg-paper flex items-center justify-between px-3">
                    <span className="text-sm text-ink truncate">Photo attached</span>
                    <button
                      type="button"
                      onClick={() => setFormState({ ...formState, photoUrl: '' })}
                      className="text-xs text-error hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
                
                {isPhotoSelectorOpen && !formState.photoUrl && (
                  <div className="mt-2 p-3 bg-paper border border-line grid grid-cols-3 gap-2">
                    {STILL_LIFE_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setFormState({ ...formState, photoUrl: preset });
                          setIsPhotoSelectorOpen(false);
                        }}
                        className="relative aspect-square border border-transparent hover:border-gold transition-colors overflow-hidden"
                      >
                        <Image src={preset} alt="Preset" fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-ink uppercase tracking-wider mb-2">
                Your Review
              </label>
              <textarea
                required
                value={formState.comment}
                onChange={(e) => setFormState({ ...formState, comment: e.target.value })}
                placeholder="Share details about the craftsmanship, packaging, and your overall experience..."
                rows={4}
                className="w-full bg-paper border border-line p-3 text-sm focus:border-gold outline-none transition-colors resize-none"
              />
            </div>
            
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="h-11 px-6 bg-gold text-ink text-xs font-semibold uppercase tracking-wider hover:bg-gold-light transition-colors"
              >
                Submit Review
              </button>
              <button
                type="button"
                onClick={() => setIsWriting(false)}
                className="h-11 px-6 bg-transparent text-text-muted text-xs font-medium uppercase tracking-wider hover:text-ink transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Review List */}
      <div className="space-y-6">
        {approvedReviews.length === 0 ? (
          <div className="py-12 text-center text-text-muted flex flex-col items-center">
            <MessageSquare className="w-8 h-8 mb-3 opacity-20" />
            <p className="text-sm">No reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {approvedReviews.map((review) => (
              <div key={review.id} className="p-6 bg-paper border border-line flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-ink text-sm">{review.customerName}</h4>
                    <span className="text-[11px] text-text-muted">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
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
                </div>

                <p className="text-sm text-ink/80 leading-relaxed flex-grow">
                  "{review.comment}"
                </p>

                {review.photoUrl && (
                  <div className="mt-4 relative w-20 h-20 border border-line shrink-0">
                    <Image
                      src={review.photoUrl}
                      alt="Customer attached photo"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
