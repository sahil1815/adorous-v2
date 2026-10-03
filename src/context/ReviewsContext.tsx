'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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
  getReviewsForProduct: (productIdOrSlug: string, slug?: string) => Review[];
  getProductRating: (product: { id: string; slug?: string }) => { avg: number; count: number };
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

const SEED_REVIEWS: Review[] = [
  // ─── Moonlit Pearl Set ───────────────────────────────────────
  {
    id: 'rev-moonlit-1',
    productId: 'prod-moonlit-pearl-set',
    customerName: 'Nusrat J.',
    rating: 5,
    colorwayName: 'Silver & Pristine Pearl',
    comment: 'The pearls have such a gorgeous luster — way better than I expected for this price. The teardrop crystal pendant really catches the light. Wore it to my cousin\'s holud and got so many compliments!',
    status: 'approved',
    createdAt: '2026-09-18T10:30:00.000Z',
  },
  {
    id: 'rev-moonlit-2',
    productId: 'prod-moonlit-pearl-set',
    customerName: 'Rafiq H.',
    rating: 5,
    colorwayName: 'Silver & Pristine Pearl',
    comment: 'Bought this as an anniversary gift for my wife. She absolutely loved the earrings especially. The velvet pouch it came in made the whole thing feel premium. Will definitely order from Adorous again.',
    status: 'approved',
    createdAt: '2026-09-25T14:15:00.000Z',
  },
  {
    id: 'rev-moonlit-3',
    productId: 'prod-moonlit-pearl-set',
    customerName: 'Tamanna S.',
    rating: 4,
    colorwayName: 'Silver & Pristine Pearl',
    comment: 'Really elegant set. The necklace clasp is a little tricky to close on your own but once it\'s on, it sits beautifully. Great quality for the price.',
    status: 'approved',
    createdAt: '2026-09-30T08:45:00.000Z',
  },

  // ─── Kashmiri Noor-e-Sitara ──────────────────────────────────
  {
    id: 'rev-sitara-1',
    productId: 'prod-kashmiri-noor-e-sitara',
    customerName: 'Farzana B.',
    rating: 5,
    colorwayName: 'Teal & Antique Silver',
    comment: 'These jhumkas are HEAVY in the best way — they feel so substantial and high quality. The teal stones are vivid and the little ghungroo bells make the prettiest sound when you walk. Absolutely love the heritage feel.',
    status: 'approved',
    createdAt: '2026-08-12T11:00:00.000Z',
  },
  {
    id: 'rev-sitara-2',
    productId: 'prod-kashmiri-noor-e-sitara',
    customerName: 'Arman K.',
    rating: 4,
    colorwayName: 'Teal & Antique Silver',
    comment: 'Got these for my sister for her birthday. She said the oxidized finish looks very authentic and the packaging was very nice. She\'s been wearing them almost every other day since.',
    status: 'approved',
    createdAt: '2026-08-20T16:30:00.000Z',
  },

  // ─── Kashmiri Noor-e-Firuzah ─────────────────────────────────
  {
    id: 'rev-firuzah-1',
    productId: 'prod-kashmiri-noor-e-firuzah',
    customerName: 'Meherun N.',
    rating: 5,
    colorwayName: 'Turquoise & Antique Silver',
    comment: 'The peacock motif is stunning — like actual silverwork you\'d see in old Kashmiri shops. I wore these with a black saree and they stood out beautifully. The turquoise centerpiece is so vibrant!',
    status: 'approved',
    createdAt: '2026-09-02T09:00:00.000Z',
  },
  {
    id: 'rev-firuzah-2',
    productId: 'prod-kashmiri-noor-e-firuzah',
    customerName: 'Sabbir A.',
    rating: 5,
    colorwayName: 'Turquoise & Antique Silver',
    comment: 'My fiancée wanted statement earrings for our engagement photos and these were perfect. The ghungroo bells add such a nice traditional touch. Delivery to Chattogram took 3 days which was reasonable.',
    status: 'approved',
    createdAt: '2026-09-10T13:20:00.000Z',
  },
  {
    id: 'rev-firuzah-3',
    productId: 'prod-kashmiri-noor-e-firuzah',
    customerName: 'Rima C.',
    rating: 4,
    colorwayName: 'Turquoise & Antique Silver',
    comment: 'Beautiful design and the crescent shape is very flattering. Just a tiny bit heavier than I expected for all-day wear, but for events they\'re absolutely gorgeous.',
    status: 'approved',
    createdAt: '2026-09-22T17:45:00.000Z',
  },

  // ─── Traditional Filigree Bell Jhumka ────────────────────────
  {
    id: 'rev-filigree-1',
    productId: 'prod-traditional-filigree-bell-jhumka',
    customerName: 'Priya D.',
    rating: 5,
    colorwayName: 'Ruby Red',
    comment: 'I ordered the Ruby Red and oh my god, the color is gorgeous! The filigree work is so detailed — you can tell real effort went into the craftsmanship. The bells jingle softly and it\'s the cutest thing.',
    status: 'approved',
    createdAt: '2026-07-15T10:00:00.000Z',
  },
  {
    id: 'rev-filigree-2',
    productId: 'prod-traditional-filigree-bell-jhumka',
    customerName: 'Tanvir M.',
    rating: 4,
    colorwayName: 'Jade Green',
    comment: 'Bought the Jade Green one for my mother for Eid. She was really impressed with how it looked inside the keepsake box. She said the push-back is comfortable and doesn\'t irritate her ears. Good value overall.',
    status: 'approved',
    createdAt: '2026-08-05T12:30:00.000Z',
  },
  {
    id: 'rev-filigree-3',
    productId: 'prod-traditional-filigree-bell-jhumka',
    customerName: 'Sadia I.',
    rating: 5,
    colorwayName: 'Moonstone White',
    comment: 'I have the Moonstone White and it goes with literally everything! Perfect everyday jhumka that still looks dressy enough for occasions. The antique silver finish hasn\'t faded at all after weeks of wearing.',
    status: 'approved',
    createdAt: '2026-08-28T15:00:00.000Z',
  },

  // ─── Festive Heritage Silk Thread Bangles ────────────────────
  {
    id: 'rev-heritage-1',
    productId: 'prod-festive-heritage-silk-thread-bangles',
    customerName: 'Nazia R.',
    rating: 5,
    colorwayName: 'Festive Multi-Color Quad (Green, Red, Gold, Black)',
    comment: 'Best churi purchase I\'ve made in a long time! The Kundan work on each pair is different and beautiful. I stacked all four for Eid and my wrist looked like a magazine photo. The silk wrapping is super smooth — no rough edges at all.',
    status: 'approved',
    createdAt: '2026-07-20T09:00:00.000Z',
  },
  {
    id: 'rev-heritage-2',
    productId: 'prod-festive-heritage-silk-thread-bangles',
    customerName: 'Imran S.',
    rating: 4,
    colorwayName: 'Festive Multi-Color Quad (Green, Red, Gold, Black)',
    comment: 'Ordered this set as a gift for my wife. She loved the red and gold pairs the most. The pearl detailing is delicate and pretty. Packaging was secure and nothing was broken during delivery. Only wish they came with size options.',
    status: 'approved',
    createdAt: '2026-08-02T14:00:00.000Z',
  },
  {
    id: 'rev-heritage-3',
    productId: 'prod-festive-heritage-silk-thread-bangles',
    customerName: 'Mithila A.',
    rating: 5,
    colorwayName: 'Festive Multi-Color Quad (Green, Red, Gold, Black)',
    comment: 'Four different colors in one set is such great value. I wear two pairs at a time and mix-match depending on what I\'m wearing. The emerald green is my favorite — so rich and vibrant!',
    status: 'approved',
    createdAt: '2026-09-05T11:30:00.000Z',
  },

  // ─── Magenta Majesty Silk Thread Churi Set ───────────────────
  {
    id: 'rev-magenta-1',
    productId: 'prod-the-magenta-majesty-silk-thread-churi-set',
    customerName: 'Sharmin K.',
    rating: 5,
    colorwayName: 'Royal Deep Magenta',
    comment: 'The magenta color is SO vibrant in person! I absolutely love how each bangle in the stack has a different design — the geometric Kundan ones are my favorite. Wore the full stack to a wedding reception and it looked incredible.',
    status: 'approved',
    createdAt: '2026-08-10T10:00:00.000Z',
  },
  {
    id: 'rev-magenta-2',
    productId: 'prod-the-magenta-majesty-silk-thread-churi-set',
    customerName: 'Habib U.',
    rating: 4,
    colorwayName: 'Royal Deep Magenta',
    comment: 'Bought for my wife\'s birthday and she was genuinely surprised by the quality. The wire wrapping details and pearl borders look very expensive. She paired them with a magenta saree — perfect match.',
    status: 'approved',
    createdAt: '2026-09-01T16:00:00.000Z',
  },

  // ─── Royal Floral Silk Thread Churi Set (Maroon & Teal) ──────
  {
    id: 'rev-royal-1',
    productId: 'prod-the-royal-floral-silk-thread-churi-set-maroon-teal',
    customerName: 'Laboni G.',
    rating: 5,
    colorwayName: 'Maroon & Teal Royal Combo',
    comment: 'The maroon and teal contrast is just *chef\'s kiss*! The mirror-work border bangles are the highlight — they add such a premium feel to the entire stack. I got so many "where did you get these?" questions at my friend\'s wedding.',
    status: 'approved',
    createdAt: '2026-07-28T11:15:00.000Z',
  },
  {
    id: 'rev-royal-2',
    productId: 'prod-the-royal-floral-silk-thread-churi-set-maroon-teal',
    customerName: 'Asif R.',
    rating: 5,
    colorwayName: 'Maroon & Teal Royal Combo',
    comment: 'This was a gift for my mother and she couldn\'t stop admiring the pearl drops on the border bangles. The keepsake box it came in was a nice touch. She said the maroon ones match perfectly with her Jamdani sarees.',
    status: 'approved',
    createdAt: '2026-08-18T13:00:00.000Z',
  },
  {
    id: 'rev-royal-3',
    productId: 'prod-the-royal-floral-silk-thread-churi-set-maroon-teal',
    customerName: 'Farhana T.',
    rating: 4,
    colorwayName: 'Maroon & Teal Royal Combo',
    comment: 'Very pretty set and the handmade quality shows. The floral gold appliques are detailed and sturdy. The teal bangles are slightly brighter than the photos but I actually prefer them this way.',
    status: 'approved',
    createdAt: '2026-09-14T09:30:00.000Z',
  },

  // ─── Luxe Floral Crystal Duo (2-Piece Set) ──────────────────
  {
    id: 'rev-floralduo-1',
    productId: 'prod-luxe-floral-crystal-duo-2-piece-set',
    customerName: 'Rumana P.',
    rating: 5,
    colorwayName: 'Imperial Amethyst Purple',
    comment: 'This set literally takes your breath away when you open the box. The amethyst purple crystals are deep and rich, and the way the teardrop pendant catches light is mesmerizing. Wore it to a gala dinner and felt like royalty.',
    status: 'approved',
    createdAt: '2026-08-22T10:45:00.000Z',
  },
  {
    id: 'rev-floralduo-2',
    productId: 'prod-luxe-floral-crystal-duo-2-piece-set',
    customerName: 'Kawsar M.',
    rating: 4,
    colorwayName: 'Blush Rose Pink',
    comment: 'Got the Blush Rose Pink as a birthday gift for my girlfriend. She was thrilled — said the color is very elegant and not too flashy. The matching earrings complete the look really well. Delivery was smooth, reached Sylhet in 4 days.',
    status: 'approved',
    createdAt: '2026-09-08T15:20:00.000Z',
  },
  {
    id: 'rev-floralduo-3',
    productId: 'prod-luxe-floral-crystal-duo-2-piece-set',
    customerName: 'Tasfia L.',
    rating: 5,
    colorwayName: 'Imperial Amethyst Purple',
    comment: 'I have the purple one and honestly considering getting the pink one too. The crystal leaf design on the necklace is so unique — never seen anything like it in local stores. Quality is amazing for the price.',
    status: 'approved',
    createdAt: '2026-09-20T12:00:00.000Z',
  },

  // ─── Luxe Crystal Gemstone Suite (2-Piece Set) ───────────────
  {
    id: 'rev-gem2pc-1',
    productId: 'prod-luxe-crystal-gemstone-suite-2-piece-set',
    customerName: 'Nasreen A.',
    rating: 5,
    colorwayName: 'Radiant Gold',
    comment: 'The gold finish on this set is gorgeous — warm and rich without being tacky. I wear the necklace almost daily now. It\'s lightweight enough for everyday but shiny enough for special occasions.',
    status: 'approved',
    createdAt: '2026-08-14T09:00:00.000Z',
  },
  {
    id: 'rev-gem2pc-2',
    productId: 'prod-luxe-crystal-gemstone-suite-2-piece-set',
    customerName: 'Jahid T.',
    rating: 4,
    colorwayName: 'Brilliant Silver',
    comment: 'Ordered the silver version for my sister\'s engagement. She said the crystal drop pendant is really eye-catching and the earrings are comfortable. The presentation box made it feel extra special when she opened it.',
    status: 'approved',
    createdAt: '2026-09-03T14:30:00.000Z',
  },

  // ─── Luxe Golden Crystal Gemstone Suite (5-Piece Box Set) ────
  {
    id: 'rev-gold5pc-1',
    productId: 'prod-luxe-golden-crystal-gemstone-suite-5-piece-box-set',
    customerName: 'Sumaiya H.',
    rating: 5,
    colorwayName: 'Radiant Gold & White Crystal',
    comment: 'This 5-piece set is INCREDIBLE value. Necklace, earrings, bracelet, ring — everything matches perfectly. The PU leather box is also really sturdy and looks luxurious. I use it to store all my jewelry now.',
    status: 'approved',
    createdAt: '2026-07-30T11:00:00.000Z',
  },
  {
    id: 'rev-gold5pc-2',
    productId: 'prod-luxe-golden-crystal-gemstone-suite-5-piece-box-set',
    customerName: 'Rahim C.',
    rating: 5,
    colorwayName: 'Radiant Gold & White Crystal',
    comment: 'Bought this as a wedding gift for a close friend. She literally called me to say how beautiful it was. The gold tone is elegant and the crystals sparkle really nicely. The box packaging is gift-ready, didn\'t need to wrap anything extra.',
    status: 'approved',
    createdAt: '2026-08-15T17:00:00.000Z',
  },
  {
    id: 'rev-gold5pc-3',
    productId: 'prod-luxe-golden-crystal-gemstone-suite-5-piece-box-set',
    customerName: 'Ayesha N.',
    rating: 4,
    colorwayName: 'Radiant Gold & White Crystal',
    comment: 'Very pretty set! The bracelet and ring are adjustable which is great. The necklace crystal pendant catches light beautifully. Only small note: the ring is a touch loose on my finger, but the adjustable band helps.',
    status: 'approved',
    createdAt: '2026-09-12T10:15:00.000Z',
  },

  // ─── Luxe Crystal Gemstone Suite (5-Piece Box Set — Silver) ──
  {
    id: 'rev-silver5pc-1',
    productId: 'prod-luxe-crystal-gemstone-suite-5-piece-box-set-1790364680551',
    customerName: 'Tasneem F.',
    rating: 5,
    colorwayName: 'Diamond White & Silver',
    comment: 'This is my second Adorous purchase and I\'m blown away again. The silver finish looks so refined and the diamonds catch every bit of light. The leather presentation box alone feels like it\'s worth the price!',
    status: 'approved',
    createdAt: '2026-08-08T09:30:00.000Z',
  },
  {
    id: 'rev-silver5pc-2',
    productId: 'prod-luxe-crystal-gemstone-suite-5-piece-box-set-1790364680551',
    customerName: 'Mehedi H.',
    rating: 5,
    colorwayName: 'Diamond White & Silver',
    comment: 'Got this for my wife on our anniversary. She wore the full set — necklace, earrings, bracelet, and ring — to a family dinner and everyone kept asking where she got them. Really happy with this purchase. Cash on delivery was convenient too.',
    status: 'approved',
    createdAt: '2026-09-15T13:00:00.000Z',
  },
  {
    id: 'rev-silver5pc-3',
    productId: 'prod-luxe-crystal-gemstone-suite-5-piece-box-set-1790364680551',
    customerName: 'Lipi R.',
    rating: 4,
    colorwayName: 'Diamond White & Silver',
    comment: 'Beautiful set. I wear the bracelet and necklace daily to the office and they still look brand new after weeks. The earrings are lightweight which I appreciate. Would be perfect if the box had a mirror inside but still very satisfied.',
    status: 'approved',
    createdAt: '2026-09-28T16:20:00.000Z',
  },

  // ─── Luxe Crystal Gemstone Simple Suite (5-Piece Box Set) ────
  {
    id: 'rev-simple5pc-1',
    productId: 'prod-luxe-crystal-gemstone-simple-suite-5-piece-box-set',
    customerName: 'Farjana K.',
    rating: 5,
    colorwayName: 'Minimalist Clear Crystal',
    comment: 'Finally — a minimalist set that actually looks luxurious! The dainty chain on the necklace is perfect and the single crystal pendant is so elegant. I wanted something subtle for my office job and this is exactly it.',
    status: 'approved',
    createdAt: '2026-08-25T10:00:00.000Z',
  },
  {
    id: 'rev-simple5pc-2',
    productId: 'prod-luxe-crystal-gemstone-simple-suite-5-piece-box-set',
    customerName: 'Sohel M.',
    rating: 4,
    colorwayName: 'Minimalist Clear Crystal',
    comment: 'Ordered this for my girlfriend who prefers simple, clean designs. She loved it — said the slim bracelet and ring are her new everyday pieces. The presentation box is nice but a bit smaller than expected.',
    status: 'approved',
    createdAt: '2026-09-06T12:45:00.000Z',
  },

  // ─── The Playful Embossed Commuter Tote ──────────────────────
  {
    id: 'rev-playful-1',
    productId: 'prod-the-playful-embossed-commuter-tote',
    customerName: 'Nabiha S.',
    rating: 5,
    colorwayName: 'Chalk White & Tan Straps',
    comment: 'Cutest bag ever!! The embossed doodle pattern with little hearts and bows is adorable. Used it for university every day for two weeks and it still looks clean. The dual chambers are super practical for keeping things organized.',
    status: 'approved',
    createdAt: '2026-08-01T09:15:00.000Z',
  },
  {
    id: 'rev-playful-2',
    productId: 'prod-the-playful-embossed-commuter-tote',
    customerName: 'Rahat M.',
    rating: 4,
    colorwayName: 'Chalk White & Tan Straps',
    comment: 'Bought this for my younger sister who just started college. She loves it and says it fits her laptop, notebooks, and water bottle easily. The tan straps give it a nice contrast. Only thing is the white color shows dirt faster than expected.',
    status: 'approved',
    createdAt: '2026-08-20T15:30:00.000Z',
  },

  // ─── The Everyday Casual Commuter Tote ───────────────────────
  {
    id: 'rev-everyday-1',
    productId: 'prod-the-everyday-casual-commuter-tote',
    customerName: 'Mim T.',
    rating: 4,
    colorwayName: 'Ivory Cream',
    comment: 'Really nice everyday bag. The textured finish feels durable and the gold hardware adds a classy touch. Fits all my work essentials. The outside pocket is convenient for my phone and transit card.',
    status: 'approved',
    createdAt: '2026-08-04T10:00:00.000Z',
  },
  {
    id: 'rev-everyday-2',
    productId: 'prod-the-everyday-casual-commuter-tote',
    customerName: 'Shahana P.',
    rating: 5,
    colorwayName: 'Midnight Black',
    comment: 'I got the black one and it\'s now my go-to bag for literally everything. The straps are really comfortable even when the bag is full. Love how it goes with both western and desi outfits. Super happy!',
    status: 'approved',
    createdAt: '2026-08-22T14:00:00.000Z',
  },
  {
    id: 'rev-everyday-3',
    productId: 'prod-the-everyday-casual-commuter-tote',
    customerName: 'Faisal Z.',
    rating: 4,
    colorwayName: 'Ivory Cream',
    comment: 'Got the ivory one for my sister. She uses it for her daily commute and says it\'s spacious enough for everything. Build quality seems solid. The only thing is the zipper could be a bit smoother, but not a dealbreaker.',
    status: 'approved',
    createdAt: '2026-09-10T11:30:00.000Z',
  },

  // ─── The Croc-Embossed Structured Satchel ────────────────────
  {
    id: 'rev-croc-1',
    productId: 'prod-the-croc-structured-satchel',
    customerName: 'Raisa M.',
    rating: 5,
    colorwayName: 'Lavender Lilac',
    comment: 'This bag is PREMIUM. The croc texture is so well done and the lavender color is unique — I\'ve never seen anything like it locally. The U-clasp closure is sturdy and the crossbody strap is a game changer for hands-free days.',
    status: 'approved',
    createdAt: '2026-08-06T09:00:00.000Z',
  },
  {
    id: 'rev-croc-2',
    productId: 'prod-the-croc-structured-satchel',
    customerName: 'Nayeem A.',
    rating: 5,
    colorwayName: 'Midnight Black',
    comment: 'Bought the black satchel for my wife. She uses it for formal meetings and dinner events. The structured shape holds up perfectly and the gold hardware looks expensive. She says it gets her compliments every single time.',
    status: 'approved',
    createdAt: '2026-08-28T16:45:00.000Z',
  },
  {
    id: 'rev-croc-3',
    productId: 'prod-the-croc-structured-satchel',
    customerName: 'Faria N.',
    rating: 4,
    colorwayName: 'Lavender Lilac',
    comment: 'Love the design and the structured shape. Fits my wallet, phone, keys, and small makeup pouch perfectly. The crossbody strap is adjustable which is great. Only wish the interior had a small pocket for cards.',
    status: 'approved',
    createdAt: '2026-09-18T12:15:00.000Z',
  },

  // ─── The Woven Tweed Structured Satchel ──────────────────────
  {
    id: 'rev-tweed-1',
    productId: 'prod-the-tweed-structured-satchel',
    customerName: 'Lamia J.',
    rating: 5,
    colorwayName: 'Ivory & Gold Tweed',
    comment: 'This gives major French chic vibes! The gold threading in the tweed catches light so beautifully. I use the top handle mostly but the crossbody strap is nice to have. Feels very luxurious for the price.',
    status: 'approved',
    createdAt: '2026-08-16T10:30:00.000Z',
  },
  {
    id: 'rev-tweed-2',
    productId: 'prod-the-tweed-structured-satchel',
    customerName: 'Shafiq R.',
    rating: 4,
    colorwayName: 'Midnight Black & Gold Tweed',
    comment: 'Got the black & gold tweed for my fiancée. She said it\'s her new favorite bag — the woven texture with the mock-croc handle is a really nice combination. Delivery to Rajshahi was on time. The U-clasp feels secure.',
    status: 'approved',
    createdAt: '2026-09-04T15:00:00.000Z',
  },

  // ─── Horizon Compact UV Protection Folding Umbrella ──────────
  {
    id: 'rev-horizon-1',
    productId: 'prod-horizon-compact-uv-umbrella',
    customerName: 'Tania I.',
    rating: 5,
    colorwayName: 'Blush Pink',
    comment: 'Finally an umbrella that\'s both practical AND pretty! The blush pink color is so cute. Used it during the monsoon and also as a sun umbrella during scorching afternoons. The UV-blocking black underside really does keep you cooler.',
    status: 'approved',
    createdAt: '2026-07-25T08:30:00.000Z',
  },
  {
    id: 'rev-horizon-2',
    productId: 'prod-horizon-compact-uv-umbrella',
    customerName: 'Zahid K.',
    rating: 4,
    colorwayName: 'Blush Pink',
    comment: 'Bought for my mother who walks to the market daily. She loves the compact fold — fits easily in her handbag. The wrap sleeve keeps it neat. Survived some strong winds in Bogura without flipping inside out, so the windproof frame actually works!',
    status: 'approved',
    createdAt: '2026-08-30T14:00:00.000Z',
  },
  {
    id: 'rev-horizon-3',
    productId: 'prod-horizon-compact-uv-umbrella',
    customerName: 'Shapla B.',
    rating: 3,
    colorwayName: 'Blush Pink',
    comment: 'Nice umbrella overall. The color is lovely and it\'s lightweight. I would have preferred an auto-open mechanism instead of manual, but the quality of the canopy is really good. Good coverage size too — can share with one more person.',
    status: 'approved',
    createdAt: '2026-09-24T11:00:00.000Z',
  },

  // ─── Sapphire Blue Crystal Duo ───────────────────────────────
  {
    id: 'rev-sapphire-1',
    productId: 'prod-sapphire-blue-crystal-duo',
    customerName: 'Afsana R.',
    rating: 5,
    colorwayName: 'Royal Sapphire Blue',
    comment: 'The sapphire blue is GORGEOUS in person — rich, deep, and royal-looking. The crystal marquise leaves on the necklace create such an intricate pattern. Wore it with a navy gown and got endless compliments. This set feels way more expensive than it is.',
    status: 'approved',
    createdAt: '2026-09-20T09:30:00.000Z',
  },
  {
    id: 'rev-sapphire-2',
    productId: 'prod-sapphire-blue-crystal-duo',
    customerName: 'Monir H.',
    rating: 5,
    colorwayName: 'Royal Sapphire Blue',
    comment: 'I wanted a unique color for a gift — not the usual gold or silver everyone has. This sapphire blue set was exactly what I was looking for. My wife said the teardrop earrings are her new favorites. The packaging was very premium too.',
    status: 'approved',
    createdAt: '2026-09-27T14:45:00.000Z',
  },
  {
    id: 'rev-sapphire-3',
    productId: 'prod-sapphire-blue-crystal-duo',
    customerName: 'Jannatul M.',
    rating: 4,
    colorwayName: 'Royal Sapphire Blue',
    comment: 'Beautiful set! The blue hue is vivid and pairs well with both warm and cool toned outfits. The halo around the teardrop pendant adds extra sparkle. A little heavier than my usual jewelry but it\'s worth it for the look.',
    status: 'approved',
    createdAt: '2026-10-01T10:00:00.000Z',
  },

  // ─── Obsidian Black Crystal Duo ─────────────────────────────
  {
    id: 'rev-obsidian-1',
    productId: 'prod-obsidian-black-crystal-duo-1791021666013',
    customerName: 'Mahin A.',
    rating: 5,
    colorwayName: 'Obsidian Black',
    comment: 'Bought this set for my sister\'s university convocation. The jet black crystals against the silver frame have a really dramatic, classy look. She was ecstatic when she opened the keepsake box.',
    status: 'approved',
    createdAt: '2026-09-19T11:00:00.000Z',
  },
  {
    id: 'rev-obsidian-2',
    productId: 'prod-obsidian-black-crystal-duo-1791021666013',
    customerName: 'Shahnaz P.',
    rating: 5,
    colorwayName: 'Obsidian Black',
    comment: 'Such a statement piece! I paired this with an off-white Jamdani saree and the contrast was stunning. The faceted black crystals reflect light without being overly flashy. Super comfortable earrings too.',
    status: 'approved',
    createdAt: '2026-09-26T15:20:00.000Z',
  },
  {
    id: 'rev-obsidian-3',
    productId: 'prod-obsidian-black-crystal-duo-1791021666013',
    customerName: 'Tanvir R.',
    rating: 4,
    colorwayName: 'Obsidian Black',
    comment: 'Very well packaged and arrived in Sylhet within 3 days. The necklace chain is sturdy and the teardrop drop has good weight. Great customer service from the Adorous team.',
    status: 'approved',
    createdAt: '2026-10-02T13:40:00.000Z',
  },

  // ─── Blush Pink Crystal Duo ─────────────────────────────────
  {
    id: 'rev-blush-1',
    productId: 'prod-blush-pink-crystal-duo-1790774613349',
    customerName: 'Nabila T.',
    rating: 5,
    colorwayName: 'Blush Rose Pink',
    comment: 'The blush rose crystals are so gentle and romantic! Not neon or overly bright at all — just a soft, champagne-pink shimmer. Wore it for my Gaye Holud and looked wonderful in photos.',
    status: 'approved',
    createdAt: '2026-09-12T10:15:00.000Z',
  },
  {
    id: 'rev-blush-2',
    productId: 'prod-blush-pink-crystal-duo-1790774613349',
    customerName: 'Arif K.',
    rating: 5,
    colorwayName: 'Blush Rose Pink',
    comment: 'Anniversary gift for my wife who loves pastel jewelry. She said the floral leaf details around the pendant are her favorite part. Premium packaging made gifting effortless.',
    status: 'approved',
    createdAt: '2026-09-21T16:30:00.000Z',
  },
  {
    id: 'rev-blush-3',
    productId: 'prod-blush-pink-crystal-duo-1790774613349',
    customerName: 'Samia H.',
    rating: 4,
    colorwayName: 'Blush Rose Pink',
    comment: 'Really dainty and elegant set. The earrings are so lightweight you barely feel them on. Perfect for day events and semi-formal family gatherings.',
    status: 'approved',
    createdAt: '2026-09-29T12:00:00.000Z',
  },

  // ─── The Croc-Embossed Structured Satchel White Bag ──────────
  {
    id: 'rev-croc-white-1',
    productId: 'prod-the-croc-structured-satchel-white-bag-1791032121828',
    customerName: 'Anika B.',
    rating: 5,
    colorwayName: 'Pristine Ivory',
    comment: 'The ivory croc finish looks like an imported designer handbag! Holds its shape completely when placed down. The gold twist clasp is solid and the top handle feels so comfortable to carry.',
    status: 'approved',
    createdAt: '2026-09-14T09:45:00.000Z',
  },
  {
    id: 'rev-croc-white-2',
    productId: 'prod-the-croc-structured-satchel-white-bag-1791032121828',
    customerName: 'Kamrul H.',
    rating: 5,
    colorwayName: 'Pristine Ivory',
    comment: 'Ordered this for my sister\'s birthday. She wanted a structured white bag for work and dinners. She told me the quality exceeded her expectations and the packaging kept it pristine during delivery to Rajshahi.',
    status: 'approved',
    createdAt: '2026-09-23T14:10:00.000Z',
  },
  {
    id: 'rev-croc-white-3',
    productId: 'prod-the-croc-structured-satchel-white-bag-1791032121828',
    customerName: 'Sadia N.',
    rating: 4,
    colorwayName: 'Pristine Ivory',
    comment: 'Very chic handbag. Fits my phone, cardholder, lipstick, and keys comfortably. You do have to be mindful not to scratch the pristine ivory finish, but it wipes clean easily with a dry cloth.',
    status: 'approved',
    createdAt: '2026-09-30T17:00:00.000Z',
  },

  // ─── The Woven Tweed Structured Satchel White Bag ────────────
  {
    id: 'rev-tweed-white-1',
    productId: 'prod-the-tweed-structured-satchel-white-bag-1791031969660',
    customerName: 'Farhana M.',
    rating: 5,
    colorwayName: 'Ivory & Gold Tweed',
    comment: 'This bag is sheer elegance! The woven ivory bouclé tweed has subtle golden threads that sparkle softly in the sun. Gives such an upscale Parisian aesthetic whether I wear it with a blazer or a linen kurti.',
    status: 'approved',
    createdAt: '2026-09-17T10:00:00.000Z',
  },
  {
    id: 'rev-tweed-white-2',
    productId: 'prod-the-tweed-structured-satchel-white-bag-1791031969660',
    customerName: 'Shahriar I.',
    rating: 5,
    colorwayName: 'Ivory & Gold Tweed',
    comment: 'Surprise gift for my wife on our anniversary. She loves structured bags and this one looked very unique on the website. In person the texture is even more impressive. Delivery to Chattogram was prompt.',
    status: 'approved',
    createdAt: '2026-09-25T13:30:00.000Z',
  },
  {
    id: 'rev-tweed-white-3',
    productId: 'prod-the-tweed-structured-satchel-white-bag-1791031969660',
    customerName: 'Rubina Q.',
    rating: 4,
    colorwayName: 'Ivory & Gold Tweed',
    comment: 'Gorgeous craftsmanship on the tweed fabric. The contrast top handle and metallic clasp feel very sturdy. It has enough space for everyday essentials without looking bulky.',
    status: 'approved',
    createdAt: '2026-10-01T15:15:00.000Z',
  },

  // ─── The Croc-Embossed Structured Satchel Purple Bag ─────────
  {
    id: 'rev-croc-purple-1',
    productId: 'prod-the-croc-structured-satchel-purple-bag-copy-846-1791032311740',
    customerName: 'Mehzabin S.',
    rating: 5,
    colorwayName: 'Lavender Lilac',
    comment: 'I am obsessed with this lilac color! It\'s so rare to find a structured croc bag in such a tasteful pastel purple. I take it to meetings and weekend brunches — get compliments every single time.',
    status: 'approved',
    createdAt: '2026-09-11T09:20:00.000Z',
  },
  {
    id: 'rev-croc-purple-2',
    productId: 'prod-the-croc-structured-satchel-purple-bag-copy-846-1791032311740',
    customerName: 'Tariq L.',
    rating: 5,
    colorwayName: 'Lavender Lilac',
    comment: 'Gifted this to my sister after her graduation. The color is subtle and elegant, not overly bright. She loves using the detachable shoulder strap when traveling around Dhaka.',
    status: 'approved',
    createdAt: '2026-09-18T18:00:00.000Z',
  },
  {
    id: 'rev-croc-purple-3',
    productId: 'prod-the-croc-structured-satchel-purple-bag-copy-846-1791032311740',
    customerName: 'Dilruba K.',
    rating: 4,
    colorwayName: 'Lavender Lilac',
    comment: 'Very stylish and well-constructed bag. The croc pattern is embossed cleanly and the gold hardware adds a luxe touch. Fits everything I need for an evening out.',
    status: 'approved',
    createdAt: '2026-09-28T14:40:00.000Z',
  },

  // ─── The Everyday Casual Commuter White Tote Bag ─────────────
  {
    id: 'rev-everyday-white-1',
    productId: 'prod-the-everyday-casual-commuter-white-tote-bag-1791032882543',
    customerName: 'Nusrat W.',
    rating: 5,
    colorwayName: 'Ivory Cream',
    comment: 'The ultimate work tote! It comfortably fits my 13-inch MacBook, charger, notebook, and a small water bottle. The ivory cream shade looks so clean and professional.',
    status: 'approved',
    createdAt: '2026-09-15T08:50:00.000Z',
  },
  {
    id: 'rev-everyday-white-2',
    productId: 'prod-the-everyday-casual-commuter-white-tote-bag-1791032882543',
    customerName: 'Sazzad H.',
    rating: 5,
    colorwayName: 'Ivory Cream',
    comment: 'Bought this for my mother. She needed a lightweight, spacious bag for everyday errands and visiting relatives. She specifically praised how comfortable the shoulder straps are even when packed.',
    status: 'approved',
    createdAt: '2026-09-22T16:15:00.000Z',
  },
  {
    id: 'rev-everyday-white-3',
    productId: 'prod-the-everyday-casual-commuter-white-tote-bag-1791032882543',
    customerName: 'Ishrat J.',
    rating: 4,
    colorwayName: 'Ivory Cream',
    comment: 'Spacious, lightweight, and very practical. The interior divider makes organizing makeup and tech cords really easy. Love the minimalist aesthetic.',
    status: 'approved',
    createdAt: '2026-09-29T11:30:00.000Z',
  },

  // ─── Luxe Crystal Gemstone Suite (2-Piece Set — Silver) ──────
  {
    id: 'rev-gem2pc-silver-1',
    productId: 'prod-luxe-crystal-gemstone-suite-2-piece-set-1790773089848',
    customerName: 'Tahmina E.',
    rating: 5,
    colorwayName: 'Silver White',
    comment: 'The clarity of the crystals in the silver setting is remarkable. Wore this necklace and earring duo to a family wedding and it looked so radiant under chandelier lighting.',
    status: 'approved',
    createdAt: '2026-09-16T12:00:00.000Z',
  },
  {
    id: 'rev-gem2pc-silver-2',
    productId: 'prod-luxe-crystal-gemstone-suite-2-piece-set-1790773089848',
    customerName: 'Hasan M.',
    rating: 5,
    colorwayName: 'Silver White',
    comment: 'Ordered as a gift for my wife. The silver finish is crisp and clean, and the presentation case made a great impression. She was genuinely happy with it.',
    status: 'approved',
    createdAt: '2026-09-27T10:45:00.000Z',
  },
];

