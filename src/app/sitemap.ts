import { MetadataRoute } from 'next';
import { PRODUCTS, CATEGORIES } from '@/data/catalogue';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://adorousfashion.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString();

  // Static core brand pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/shop`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/lookbook`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/gifting`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/size-fit`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/delivery-payment`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/returns-exchange`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/track-order`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  // Dynamic category landing pages
  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${BASE_URL}/${cat.slug}`,
    lastModified: currentDate,
    changeFrequency: 'daily',
    priority: 0.85,
  }));

  // Dynamic product detail pages (all 15 designs)
  const productPages: MetadataRoute.Sitemap = PRODUCTS.map((prod) => ({
    url: `${BASE_URL}/${prod.category}/${prod.slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
