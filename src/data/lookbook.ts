export interface LookbookPaletteItem {
  name: string;
  hex: string;
}

export interface LookbookLook {
  id: string;
  numeral: string;
  title: string;
  tagline: string;
  description: string;
  heroImage: string;
  palette: LookbookPaletteItem[];
  itemIds: string[];
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LookbookSettingsData {
  id: string;
  pageBadge: string;
  pageTitle: string;
  pageDescription: string;
  homepageBadge: string;
  homepageHeading: string;
  homepageDescription: string;
  homepageImage1: string;
  homepageImage1Label: string;
  homepageImage2: string;
  homepageImage2Label: string;
  updatedAt?: string;
}

export const DEFAULT_LOOKBOOK_SETTINGS: LookbookSettingsData = {
  id: 'default',
  pageBadge: 'Curated Still Life Harmonies',
  pageTitle: 'The Atelier Lookbook',
  pageDescription:
    'Every ensemble is photographed as a still life study on architectural warm stone plinths, velvet neckforms, and keepsake trays. Discover how our jewelry, bangles, and boutique bags unite into harmonious festival ensembles.',
  homepageBadge: 'Editorial Lookbook 2026',
  homepageHeading: 'Designed to dialogue, not compete.',
  homepageDescription:
    'Every piece in the Adorous catalog is calibrated to harmonize. The warm antique gold finish of the Zari Choker mirrors the brass clasps on the Gulshan Bag and the peacock karas on the Meher Bangle stack.',
  homepageImage1: '/images/products/jewelry-zari-choker.jpg',
  homepageImage1Label: 'Zari Bridal Choker',
  homepageImage2: '/images/products/churi-meher-emerald.jpg',
  homepageImage2Label: 'Meher Bangle Stack',
};

export const DEFAULT_LOOKBOOK_LOOKS: LookbookLook[] = [
  {
    id: 'look-01',
    numeral: 'LOOK I',
    title: 'The Regal Zamindar Suite',
    tagline: '22k Antique Filigree on Architectural Limestone Plinths',
    description:
      'Inspired by the grand zamindar palaces of Bengal. Heavy antique gold choker with hand-strung micro-pearls pairs with our signature imperial emerald velvet bangles and an architectural charcoal top-handle.',
    heroImage: '/images/hero/hero-still-life.jpg',
    palette: [
      { name: 'Antique Gold', hex: '#C6A96E' },
      { name: 'Imperial Emerald', hex: '#1A5632' },
      { name: 'Charcoal Black', hex: '#22262B' },
      { name: 'Limestone Sand', hex: '#DDD6CB' },
    ],
    itemIds: ['jewel-01', 'churi-01', 'bag-01'],
    sortOrder: 0,
    isActive: true,
  },
  {
    id: 'look-02',
    numeral: 'LOOK II',
    title: 'Old Dhaka Twilight Baithak',
    tagline: 'Heritage Hasli Collars on Midnight Velvet Pedestals',
    description:
      'Rigid geometric collar chokers cast in lightweight hollow core hug the collarbone, flanked by multi-tiered chandelier jhumkas and midnight charcoal accessories.',
    heroImage: '/images/products/jewelry-zari-choker.jpg',
    palette: [
      { name: 'Matte Brass', hex: '#B89758' },
      { name: 'Pearl Ivory', hex: '#F3EDE2' },
      { name: 'Warm Stone', hex: '#DDD6CB' },
    ],
    itemIds: ['jewel-02', 'ear-01', 'bag-02'],
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'look-03',
    numeral: 'LOOK III',
    title: 'Monsoon Serenade in Gulshan',
    tagline: 'Hand-Turned Chestnut Wood & Rainproof High-Density Silk',
    description:
      'Rainy days in Dhaka demand unapologetic elegance. Our UV50+ windproof umbrella with hand-turned chestnut curved handle pairs seamlessly with our structured tote.',
    heroImage: '/images/products/bag-gulshan-charcoal.jpg',
    palette: [
      { name: 'Chestnut Wood', hex: '#5A321E' },
      { name: 'Midnight Charcoal', hex: '#22262B' },
      { name: 'Champagne Gold', hex: '#DFCC9F' },
    ],
    itemIds: ['umb-01', 'bag-01', 'jewel-03'],
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 'look-04',
    numeral: 'LOOK IV',
    title: 'Mehendi & Sangeet Emeralds',
    tagline: 'Plush Velvet Stacks & Bell Jhumkas on Suede Trays',
    description:
      'The rhythmic clinking of velvet and gold churis. Paired with ornate bell jhumkas weighted for graceful movement without earlobe fatigue.',
    heroImage: '/images/products/churi-meher-emerald.jpg',
    palette: [
      { name: 'Emerald Velvet', hex: '#164A2B' },
      { name: 'Antique 22k Gold', hex: '#C6A96E' },
      { name: 'Crimson Ruby', hex: '#7B1925' },
    ],
    itemIds: ['churi-01', 'ear-01', 'churi-02'],
    sortOrder: 3,
    isActive: true,
  },
];