/**
 * Universal matcher that checks whether a review belongs to a given product.
 * Supports exact id, slug, prod- prefix, stripped timestamp/copy suffixes, and known aliases.
 */
export function isReviewForProduct(
  review: { productId: string },
  product: { id: string; slug?: string }
): boolean {
  if (!product || !review) return false;
  const revPid = review.productId;
  if (!revPid) return false;

  // 1. Direct equality with id or slug
  if (revPid === product.id) return true;
  if (product.slug && revPid === product.slug) return true;

  // 2. prod- prefix variations
  if (product.slug && (revPid === `prod-${product.slug}` || revPid.replace(/^prod-/, '') === product.slug)) return true;
  if (product.id && revPid.replace(/^prod-/, '') === product.id.replace(/^prod-/, '')) return true;

  // 3. Clean timestamp and copy suffixes (e.g. -1791023039901, -copy-846)
  const stripSuffixes = (str: string) => str.replace(/-copy(-\d+)?/g, '').replace(/-\d{10,}$/, '');
  const cleanProductId = stripSuffixes(product.id);
  const cleanRevPid = stripSuffixes(revPid);

  if (cleanProductId === cleanRevPid) return true;
  if (cleanRevPid.replace(/^prod-/, '') === cleanProductId.replace(/^prod-/, '')) return true;

  if (product.slug) {
    const cleanSlug = stripSuffixes(product.slug);
    if (cleanRevPid === cleanSlug || cleanRevPid === `prod-${cleanSlug}` || cleanRevPid.replace(/^prod-/, '') === cleanSlug) return true;
  }

  // 4. Special canonical slug aliases for known legacy/renamed items
  const aliases: Record<string, string[]> = {
    'moonlit-pearl-suite-2-piece-set': ['moonlit-pearl-set', 'prod-moonlit-pearl-set'],
    'imperial-purple-crystal-duo': ['luxe-floral-crystal-duo-2-piece-set', 'prod-luxe-floral-crystal-duo-2-piece-set'],
    'luxe-golden-crystal-gemstone-suite-2-piece-set': ['luxe-crystal-gemstone-suite-2-piece-set', 'prod-luxe-crystal-gemstone-suite-2-piece-set'],
    'the-everyday-casual-commuter-black-tote-bag': ['the-everyday-casual-commuter-tote', 'prod-the-everyday-casual-commuter-tote'],
    'the-croc-embossed-structured-satchel-black-bag': ['the-croc-structured-satchel', 'prod-the-croc-structured-satchel'],
  };

  if (product.slug && aliases[product.slug]) {
    if (aliases[product.slug].includes(revPid) || aliases[product.slug].includes(cleanRevPid)) return true;
  }
  if (product.id && aliases[product.id]) {
    if (aliases[product.id].includes(revPid) || aliases[product.id].includes(cleanRevPid)) return true;
  }

  return false;
}

