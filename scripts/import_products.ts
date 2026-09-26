import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export interface FullProductDefinition {
  id: string;
  slug: string;
  name: string;
  category: 'jewelry' | 'bags' | 'earrings' | 'churi' | 'more' | 'umbrellas';
  categoryLabel: string;
  tagline: string;
  price: number;
  originalPrice: number | null;
  description: string;
  featuredImage: string;
  badge?: string | null;
  inStock: boolean;
  stockQty: number | null;
  isNewDrop?: boolean;
  isGiftPick?: boolean;
  isBestseller?: boolean;
  featuredRank: number;
  seoKeywords: string[];
  metaDescription: string;
  details: string[];
  piecesIncluded: string[];
  colorways: {
    id: string;
    name: string;
    hex: string;
    inStock: boolean;
    image?: string | null;
  }[];
  galleryImages: {
    url: string;
    altText: string;
  }[];
}

export const PRODUCTS_TO_IMPORT: FullProductDefinition[] = [
  // 1. Kashmiri Noor-e-Sitara
  {
    id: 'prod-kashmiri-noor-e-sitara',
    slug: 'kashmiri-noor-e-sitara',
    name: 'Kashmiri Noor-e-Sitara Tiered Lotus Jhumka Earrings',
    category: 'earrings',
    categoryLabel: 'Earrings & Jhumkas',
    tagline: 'Starlight Woven in Antique Silver-Tone Filigree',
    price: 482.0,
    originalPrice: 525.0,
    description:
      'Inspired by the ornate silverwork of Kashmiri artistry, Noor-e-Sitara is a statement jhumka built in graceful, layered tiers. Delicate lotus-medallion engravings cradle teardrop teal stones at each level, crowned by a filigree teardrop stud at the top. The crescent base is finished with a cluster of faceted silver-tone beads and cascading ghungroo bells that sway with every movement.\n\nRich in detail and heritage craftsmanship, this piece brings a regal, star-lit elegance to festive celebrations and bridal occasions alike.',
    featuredImage: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/Kashmiri-B.png?v=1787068177',
    badge: 'Heritage',
    inStock: false,
    stockQty: 0,
    isNewDrop: true,
    isGiftPick: true,
    isBestseller: false,
    featuredRank: 1,
    seoKeywords: [
      'kashmiri noor e sitara',
      'kashmiri jhumka dhaka',
      'teal stone earrings',
      'oxidized silver jhumka bd',
      'chandbali earrings bangladesh',
    ],
    metaDescription:
      'Shop Kashmiri Noor-e-Sitara jhumka earrings featuring tiered lotus medallions, teal stones, and ghungroo bells in antique oxidized silver. Cash on delivery.',
    details: [
      'Stone: Teal teardrop stones set in tiered medallions',
      'Motif: Layered lotus-medallion design with filigree detailing',
      'Finish: Oxidized antique silver-tone metal',
      'Closure: Push-back stud',
      'Style: Statement chandbali-style jhumka with faceted bead and ghungroo bell drops',
      'Pairs well with: Sarees, anarkalis, and festive or bridal ethnic wear',
      'Care: Keep away from water, perfume, and sweat to preserve the antique finish',
      'Storage: Store in a dry pouch/box when not in use and wipe gently with a soft dry cloth',
    ],
    piecesIncluded: ['1x Pair Kashmiri Noor-e-Sitara Tiered Jhumkas'],
    colorways: [
      {
        id: 'teal-antique-silver',
        name: 'Teal & Antique Silver',
        hex: '#008080',
        inStock: false,
        image: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/Kashmiri-B.png?v=1787068177',
      },
    ],
    galleryImages: [
      {
        url: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/Kashmiri-B.png?v=1787068177',
        altText: 'Kashmiri Noor-e-Sitara tiered lotus jhumka earrings with teal teardrop stones and oxidized silver finish',
      },
    ],
  },

  // 2. Kashmiri Noor-e-Firuzah
  {
    id: 'prod-kashmiri-noor-e-firuzah',
    slug: 'kashmiri-noor-e-firuzah',
    name: 'Kashmiri Noor-e-Firuzah Peacock Crescent Jhumka Earrings',
    category: 'earrings',
    categoryLabel: 'Earrings & Jhumkas',
    tagline: 'Royal Peacock Motif with Vivid Turquoise Centerpiece',
    price: 482.0,
    originalPrice: 525.0,
    description:
      'Inspired by the ornate silverwork of Kashmiri artistry, Noor-e-Firuzah captures timeless royal elegance. A carved silver-tone peacock motif crowns each earring, giving way to an intricately detailed floral crescent studded with vivid turquoise stones. A radiant turquoise centerpiece sits at the heart of the design, while cascading silver ghungroo bells bring gentle movement and a soft chime with every step.\n\nBold, regal, and steeped in heritage craftsmanship — this piece is made for those who want their jewelry to make an unforgettable entrance.',
    featuredImage: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/Kashmiri-A.png?v=1787068080',
    badge: 'Popular',
    inStock: true,
    stockQty: 3,
    isNewDrop: true,
    isGiftPick: true,
    isBestseller: true,
    featuredRank: 2,
    seoKeywords: [
      'kashmiri noor e firuzah',
      'peacock jhumka earrings',
      'turquoise jhumka bd',
      'antique silver chandbali dhaka',
      'kashmiri bridal earrings',
    ],
    metaDescription:
      'Adorn Kashmiri Noor-e-Firuzah peacock jhumka earrings featuring turquoise gemstones and cascading ghungroo bells in antique oxidized silver. Fast BD delivery.',
    details: [
      'Stone: Turquoise centerpiece with turquoise bead trim',
      'Motif: Hand-detailed peacock and floral crescent design',
      'Finish: Oxidized antique silver-tone metal',
      'Closure: Push-back stud',
      'Style: Statement chandbali-style jhumka with dangling ghungroo bells',
      'Pairs well with: Sarees, anarkalis, and festive or bridal ethnic wear',
      'Care: Keep away from water, perfume, and sweat to preserve the finish',
      'Storage: Store in a dry pouch/box when not in use',
    ],
    piecesIncluded: ['1x Pair Kashmiri Noor-e-Firuzah Peacock Crescent Jhumkas'],
    colorways: [
      {
        id: 'turquoise-antique-silver',
        name: 'Turquoise & Antique Silver',
        hex: '#40E0D0',
        inStock: true,
        image: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/Kashmiri-A.png?v=1787068080',
      },
    ],
    galleryImages: [
      {
        url: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/Kashmiri-A.png?v=1787068080',
        altText: 'Kashmiri Noor-e-Firuzah peacock crescent jhumka earrings with turquoise stones and cascading ghungroo bells',
      },
    ],
  },

  // 3. Traditional Filigree Floral Bell Jhumka (Merged 5 Colors)
  {
    id: 'prod-traditional-filigree-bell-jhumka',
    slug: 'traditional-filigree-bell-jhumka',
    name: 'Traditional Filigree Floral Bell Jhumka Earrings',
    category: 'earrings',
    categoryLabel: 'Earrings & Jhumkas',
    tagline: 'Handcrafted Floral Filigree with Cascading Ghungroo Chimes',
    price: 467.0,
    originalPrice: 510.0,
    description:
      'Handcrafted with intricate filigree work and finished in a rich oxidized silver tone, the Bell Jhumka brings timeless ethnic elegance to modern styling. A striking centerpiece stone sits at the center, framed by delicate floral detailing, while cascading ghungroo bells add graceful movement and a soft jingle with every step — a signature touch of traditional jhumka charm.\n\nWhether for a festive occasion, a wedding reception, or to elevate your everyday ethnic look, this piece adds a regal statement to any outfit.',
    featuredImage: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/stone-white.png?v=1787067740',
    badge: '5 Colors',
    inStock: true,
    stockQty: 5,
    isNewDrop: false,
    isGiftPick: true,
    isBestseller: true,
    featuredRank: 3,
    seoKeywords: [
      'traditional bell jhumka',
      'filigree bell jhumka bd',
      'oxidized silver earrings dhaka',
      'ruby bell jhumka',
      'moonstone earrings',
      'jade green jhumka',
    ],
    metaDescription:
      'Handcrafted filigree bell jhumka earrings with radiant floral centerpiece stones and jingling ghungroo bells in antique silver. Available in 5 vivid colors.',
    details: [
      'Stone Options: Milky Moonstone-White, Vivid Ruby-Red, Soft Jade-Green, Rich Violet, Deep Royal Blue',
      'Motif: Intricate filigree flower medallion with tiered bell canopy',
      'Finish: Oxidized antique silver-tone metal',
      'Closure: Push-back stud',
      'Style: Traditional bell jhumka with dangling musical ghungroo bells',
      'Pairs well with: Sarees, kurtas, lehengas, and festive ethnic wear',
      'Care: Keep away from water, perfume, and sweat to preserve the antique finish',
      'Storage: Store in a dry pouch/box when not in use',
    ],
    piecesIncluded: ['1x Pair Traditional Filigree Floral Bell Jhumkas'],
    colorways: [
      {
        id: 'moonstone-white',
        name: 'Moonstone White',
        hex: '#F5F5F0',
        inStock: true,
        image: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/stone-white.png?v=1787067740',
      },
      {
        id: 'ruby-red',
        name: 'Ruby Red',
        hex: '#9B111E',
        inStock: true,
        image: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/stone-red.png?v=1787067510',
      },
      {
        id: 'jade-green',
        name: 'Jade Green',
        hex: '#5B8A72',
        inStock: true,
        image: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/stone-paste.png?v=1787067407',
      },
      {
        id: 'rich-violet',
        name: 'Rich Violet',
        hex: '#6A0DAD',
        inStock: true,
        image: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/stone-purple.png?v=1787067166',
      },
      {
        id: 'royal-blue',
        name: 'Royal Blue',
        hex: '#002366',
        inStock: true,
        image: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/stone-blue_aeeec5c6-3bba-4623-adfd-30d6a6316f09.png?v=1787066804',
      },
    ],
    galleryImages: [
      {
        url: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/stone-white.png?v=1787067740',
        altText: 'Traditional filigree bell jhumka earrings with milky moonstone white centerpiece stone',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/stone-red.png?v=1787067510',
        altText: 'Traditional filigree bell jhumka earrings with vivid ruby red centerpiece stone',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/stone-paste.png?v=1787067407',
        altText: 'Traditional filigree bell jhumka earrings with soft jade green centerpiece stone',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/stone-purple.png?v=1787067166',
        altText: 'Traditional filigree bell jhumka earrings with rich violet centerpiece stone',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/stone-blue_aeeec5c6-3bba-4623-adfd-30d6a6316f09.png?v=1787066804',
        altText: 'Traditional filigree bell jhumka earrings with deep royal blue centerpiece stone',
      },
    ],
  },

  // 4. Festive Heritage Silk Thread Bangle Collection (4-Pair Set)
  {
    id: 'prod-festive-heritage-silk-thread-bangles',
    slug: 'festive-heritage-silk-thread-bangles',
    name: 'Festive Heritage Silk Thread Bangle Collection (4-Pair Set)',
    category: 'churi',
    categoryLabel: 'Churi (Bangles)',
    tagline: '4-Pair Handcrafted Silk Thread Set in Classic Festive Hues',
    price: 890.0,
    originalPrice: 1020.0,
    description:
      'Celebrate vibrant color and royal heritage with this handcrafted Silk Thread Bangle Collection. Meticulously hand-wrapped in premium silk thread, this collection features four timeless shades: emerald green, ruby red, classic gold, and midnight black.\n\nEach bangle is adorned with gold-tone floral appliques, delicately studded with Kundan-style stones, and finished with clusters of elegant faux pearls. Designed as four distinct pairs, wear a single matching pair for everyday subtlety or stack all four pairs together for a regal festive statement.',
    featuredImage: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/Combo-3.png?v=1782974184',
    badge: '4-Pair Set',
    inStock: true,
    stockQty: 10,
    isNewDrop: true,
    isGiftPick: true,
    isBestseller: true,
    featuredRank: 4,
    seoKeywords: [
      'silk thread bangles bd',
      'festive churi set dhaka',
      'kundan silk bangles',
      'handmade bangles bangladesh',
      'bridal churi collection',
    ],
    metaDescription:
      'Handcrafted 4-pair festive silk thread bangle collection in emerald green, ruby red, gold, and black with Kundan stones and faux pearls. Order online in BD.',
    details: [
      '100% Handmade Craftsmanship: Each bangle is beautifully wrapped and embellished by hand',
      'Ultimate Versatility: Includes 4 distinct pairs (8 bangles total) in Green, Red, Gold, and Black',
      'Elegant Detailing: Floral metallic accents, Kundan-style stones, and faux pearl clusters',
      'Material: Premium silk thread, faux pearls, Kundan stones, gold-tone metallic floral appliques',
      'Mix & Match Freedom: Wear as individual pairs or stack together for a heavy bridal aesthetic',
      'Care: Keep away from moisture, perfumes, and harsh chemicals; store in a dry enclosed bangle box',
    ],
    piecesIncluded: [
      '1x Pair Emerald Green Kundan Silk Bangles',
      '1x Pair Ruby Red Kundan Silk Bangles',
      '1x Pair Classic Gold Kundan Silk Bangles',
      '1x Pair Midnight Black Kundan Silk Bangles',
    ],
    colorways: [
      {
        id: 'festive-quad-combo',
        name: 'Festive Multi-Color Quad (Green, Red, Gold, Black)',
        hex: '#C6A96E',
        inStock: true,
        image: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/Combo-3.png?v=1782974184',
      },
    ],
    galleryImages: [
      {
        url: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/Combo-3.png?v=1782974184',
        altText: 'Festive heritage silk thread bangle collection featuring 4 pairs in green, red, gold, and black with Kundan stones',
      },
    ],
  },

  // 5. The Magenta Majesty Silk Thread Churi Set
  {
    id: 'prod-the-magenta-majesty-silk-thread-churi-set',
    slug: 'the-magenta-majesty-silk-thread-churi-set',
    name: 'The Magenta Majesty Silk Thread Churi Set',
    category: 'churi',
    categoryLabel: 'Churi (Bangles)',
    tagline: 'Deep Magenta Stack with Geometric Kundan & Wire Detailing',
    price: 890.0,
    originalPrice: 1020.0,
    description:
      'Make a bold and unforgettable statement with this vibrant Silk Thread Churi set. Expertly wrapped in lustrous, deep magenta silk thread, this bangle stack is a masterpiece of traditional craftsmanship mixed with contemporary design.\n\nThe set features a stunning variety of embellishments, including striking geometric Kundan stones (featuring triangle and diamond shapes), intricate gold-tone floral and swirl motifs, and elegant metallic wire detailing. Bordered by delicate faux pearl accents, this stack offers a rich, textured, and luxurious appearance while remaining lightweight on the wrist.',
    featuredImage: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/Combo-2.png?v=1782974064',
    badge: 'Artisan Stack',
    inStock: true,
    stockQty: 10,
    isNewDrop: true,
    isGiftPick: false,
    isBestseller: true,
    featuredRank: 5,
    seoKeywords: [
      'magenta churi set',
      'silk thread bangles dhaka',
      'geometric kundan bangles',
      'bridal churi bd',
      'ethnic bangles for women',
    ],
    metaDescription:
      'Shop the Magenta Majesty silk thread churi set handcrafted with geometric Kundan stones, gold wire work, and pearl trim. Perfect for weddings & Eid in BD.',
    details: [
      '100% Handmade Craftsmanship: Delicately wrapped and embellished by hand',
      'Vibrant Statement Color: Rich magenta shade that pairs beautifully with traditional sarees and lehengas',
      'Intricate Embellishments: Geometric triangle and diamond Kundan stones, gold swirl motifs, metallic wire wrapping',
      'Faux Pearl Accents: Finished with fine pearl border trim for added texture and luxury',
      'Material: Premium silk thread, faux pearls, Kundan stones, gold-tone metallic wire',
      'Comfortable & Lightweight: Heavy, regal aesthetic without excessive weight',
      'Care: Avoid moisture and perfumes; store safely in a closed bangle box',
    ],
    piecesIncluded: [
      '2x Broad Magenta Kundan Statement Bangles',
      '4x Gold Wire-Wrapped Accent Bangles',
      '2x Geometric Stone Trim Bangles',
      '4x Faux Pearl Border Bangles',
    ],
    colorways: [
      {
        id: 'royal-deep-magenta',
        name: 'Royal Deep Magenta',
        hex: '#CA1F7B',
        inStock: true,
        image: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/Combo-2.png?v=1782974064',
      },
    ],
    galleryImages: [
      {
        url: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/Combo-2.png?v=1782974064',
        altText: 'The Magenta Majesty silk thread churi set with geometric Kundan stones, gold wire work, and pearl borders',
      },
    ],
  },

  // 6. The Royal Floral Silk Thread Churi Set - Maroon & Teal
  {
    id: 'prod-the-royal-floral-silk-thread-churi-set-maroon-teal',
    slug: 'the-royal-floral-silk-thread-churi-set-maroon-teal',
    name: 'The Royal Floral Silk Thread Churi Set - Maroon & Teal',
    category: 'churi',
    categoryLabel: 'Churi (Bangles)',
    tagline: 'Contrasting Maroon & Teal Stack with Mirror-Work Borders',
    price: 890.0,
    originalPrice: 1020.0,
    description:
      'Elevate your ethnic wardrobe with this stunning, exquisitely handcrafted Silk Thread Churi set. Wrapped in rich, contrasting shades of deep maroon and vibrant teal, the centerpiece bangles are embellished with golden floral motifs, delicate faux pearls, and sparkling stones that catch the light from every angle.\n\nThe set is framed by statement border bangles featuring classic square Kundan-style mirror work and pearl drops, creating a perfectly balanced and luxurious stack.',
    featuredImage: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/Combo-1.png?v=1782973868',
    badge: 'Royal Combo',
    inStock: true,
    stockQty: 10,
    isNewDrop: false,
    isGiftPick: true,
    isBestseller: true,
    featuredRank: 6,
    seoKeywords: [
      'maroon and teal bangles',
      'silk thread churi bd',
      'kundan mirror bangles',
      'wedding churi stack dhaka',
      'traditional bangles online',
    ],
    metaDescription:
      'Handcrafted royal floral silk thread churi set in deep maroon and teal with Kundan mirror borders and pearl drops. Elegant bridal and festive bangle stack.',
    details: [
      '100% Handmade Craftsmanship: Meticulously wrapped and decorated by hand',
      'Contrasting Color Palette: Rich deep maroon and vibrant peacock teal thread base',
      'Statement Borders: Gold-tone square Kundan mirror work with dangling faux pearl drops',
      'Floral Embellishments: Intricate brass-tone floral appliques and crystal stone centers',
      'Material: High-luster silk thread, faux pearls, Kundan stones, metallic floral motifs',
      'Care: Keep away from moisture, perfumes, and harsh chemicals; store in a dry bangle box',
    ],
    piecesIncluded: [
      '4x Deep Maroon Silk Floral Bangles',
      '4x Vibrant Teal Silk Floral Bangles',
      '2x Gold-Tone Kundan Mirror Border Bangles with Pearl Drops',
    ],
    colorways: [
      {
        id: 'maroon-teal-combo',
        name: 'Maroon & Teal Royal Combo',
        hex: '#631A24',
        inStock: true,
        image: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/Combo-1.png?v=1782973868',
      },
    ],
    galleryImages: [
      {
        url: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/Combo-1.png?v=1782973868',
        altText: 'Royal floral silk thread churi set in deep maroon and teal with Kundan mirror borders and dangling pearls',
      },
    ],
  },

  // 7. Luxe Floral Crystal Necklace & Earring Duo (2-Piece Set) (Merged 2 Colors)
  {
    id: 'prod-luxe-floral-crystal-duo-2-piece-set',
    slug: 'luxe-floral-crystal-duo-2-piece-set',
    name: 'Luxe Floral Crystal Necklace & Earring Duo (2-Piece Set)',
    category: 'jewelry',
    categoryLabel: 'Fine Jewelry Sets',
    tagline: '2-Piece Crystal Cluster Necklace & Matching Teardrop Earrings',
    price: 995.0,
    originalPrice: 1039.0,
    description:
      'Discover captivating beauty with the Luxe Floral Crystal Duo. This magnificent 2-piece suite features an intricate floral-inspired cluster design of rich crystal leaves and round buds, culminating in a grand teardrop centerpiece with a full clear crystal halo.\n\nAccompanied by a pair of perfectly matched teardrop drop earrings that frame the face with delicate radiance, this set is the perfect statement centerpiece for formal galas, weddings, and memorable evenings.',
    featuredImage: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/purple-web.png?v=1784465252',
    badge: '2-Piece Set',
    inStock: true,
    stockQty: 18,
    isNewDrop: true,
    isGiftPick: true,
    isBestseller: true,
    featuredRank: 7,
    seoKeywords: [
      'floral crystal jewelry set',
      '2 piece necklace and earring duo',
      'amethyst crystal set bd',
      'blush pink crystal jewelry dhaka',
      'bridal crystal necklace',
    ],
    metaDescription:
      'Shop the Luxe Floral Crystal 2-piece necklace and earring set featuring brilliant crystals in amethyst purple or blush pink. Ideal for festive galas in BD.',
    details: [
      'Set Inclusions: 1x Floral Crystal Cluster Necklace, 1x Pair of Matching Teardrop Earrings',
      'Stone Colors: Rich Amethyst Purple or Soft Blush Pink, offset by clear round pavé crystals',
      'Finish: Brilliant silver-tone metal',
      'Necklace Design: Marquise-cut crystal leaves with grand teardrop pendant and clear crystal halo',
      'Earring Design: Matching floral cluster studs leading to brilliant teardrop drops',
      'Style: Imperial Floral / Classic Statement',
      'Perfect For: Galas, formal dinners, weddings, bridal wear, and magnificent gifting',
    ],
    piecesIncluded: [
      '1x Floral Crystal Cluster Necklace with Teardrop Halo Pendant',
      '1x Pair Matching Crystal Teardrop Drop Earrings',
    ],
    colorways: [
      {
        id: 'imperial-amethyst',
        name: 'Imperial Amethyst Purple',
        hex: '#582F72',
        inStock: true,
        image: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/purple-web.png?v=1784465252',
      },
      {
        id: 'blush-rose-pink',
        name: 'Blush Rose Pink',
        hex: '#E4A4B4',
        inStock: true,
        image: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/pink-web.png?v=1784464637',
      },
    ],
    galleryImages: [
      {
        url: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/purple-web.png?v=1784465252',
        altText: 'Luxe floral crystal necklace and teardrop earring 2-piece duo in imperial amethyst purple and silver',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/pink-web.png?v=1784464637',
        altText: 'Luxe floral crystal necklace and teardrop earring 2-piece duo in blush rose pink and silver',
      },
    ],
  },

  // 8. Luxe Crystal Gemstone Suite (2-Piece Set) (Merged Gold & Silver)
  {
    id: 'prod-luxe-crystal-gemstone-suite-2-piece-set',
    slug: 'luxe-crystal-gemstone-suite-2-piece-set',
    name: 'Luxe Crystal Gemstone Suite (2-Piece Set)',
    category: 'jewelry',
    categoryLabel: 'Fine Jewelry Sets',
    tagline: 'Diamond-White Crystal Drop Necklace & Matching Earrings',
    price: 990.0,
    originalPrice: 1050.0,
    description:
      'Experience the perfect balance of luxury and brilliance with the Luxe Crystal Gemstone 2-Piece Suite. Featuring sparkling diamond-white crystals set in your choice of radiant gold-tone or brilliant silver-tone metal, this coordinated duo brings unmatched elegance to any celebration.\n\nArrives beautifully presented in a premium box, making it an uncompromised luxury gift for weddings, parties, or everyday refinement.',
    featuredImage: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/golden-2pis.png?v=1783359325',
    badge: '2-Piece Set',
    inStock: true,
    stockQty: 25,
    isNewDrop: false,
    isGiftPick: true,
    isBestseller: true,
    featuredRank: 8,
    seoKeywords: [
      '2 piece crystal jewelry set',
      'gold crystal pendant earrings',
      'silver crystal necklace set bd',
      'minimalist bridal jewelry',
      'boxed jewelry set dhaka',
    ],
    metaDescription:
      'Discover the Luxe Crystal Gemstone 2-piece suite featuring a white crystal drop necklace and earrings in gold or silver finish. Boxed for gifting across BD.',
    details: [
      'Pieces Included: 1x Adjustable Crystal Drop Necklace, 1x Pair of Matching Earrings, 1x Premium Box',
      'Stones: Diamond-white / clear faceted crystals',
      'Finishes: Radiant Gold-Tone or Brilliant Silver-Tone',
      'Style: European & American Classic',
      'Necklace: Adjustable length chain with brilliant crystal drop pendant',
      'Earrings: Lightweight and designed for comfortable all-day wear',
      'Perfect For: Weddings, festive occasions, formal events, and premium gifting',
    ],
    piecesIncluded: [
      '1x Adjustable Crystal Drop Necklace',
      '1x Pair Matching Crystal Earrings',
      '1x Premium Presentation Box',
    ],
    colorways: [
      {
        id: 'radiant-gold',
        name: 'Radiant Gold',
        hex: '#D4AF37',
        inStock: true,
        image: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/golden-2pis.png?v=1783359325',
      },
      {
        id: 'brilliant-silver',
        name: 'Brilliant Silver',
        hex: '#E0E0E0',
        inStock: true,
        image: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/Gorgeous-2pis.png?v=1783348441',
      },
    ],
    galleryImages: [
      {
        url: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/golden-2pis.png?v=1783359325',
        altText: 'Luxe golden crystal gemstone 2-piece jewelry suite with necklace and earrings in radiant gold finish',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/Gorgeous-2pis.png?v=1783348441',
        altText: 'Luxe crystal gemstone 2-piece jewelry suite with necklace and earrings in brilliant silver finish',
      },
    ],
  },

  // 9. Luxe Golden Crystal Gemstone Suite (5-Piece Box Set)
  {
    id: 'prod-luxe-golden-crystal-gemstone-suite-5-piece-box-set',
    slug: 'luxe-golden-crystal-gemstone-suite-5-piece-box-set',
    name: 'Luxe Golden Crystal Gemstone Suite (5-Piece Box Set)',
    category: 'jewelry',
    categoryLabel: 'Fine Jewelry Sets',
    tagline: 'Complete 5-Piece Gold-Tone Collection in Premium PU Leather Case',
    price: 1520.0,
    originalPrice: 1620.0,
    description:
      'Experience the timeless beauty of gold paired with striking brilliance. The Luxe Golden Crystal Gemstone Suite offers a complete 5-piece collection featuring a luxurious gold-tone finish beautifully contrasted by sparkling, diamond-white crystals.\n\nWhether you are elevating your evening wear or searching for a memorable gift, this set arrives perfectly presented in a premium PU leather box, delivering an uncompromised luxury experience.',
    featuredImage: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/goldenjewellery_1.png?v=1782823176',
    badge: 'Luxury 5-Piece',
    inStock: true,
    stockQty: 4,
    isNewDrop: false,
    isGiftPick: true,
    isBestseller: true,
    featuredRank: 9,
    seoKeywords: [
      '5 piece jewelry box set bd',
      'golden crystal necklace set',
      'complete bridal jewelry set dhaka',
      'luxury gift box jewelry',
      'crystal bracelet ring necklace',
    ],
    metaDescription:
      'Luxe golden crystal gemstone 5-piece box set includes necklace, earrings, bracelet, ring, and premium leather case in radiant gold finish. Shop online in BD.',
    details: [
      'Pieces Included: 1x Golden Adjustable Crystal Necklace, 1x Pair of Matching Earrings, 1x Golden Adjustable Bracelet, 1x Adjustable Ring, 1x Premium PU Leather Box',
      'Finish: Radiant Gold-Tone metal',
      'Stone Color: Diamond-White / Clear Crystal',
      'Style: European & American Classic',
      'Necklace: Adjustable length with faceted crystal drop pendant',
      'Bracelet: Delicate gold-tone chain with crystal accents',
      'Ring: Comfort-fit adjustable matching band',
      'Perfect For: Weddings, festive occasions, formal receptions, or premium gifting',
    ],
    piecesIncluded: [
      '1x Golden Adjustable Crystal Necklace',
      '1x Pair Matching Golden Crystal Earrings',
      '1x Golden Adjustable Crystal Bracelet',
      '1x Adjustable Crystal Ring',
      '1x Premium PU Leather Display Box',
    ],
    colorways: [
      {
        id: 'radiant-gold-white-crystal',
        name: 'Radiant Gold & White Crystal',
        hex: '#D4AF37',
        inStock: true,
        image: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/goldenjewellery_1.png?v=1782823176',
      },
    ],
    galleryImages: [
      {
        url: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/goldenjewellery_1.png?v=1782823176',
        altText: 'Luxe golden crystal gemstone 5-piece box set with necklace, earrings, bracelet, and ring in gold display box',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/golden.png?v=1782823271',
        altText: 'Luxe golden crystal gemstone suite pieces displayed inside luxury PU leather presentation box',
      },
    ],
  },

  // 10. Luxe Crystal Gemstone Suite (5-Piece Box Set)
  {
    id: 'prod-luxe-crystal-gemstone-suite-5-piece-box-set-1790364680551',
    slug: 'luxe-crystal-gemstone-suite-5-piece-box-set',
    name: 'Luxe Crystal Gemstone Suite (5-Piece Box Set)',
    category: 'jewelry',
    categoryLabel: 'Fine Jewelry Sets',
    tagline: 'Complete 5-Piece Silver-Tone Ensemble in Premium Presentation Box',
    price: 1490.0,
    originalPrice: 1590.0,
    description:
      'Discover the perfect balance of luxury and value with the Luxe Crystal Gemstone Suite. Designed to add a touch of glamour to any outfit, this complete 5-piece collection features brilliant, diamond-white crystals that catch the light beautifully from every angle.\n\nWhether you are treating yourself or searching for the perfect gift, this set comes fully prepared in a stunning presentation box, offering an unmatched premium experience.',
    featuredImage: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/IMG_5822.heic?v=1782451897',
    badge: 'Bestseller',
    inStock: true,
    stockQty: 9,
    isNewDrop: false,
    isGiftPick: true,
    isBestseller: true,
    featuredRank: 10,
    seoKeywords: [
      'silver crystal jewelry set bd',
      '5 piece crystal set',
      'bridal necklace and earring set',
      'silver bracelet and ring combo',
      'adorous jewelry box set',
    ],
    metaDescription:
      'Luxe silver crystal gemstone 5-piece box set featuring sparkling white crystal necklace, earrings, bracelet, and ring in a luxury leather case. Buy in BD.',
    details: [
      'Pieces Included: 1x Adjustable Crystal Necklace, 1x Pair of Matching Earrings, 1x Adjustable Crystal Bracelet, 1x Adjustable Ring, 1x Premium PU Leather Box',
      'Finish: Brilliant silver-tone metal',
      'Color: Diamond-White / Clear Crystal',
      'Style: European & American Classic',
      'Storage: Includes premium padded PU leather gift case',
      'Perfect For: Weddings, parties, formal events, or premium gifting',
    ],
    piecesIncluded: [
      '1x Adjustable Crystal Drop Necklace',
      '1x Pair Matching Crystal Earrings',
      '1x Adjustable Crystal Bracelet',
      '1x Adjustable Crystal Ring',
      '1x Premium PU Leather Presentation Box',
    ],
    colorways: [
      {
        id: 'diamond-white-silver',
        name: 'Diamond White & Silver',
        hex: '#E0E0E0',
        inStock: true,
        image: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/IMG_5822.heic?v=1782451897',
      },
    ],
    galleryImages: [
      {
        url: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/IMG_5822.heic?v=1782451897',
        altText: 'Luxe crystal gemstone suite 5-piece collection with necklace, earrings, bracelet, and ring in silver presentation box',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/silver.png?v=1782763499',
        altText: 'Silver 5-piece crystal gemstone suite arranged inside luxury presentation case',
      },
    ],
  },

  // 11. Luxe Crystal Gemstone Simple Suite (5-Piece Box Set)
  {
    id: 'prod-luxe-crystal-gemstone-simple-suite-5-piece-box-set',
    slug: 'luxe-crystal-gemstone-simple-suite-5-piece-box-set',
    name: 'Luxe Crystal Gemstone Simple Suite (5-Piece Box Set)',
    category: 'jewelry',
    categoryLabel: 'Fine Jewelry Sets',
    tagline: 'Delicate Minimalist 5-Piece Suite in Premium Presentation Box',
    price: 1390.0,
    originalPrice: 1490.0,
    description:
      'Embrace the power of understated elegance. The Luxe Crystal Gemstone Simple Suite offers a delicate and refined take on luxury. This complete 5-piece collection is designed for those who appreciate clean lines, effortless style, and a subtle, sophisticated sparkle.\n\nPerfect for seamlessly transitioning from daytime wear to evening elegance, this minimalist set arrives beautifully packaged in a premium presentation box, making it an ideal gift or a highly versatile addition to your own jewelry collection.',
    featuredImage: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/IMG_5825.heic?v=1782469806',
    badge: 'Minimalist',
    inStock: true,
    stockQty: 4,
    isNewDrop: false,
    isGiftPick: true,
    isBestseller: false,
    featuredRank: 11,
    seoKeywords: [
      'minimalist crystal jewelry set',
      'simple necklace and earring set bd',
      'dainty bracelet and ring combo',
      'everyday crystal jewelry dhaka',
      'luxury gift box',
    ],
    metaDescription:
      'Minimalist Luxe Crystal Gemstone Simple 5-piece suite with dainty necklace, subtle earrings, slender bracelet, ring, and leather case. Everyday grace in BD.',
    details: [
      'Pieces Included: 1x Adjustable Crystal Necklace, 1x Pair of Subtle Earrings, 1x Minimalist Bracelet, 1x Adjustable Ring, 1x Premium PU Leather Box',
      'Design: Delicate & Minimalist',
      'Stone: Brilliant Clear Crystal',
      'Style: Modern Minimalist / Everyday Elegance',
      'Necklace: Dainty chain featuring a single elegant crystal pendant',
      'Earrings: Subtle and lightweight for comfortable everyday brilliance',
      'Bracelet: Slender, graceful design that adds a shimmer to your wrist',
      'Ring: Refined slim band with crystal accent',
      'Perfect For: Office wear, casual chic outfits, subtle evening glamour, and premium gifting',
    ],
    piecesIncluded: [
      '1x Dainty Adjustable Crystal Pendant Necklace',
      '1x Pair Subtle Minimalist Crystal Earrings',
      '1x Slender Minimalist Crystal Bracelet',
      '1x Refined Adjustable Crystal Ring',
      '1x Premium PU Leather Presentation Box',
    ],
    colorways: [
      {
        id: 'minimalist-clear-crystal',
        name: 'Minimalist Clear Crystal',
        hex: '#FFFFFF',
        inStock: true,
        image: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/IMG_5825.heic?v=1782469806',
      },
    ],
    galleryImages: [
      {
        url: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/IMG_5825.heic?v=1782469806',
        altText: 'Luxe crystal gemstone simple minimalist 5-piece jewelry set in PU leather gift box',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/simple.png?v=1782763485',
        altText: 'Minimalist crystal gemstone jewelry suite neatly displayed in presentation box',
      },
    ],
  },

  // 12. The Playful Embossed Commuter Tote
  {
    id: 'prod-the-playful-embossed-commuter-tote',
    slug: 'the-playful-embossed-commuter-tote',
    name: 'The Playful Embossed Commuter Tote Bag',
    category: 'bags',
    categoryLabel: 'Luxury Bags & Satchels',
    tagline: 'Charming Doodle-Embossed Shoulder Bag with Dual Chambers',
    price: 720.0,
    originalPrice: 990.0,
    description:
      'Add a touch of fun to your daily routine with our Playful Embossed Commuter Tote. This charming white shoulder bag stands out with its adorable, embossed doodle pattern — featuring cute icons like hearts, bows, and smiley faces. It is perfectly finished with contrasting tan straps and a secure top zipper.\n\nDesigned for college students and busy women who love a hint of personality in their accessories, this lightweight tote maintains a straightforward, fuss-free design at an unbeatable value. It easily holds your notebooks, daily essentials, or makeup kit, keeping you organized on the go.',
    featuredImage: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/pookie.png?v=1782926791',
    badge: 'Chic Doodle',
    inStock: false,
    stockQty: 0,
    isNewDrop: true,
    isGiftPick: true,
    isBestseller: false,
    featuredRank: 12,
    seoKeywords: [
      'embossed tote bag',
      'doodle shoulder bag bd',
      'college commuter tote dhaka',
      'white tote bag with tan straps',
      'ladies shoulder handbag bangladesh',
    ],
    metaDescription:
      'Shop the Playful Embossed Commuter Tote featuring embossed doodle heart and bow patterns, tan shoulder straps, and zip storage. Perfect for university in BD.',
    details: [
      'Large Capacity: Spacious interior designed to easily hold daily college or commuting essentials',
      'Functional Storage: 1 roomy inside chamber for main items + 1 convenient outside quick-access chamber',
      'Playful Aesthetic: Unique all-over embossed pattern with hearts, bows, and smiley icons',
      'Secure & Comfortable: Secure top zipper closure paired with sturdy tan shoulder straps for all-day comfort',
      'Material: Textured high-grade faux leather',
      'Carry Options: Top carry handles and shoulder wear',
    ],
    piecesIncluded: ['1x Playful Embossed Commuter Tote Bag'],
    colorways: [
      {
        id: 'chalk-white-tan',
        name: 'Chalk White & Tan Straps',
        hex: '#F5F5F0',
        inStock: false,
        image: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/pookie.png?v=1782926791',
      },
    ],
    galleryImages: [
      {
        url: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/pookie.png?v=1782926791',
        altText: 'The Playful Embossed Commuter Tote bag in chalk white with embossed doodle icons and tan shoulder straps',
      },
    ],
  },

  // 13. The Everyday Casual Commuter Tote (Merged Ivory & Black)
  {
    id: 'prod-the-everyday-casual-commuter-tote',
    slug: 'the-everyday-casual-commuter-tote',
    name: 'The Everyday Casual Commuter Tote Bag',
    category: 'bags',
    categoryLabel: 'Luxury Bags & Satchels',
    tagline: 'Large-Capacity Textured Shoulder Bag with Dual Chambers',
    price: 750.0,
    originalPrice: 990.0,
    description:
      'Step out in effortless style with our Everyday Casual Commuter Tote, the perfect companion for college students and busy women on the go. Inspired by the latest streetwear trends, this shoulder handbag features a chic textured finish complemented by sleek contrast straps and elegant gold-tone hardware.\n\nDesigned for practicality and daily wear, this lightweight tote provides one roomy inside chamber for notebooks and makeup kits, plus an exterior pocket for fast access to your phone and transit cards.',
    featuredImage: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/white.png?v=1782926558',
    badge: 'Everyday Chic',
    inStock: true,
    stockQty: 10,
    isNewDrop: false,
    isGiftPick: true,
    isBestseller: true,
    featuredRank: 13,
    seoKeywords: [
      'commuter tote bag bd',
      'casual shoulder handbag dhaka',
      'large capacity ladies tote',
      'everyday canvas tote bag',
      'streetwear tote bag bangladesh',
    ],
    metaDescription:
      'Carry the Everyday Casual Commuter Tote featuring a textured canvas finish, dual storage compartments, and sturdy straps. Available in Ivory & Black in BD.',
    details: [
      'Large Capacity: Spacious interior designed to hold notebooks, daily essentials, and pouches',
      'Simple & Functional Storage: 1 roomy inside main chamber + 1 convenient outside quick-access pocket',
      'Trendy Aesthetic: Textured, canvas-like aesthetic with contrasting straps and gold-tone hardware',
      'Comfortable Carry: Sturdy reinforced shoulder straps designed for comfortable all-day wear',
      'Carry Options: Dual top handles and shoulder straps',
      'Available Colors: Ivory Cream (bright neutral) and Midnight Black (chic streetwear texture)',
    ],
    piecesIncluded: ['1x Everyday Casual Commuter Tote Bag'],
    colorways: [
      {
        id: 'ivory-cream',
        name: 'Ivory Cream',
        hex: '#FFFDD0',
        inStock: true,
        image: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/white.png?v=1782926558',
      },
      {
        id: 'midnight-black',
        name: 'Midnight Black',
        hex: '#1A1A1A',
        inStock: true,
        image: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/black.png?v=1782926371',
      },
    ],
    galleryImages: [
      {
        url: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/white.png?v=1782926558',
        altText: 'The Everyday Casual Commuter Tote in textured ivory cream with contrast dark shoulder straps',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/black.png?v=1782926371',
        altText: 'The Everyday Casual Commuter Tote in textured midnight black with gold-tone hardware',
      },
    ],
  },

  // 14. The Croc-Embossed Structured Satchel Bag (Merged 3 Colors)
  {
    id: 'prod-the-croc-structured-satchel',
    slug: 'the-croc-structured-satchel',
    name: 'The Croc-Embossed Structured Satchel Bag',
    category: 'bags',
    categoryLabel: 'Luxury Bags & Satchels',
    tagline: 'Architectural Crocodile-Pattern Satchel with Dual-Tone U-Clasp',
    price: 2390.0,
    originalPrice: 2890.0,
    description:
      'Playful yet perfectly polished, The Croc-Embossed Structured Satchel adds modern architectural luxury to your accessory collection. Wrapped in an all-over faux-crocodile embossed texture, this bag offers a sharp, firm silhouette that holds its shape effortlessly.\n\nPaired with a matching embossed top handle and a detachable, adjustable crossbody strap, it transitions seamlessly from daytime meetings to elegant evening dinners. Finished with polished gold-tone hardware and a distinctive dual-tone U-shaped front clasp.',
    featuredImage: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/solid-purple.png?v=1782911391',
    badge: 'Luxury Satchel',
    inStock: true,
    stockQty: 4,
    isNewDrop: true,
    isGiftPick: true,
    isBestseller: true,
    featuredRank: 14,
    seoKeywords: [
      'croc embossed satchel bag',
      'structured crossbody bag bd',
      'ladies luxury handbag dhaka',
      'top handle satchel bag',
      'faux leather croc bag bangladesh',
    ],
    metaDescription:
      'Elevate your wardrobe with the Croc-Embossed Structured Satchel bag featuring a dual-tone U-clasp and crossbody strap. Available in Lavender, Ivory & Black.',
    details: [
      'Premium Texture: All-over faux-crocodile embossed exterior with rich tactile depth',
      'Versatile Styling: Carry by the sturdy top handle, or use the included matching adjustable crossbody strap',
      'Luxe Hardware: Polished gold-tone accents featuring a distinctive dual-tone U-shaped front closure',
      'Structured Silhouette: Maintains a firm, architectural shape to keep daily essentials organized and secure',
      'Interior: Single main structured compartment with smooth lining',
      'Available Colors: Soft Lavender Lilac, Pristine Ivory White, Bold Midnight Black',
    ],
    piecesIncluded: [
      '1x Croc-Embossed Structured Satchel Bag',
      '1x Detachable Matching Adjustable Crossbody Strap',
    ],
    colorways: [
      {
        id: 'lavender-lilac',
        name: 'Lavender Lilac',
        hex: '#B57EDC',
        inStock: true,
        image: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/solid-purple.png?v=1782911391',
      },
      {
        id: 'pristine-ivory',
        name: 'Pristine Ivory',
        hex: '#FFFFF0',
        inStock: false,
        image: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/solid-white-1.png?v=1782911196',
      },
      {
        id: 'midnight-black',
        name: 'Midnight Black',
        hex: '#1A1A1A',
        inStock: true,
        image: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/solid-black-1.png?v=1782910590',
      },
    ],
    galleryImages: [
      {
        url: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/solid-purple.png?v=1782911391',
        altText: 'The Croc-Embossed Structured Satchel bag in soft lavender lilac with gold U-clasp',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/solid-white-1.png?v=1782911196',
        altText: 'The Croc-Embossed Structured Satchel bag in pristine ivory white with top handle',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/solid-black-1.png?v=1782910590',
        altText: 'The Croc-Embossed Structured Satchel bag in midnight black with detachable crossbody strap',
      },
    ],
  },

  // 15. The Woven Tweed Structured Satchel Bag (Merged Ivory & Black)
  {
    id: 'prod-the-tweed-structured-satchel',
    slug: 'the-tweed-structured-satchel',
    name: 'The Woven Tweed Structured Satchel Bag',
    category: 'bags',
    categoryLabel: 'Luxury Bags & Satchels',
    tagline: 'Classic Woven Tweed with Gold Threading & Mock-Croc Trim',
    price: 2390.0,
    originalPrice: 2690.0,
    description:
      'The Woven Tweed Structured Satchel brings a touch of timeless French chic and elegance to any wardrobe. Crafted with woven tweed-style fabric enriched with subtle sparkling gold threading, this bag offers a sophisticated texture that effortlessly transitions from day to night.\n\nThe structured silhouette is beautifully contrasted by a sleek mock-crocodile top handle and an adjustable detachable crossbody strap, giving you multiple ways to style it. Finished with gleaming gold-tone hardware and a statement U-shaped front clasp.',
    featuredImage: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/design-white.png?v=1782910544',
    badge: 'Tweed Luxury',
    inStock: true,
    stockQty: 2,
    isNewDrop: true,
    isGiftPick: true,
    isBestseller: false,
    featuredRank: 15,
    seoKeywords: [
      'tweed satchel bag',
      'woven tweed handbag bd',
      'gold thread satchel dhaka',
      'luxury evening handbag',
      'vintage tweed crossbody bag',
    ],
    metaDescription:
      'Shop the Woven Tweed Structured Satchel bag crafted with sparkling gold thread, mock-croc handle, and signature U-clasp. Available in Ivory & Black in BD.',
    details: [
      'Premium Texture: Woven tweed-style fabric detailed with subtle sparkling gold metallic threading',
      'Contrasting Handle: Textured mock-crocodile top handle with matching detachable crossbody strap',
      'Luxe Hardware: Polished gold-tone accents featuring a distinctive U-shaped front closure',
      'Structured Silhouette: Maintains a firm, architectural shape to keep your essentials organized and secure',
      'Interior: Single main structured compartment with high-density lining',
      'Available Colors: Ivory & Gold Woven Tweed and Midnight Black & Gold Woven Tweed',
    ],
    piecesIncluded: [
      '1x Woven Tweed Structured Satchel Bag',
      '1x Detachable Mock-Croc Crossbody Strap',
    ],
    colorways: [
      {
        id: 'ivory-gold-tweed',
        name: 'Ivory & Gold Tweed',
        hex: '#F8F6F0',
        inStock: true,
        image: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/design-white.png?v=1782910544',
      },
      {
        id: 'midnight-black-tweed',
        name: 'Midnight Black & Gold Tweed',
        hex: '#222222',
        inStock: true,
        image: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/design-black.png?v=1782909248',
      },
    ],
    galleryImages: [
      {
        url: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/design-white.png?v=1782910544',
        altText: 'The Woven Tweed Structured Satchel bag in ivory white and sparkling gold threading with mock croc handle',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/design-black.png?v=1782909248',
        altText: 'The Woven Tweed Structured Satchel bag in midnight black and gold woven tweed with gold hardware',
      },
    ],
  },

  // 16. Horizon Compact UV Protection Folding Umbrella (Merged Pink & Blue)
  {
    id: 'prod-horizon-compact-uv-umbrella',
    slug: 'horizon-compact-uv-umbrella',
    name: 'Horizon Compact UV Protection Folding Umbrella',
    category: 'umbrellas',
    categoryLabel: 'Designer Umbrellas',
    tagline: 'Dual-Tone Full Coverage Canopy with UPF 50+ Black Underside',
    price: 890.0,
    originalPrice: 1020.0,
    description:
      'Meet your everyday companion for unpredictable weather. The Horizon Compact Umbrella combines an elegant colored exterior with a UV-protective black underside, delivering complete coverage from rain or sun without sacrificing style.\n\nIts compact fold, reinforced windproof frame, and lightweight design mean you can carry reliable protection anywhere — in your handbag, car compartment, or travel carry-on. Includes a travel wrap and wrist strap.',
    featuredImage: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/PINK-CART.png?v=1784728682',
    badge: 'UV 50+ Protection',
    inStock: true,
    stockQty: 5,
    isNewDrop: false,
    isGiftPick: true,
    isBestseller: true,
    featuredRank: 16,
    seoKeywords: [
      'compact folding umbrella bd',
      'uv protection umbrella dhaka',
      'windproof rain umbrella',
      'lightweight travel umbrella',
      'stylish pastel umbrella bangladesh',
    ],
    metaDescription:
      'Stay protected with the Horizon Compact Folding Umbrella featuring a UV-blocking black underside and windproof frame. Available in Blush Pink & Sky Blue.',
    details: [
      'Full Coverage Canopy: Opens wide to keep you (and a friend) protected through sudden downpours',
      'Dual-Tone UV Black Underside: High-density black undercoating offers UPF 50+ UV sun and heat protection',
      'Reinforced Windproof Frame: Sturdy ribs withstand gusts and daily use without bending',
      'Compact Travel Fold: Collapses down to a slim, travel-friendly size that fits easily into any handbag',
      'Travel-Ready Wrap: Includes a snug wrap sleeve and matching wrist strap for effortless carrying',
      'Opening Mechanism: Smooth manual open/close mechanism with secure locking runner',
      'Available Colors: Blush Pink and Sky Blue',
    ],
    piecesIncluded: [
      '1x Horizon Compact UV Protection Folding Umbrella',
      '1x Matching Protective Travel Wrap Sleeve',
    ],
    colorways: [
      {
        id: 'blush-pink',
        name: 'Blush Pink',
        hex: '#E8A5B8',
        inStock: true,
        image: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/PINK-CART.png?v=1784728682',
      },
      {
        id: 'sky-blue',
        name: 'Sky Blue',
        hex: '#7BAFD4',
        inStock: false,
        image: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/BLUE-CART.png?v=1784728337',
      },
    ],
    galleryImages: [
      {
        url: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/PINK-CART.png?v=1784728682',
        altText: 'Horizon compact UV protection umbrella in blush pink exterior with black handle',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/PINK-OUT.png?v=1784728682',
        altText: 'Horizon folding umbrella canopy open exterior view in soft blush pink',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/PINK-IN.png?v=1784728682',
        altText: 'Horizon umbrella interior showing UV-protective black vinyl coating',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/PINK-WRAP.png?v=1784728682',
        altText: 'Horizon compact folding umbrella folded in travel wrap sleeve',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/BLUE-CART.png?v=1784728337',
        altText: 'Horizon compact UV protection umbrella in sky blue exterior with black handle',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/BLUE-OUT.png?v=1784728337',
        altText: 'Horizon folding umbrella canopy open exterior view in sky blue',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/BLUE-IN.png?v=1784728337',
        altText: 'Horizon umbrella interior underside showing black sun protection layer',
      },
      {
        url: 'https://cdn.shopify.com/s/files/1/0693/0402/5136/files/BLUE-WRAP.png?v=1784728337',
        altText: 'Horizon compact folding umbrella folded in sky blue travel wrap sleeve',
      },
    ],
  },
];

