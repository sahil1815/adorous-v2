import { MetadataRoute } from 'next';
import { PRODUCTS, CATEGORIES } from '@/data/catalogue';
import { prisma } from '@/lib/db';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://adorousfashion.store';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
      url: `${BASE_URL}/pricing`,
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
    {
      url: `${BASE_URL}/llms.txt`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/llms-full.txt`,
      lastModified: currentDate,
      changeFrequency: 'daily',
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

  // Dynamic product detail pages (from authoritative database with static catalogue fallback)
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const dbProducts = await prisma.product.findMany({
      where: { isHidden: false },
      select: {
        slug: true,
        category: true,
        updatedAt: true,
      },
    });

    if (dbProducts && dbProducts.length > 0) {
      productPages = dbProducts.map((prod) => ({
        url: `${BASE_URL}/${prod.category}/${prod.slug}`,
        lastModified: prod.updatedAt ? prod.updatedAt.toISOString() : currentDate,
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    } else {
      productPages = PRODUCTS.filter((p) => !p.isHidden).map((prod) => ({
        url: `${BASE_URL}/${prod.category}/${prod.slug}`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.warn('[sitemap.ts] Database query failed, falling back to static catalogue:', error);
    productPages = PRODUCTS.filter((p) => !p.isHidden).map((prod) => ({
      url: `${BASE_URL}/${prod.category}/${prod.slug}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  }

  return [...staticPages, ...categoryPages, ...productPages];
}