const SEED_VERSION = 'v4_20261003_all_products';

export const ReviewsProvider = ({ children }: { children: ReactNode }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedVersion = typeof window !== 'undefined' ? localStorage.getItem('adorous_reviews_version') : null;
      const stored = typeof window !== 'undefined' ? localStorage.getItem('adorous_reviews') : null;

      if (stored && storedVersion === SEED_VERSION) {
        const parsed: Review[] = JSON.parse(stored);
        setReviews(parsed);
      } else {
        // Upgrade / fresh seed migration:
        // Always load full SEED_REVIEWS, plus any genuine user-submitted reviews (not old seeds, and not Manik fallback)
        let userReviews: Review[] = [];
        if (stored) {
          try {
            const parsed: Review[] = JSON.parse(stored);
            const seedIds = new Set(SEED_REVIEWS.map((r) => r.id));
            userReviews = parsed.filter(
              (r) =>
                !seedIds.has(r.id) &&
                !r.id.startsWith('seed-rev-') &&
                r.customerName !== 'Manik'
            );
          } catch (err) {
            console.warn('Failed parsing previous reviews, resetting to fresh seeds', err);
          }
        }

        const merged = [...SEED_REVIEWS, ...userReviews];
        setReviews(merged);
        if (typeof window !== 'undefined') {
          localStorage.setItem('adorous_reviews', JSON.stringify(merged));
          localStorage.setItem('adorous_reviews_version', SEED_VERSION);
        }
      }
    } catch (e) {
      console.error('Error loading reviews from localStorage:', e);
      setReviews(SEED_REVIEWS);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
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

  const getReviewsForProduct = useCallback(
    (productIdOrSlug: string, slug?: string) => {
      return reviews.filter((r) =>
        isReviewForProduct(r, { id: productIdOrSlug, slug })
      );
    },
    [reviews]
  );

  const getProductRating = useCallback(
    (product: { id: string; slug?: string }) => {
      const matching = reviews.filter(
        (r) => r.status === 'approved' && isReviewForProduct(r, product)
      );
      if (matching.length === 0) return { avg: 0, count: 0 };
      const sum = matching.reduce((acc, r) => acc + r.rating, 0);
      return { avg: sum / matching.length, count: matching.length };
    },
    [reviews]
  );

  return (
    <ReviewsContext.Provider
      value={{
        reviews,
        addReview,
        updateReviewStatus,
        getReviewsForProduct,
        getProductRating,
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
