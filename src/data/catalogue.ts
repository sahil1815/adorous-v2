import { Product } from "@/types";
import catalogueJson from "./products_catalogue.json";

export const PRODUCTS: Product[] = (catalogueJson as any[]).map((p) => ({
  id: p.id,
  slug: p.slug,
  name: p.name,
  category: p.category,
  categoryLabel: p.categoryLabel,
  tagline: p.tagline,
  price: p.price,
  originalPrice: p.originalPrice,
  description: p.description,
  details: p.details,
  piecesIncluded: p.piecesIncluded,
  colorways: p.colorways,
  featuredImage: p.featuredImage,
  galleryImages: p.galleryImages.map((g: any) => g.url),
  isNewDrop: p.isNewDrop ?? false,
  isGiftPick: p.isGiftPick ?? false,
  isBestseller: p.isBestseller ?? false,
  inStock: p.inStock ?? true,
  stockQty: p.stockQty,
  featuredRank: p.featuredRank,
  seoKeywords: p.seoKeywords,
}));

export const CATEGORIES = [
  {
    slug: "jewelry",
    name: "Jewelry Sets",
    count: "5 Designs",
    image: "https://cdn.shopify.com/s/files/1/0693/0402/5136/files/goldenjewellery_1.png?v=1782823176",
    blurb: "Handcrafted 5-piece luxury suites and 2-piece crystal sets presented in artisanal gift cases.",
  },
  {
    slug: "bags",
    name: "Ladies' Bags",
    count: "4 Designs",
    image: "https://cdn.shopify.com/s/files/1/0693/0402/5136/files/solid-purple.png?v=1782911391",
    blurb: "Architectural croc-embossed satchels, woven French tweed, and everyday commuter totes.",
  },
  {
    slug: "churi",
    name: "Churi (Bangles)",
    count: "3 Designs",
    image: "https://cdn.shopify.com/s/files/1/0693/0402/5136/files/Combo-3.png?v=1782974184",
    blurb: "Hand-wrapped silk thread bangle collections, Kundan mirror border stacks, and festive quads.",
  },
  {
    slug: "earrings",
    name: "Earrings",
    count: "3 Designs",
    image: "https://cdn.shopify.com/s/files/1/0693/0402/5136/files/Kashmiri-A.png?v=1787068080",
    blurb: "Kashmiri heritage lotus and peacock jhumkas, and multi-stone filigree bell earrings.",
  },
  {
    slug: "umbrellas",
    name: "Designer Umbrellas",
    count: "1 Design",
    image: "https://cdn.shopify.com/s/files/1/0693/0402/5136/files/PINK-CART.png?v=1784728682",
    blurb: "Horizon compact UV-blocking umbrellas with reinforced windproof frames and travel wrap sleeves.",
  },
];

export const COLOR_FILTER_SWATCHES = [
  { id: "gold", name: "Radiant Gold", hex: "#D4AF37" },
  { id: "silver", name: "Antique / Bright Silver", hex: "#E0E0E0" },
  { id: "pink", name: "Blush Pink", hex: "#E8A5B8" },
  { id: "blue", name: "Sky / Royal Blue", hex: "#002366" },
  { id: "purple", name: "Imperial Amethyst", hex: "#582F72" },
  { id: "green", name: "Jade / Emerald Green", hex: "#1A5632" },
  { id: "black", name: "Midnight Black", hex: "#1A1A1A" },
  { id: "ivory", name: "Pristine Ivory", hex: "#FFFFF0" },
];
