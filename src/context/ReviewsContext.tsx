'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Review, ReviewStatus } from '@/types';

interface ReviewsContextType {
  reviews: Review[];
  addReview: (
    productId: string,
    customerName: string,
    rating: number,
    comment: string,
    photoUrl?: string
  ) => void;
  updateReviewStatus: (reviewId: string, status: ReviewStatus) => void;
  getReviewsForProduct: (productId: string) => Review[];
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

const SEED_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    productId: 'zahra-meenakari-navratan-choker',
    customerName: 'Aisha F.',
    rating: 5,
    comment: 'Absolutely stunning craftsmanship. The meenakari work is even more vibrant in person. The packaging was so luxurious!',
    status: 'approved',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rev-2',
    productId: 'noor-polki-bridal-set',
    customerName: 'Tasnim H.',
    rating: 5,
    comment: 'Wore this for my engagement. The quality is exceptional and it catches the light beautifully.',
    status: 'approved',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'rev-3',
    productId: 'marjhaan-velvet-bangles',
    customerName: 'Samira R.',
    rating: 4,
    comment: 'Very elegant velvet finish. Delivery was quick and the packaging is perfect for gifting.',
    status: 'approved',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const ReviewsProvider = ({ children }: { children: ReactNode }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('adorous_reviews');
      if (stored) {
        setReviews(JSON.parse(stored));
      } else {
        // Initialize with seed reviews
        setReviews(SEED_REVIEWS);
        localStorage.setItem('adorous_reviews', JSON.stringify(SEED_REVIEWS));
      }
    } catch (e) {
      console.error('Error loading reviews from localStorage:', e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('adorous_reviews', JSON.stringify(reviews));
    }
  }, [reviews, isLoaded]);

  const addReview = (
    productId: string,
    customerName: string,
    rating: number,
    comment: string,
    photoUrl?: string
  ) => {
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      productId,
      customerName,
      rating,
      comment,
      photoUrl,
      status: 'pending', // All new reviews require admin approval
      createdAt: new Date().toISOString(),
    };
    setReviews((prev) => [newReview, ...prev]);
  };

  const updateReviewStatus = (reviewId: string, status: ReviewStatus) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status } : r))
    );
  };

  const getReviewsForProduct = (productId: string) => {
    // Both storefront and admin might need reviews, but storefront only needs 'approved'
    // This context returns all for a product, let components filter as needed
    return reviews.filter((r) => r.productId === productId);
  };

  return (
    <ReviewsContext.Provider
      value={{
        reviews,
        addReview,
        updateReviewStatus,
        getReviewsForProduct,
      }}
    >
      {children}
    </ReviewsContext.Provider>
  );
};

export const useReviews = () => {
  const context = useContext(ReviewsContext);
  if (context === undefined) {
    throw new Error('useReviews must be used within a ReviewsProvider');
  }
  return context;
};