async function main() {
  console.log('--- Starting Products Import ---');

  // 1. Remove obsolete dummy products if they exist and are not in orders
  const dummySlugs = [
    'boutique-monogram-tote',
    'shahi-pearl-drop-jhumkas',
    'rani-kundan-studded-bangle-set',
    'monsoon-luxe-windproof-umbrella',
  ];

  for (const dSlug of dummySlugs) {
    const existing = await prisma.product.findUnique({ where: { slug: dSlug } });
    if (existing) {
      console.log(`Removing dummy starter piece "${dSlug}"...`);
      await prisma.product.delete({ where: { slug: dSlug } });
    }
  }

  // 2. Upsert each real product into Neon PostgreSQL
  for (const p of PRODUCTS_TO_IMPORT) {
    console.log(`Importing: "${p.name}" (${p.slug})...`);

    // Clean existing relations if product exists to avoid duplicates
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (existing) {
      await prisma.productDetail.deleteMany({ where: { productId: existing.id } });
      await prisma.productPiece.deleteMany({ where: { productId: existing.id } });
      await prisma.productColorway.deleteMany({ where: { productId: existing.id } });
      await prisma.productGalleryImage.deleteMany({ where: { productId: existing.id } });

      await prisma.product.update({
        where: { slug: p.slug },
        data: {
          name: p.name,
          category: p.category,
          categoryLabel: p.categoryLabel,
          tagline: p.tagline,
          price: p.price,
          originalPrice: p.originalPrice,
          description: p.description,
          featuredImage: p.featuredImage,
          badge: p.badge,
          inStock: p.inStock,
          stockQty: p.stockQty,
          isNewDrop: p.isNewDrop ?? false,
          isGiftPick: p.isGiftPick ?? false,
          isBestseller: p.isBestseller ?? false,
          featuredRank: p.featuredRank,
          seoKeywords: p.seoKeywords.join(','),
          details: {
            create: p.details.map((t) => ({ text: t })),
          },
          piecesIncluded: {
            create: p.piecesIncluded.map((t) => ({ text: t })),
          },
          colorways: {
            create: p.colorways.map((c) => ({
              colorId: c.id,
              name: c.name,
              hex: c.hex,
              inStock: c.inStock,
              image: c.image || null,
            })),
          },
          galleryImages: {
            create: p.galleryImages.map((g) => ({ url: g.url })),
          },
        },
      });
    } else {
      await prisma.product.create({
        data: {
          id: p.id,
          slug: p.slug,
          name: p.name,
          category: p.category,
          categoryLabel: p.categoryLabel,
          tagline: p.tagline,
          price: p.price,
          originalPrice: p.originalPrice,
          description: p.description,
          featuredImage: p.featuredImage,
          badge: p.badge,
          inStock: p.inStock,
          stockQty: p.stockQty,
          isNewDrop: p.isNewDrop ?? false,
          isGiftPick: p.isGiftPick ?? false,
          isBestseller: p.isBestseller ?? false,
          featuredRank: p.featuredRank,
          seoKeywords: p.seoKeywords.join(','),
          details: {
            create: p.details.map((t) => ({ text: t })),
          },
          piecesIncluded: {
            create: p.piecesIncluded.map((t) => ({ text: t })),
          },
          colorways: {
            create: p.colorways.map((c) => ({
              colorId: c.id,
              name: c.name,
              hex: c.hex,
              inStock: c.inStock,
              image: c.image || null,
            })),
          },
          galleryImages: {
            create: p.galleryImages.map((g) => ({ url: g.url })),
          },
        },
      });
    }
  }

  // 3. Export JSON backup for user
  const jsonExportPath = path.join(process.cwd(), 'src/data/products_catalogue.json');
  fs.writeFileSync(jsonExportPath, JSON.stringify(PRODUCTS_TO_IMPORT, null, 2), 'utf-8');
  console.log(`Saved full JSON export to: ${jsonExportPath}`);

  const totalInDb = await prisma.product.count();
  console.log(`--- Finished! Total products now in database: ${totalInDb} ---`);
}

main()
  .catch((err) => {
    console.error('Migration error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
