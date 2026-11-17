import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { PRODUCTS } from '@/data/catalogue';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache feed for 1 hour

function escapeXml(unsafe: string): string {
  return (unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getGoogleProductCategory(category: string): string {
  const cat = (category || '').toLowerCase();
  if (cat.includes('bag')) return 'Apparel &amp; Accessories &gt; Handbags, Wallets &amp; Cases &gt; Handbags';
  if (cat.includes('earring') || cat.includes('churi') || cat.includes('jewelry')) {
    return 'Apparel &amp; Accessories &gt; Jewelry';
  }
  return 'Apparel &amp; Accessories &gt; Jewelry';
}

export async function GET() {
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://adorousfashion.store';

  let products: any[] = [];
  try {
    const dbProducts = await prisma.product.findMany({
      where: { isHidden: false },
      include: {
        galleryImages: true,
        colorways: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (dbProducts && dbProducts.length > 0) {
      products = dbProducts;
    } else {
      products = PRODUCTS.filter((p) => !p.isHidden);
    }
  } catch (error) {
    console.warn('[/api/catalog/meta] Database query failed, falling back to static catalogue:', error);
    products = PRODUCTS.filter((p) => !p.isHidden);
  }

  const itemsXml = products
    .map((prod) => {
      const id = prod.id;
      const title = escapeXml(prod.name);
      const description = escapeXml(
        prod.description || prod.tagline || `${prod.name} - Boutique South Asian jewelry & lifestyle accessories by Adorous Fashion.`
      );
      const link = `${BASE_URL}/${prod.category}/${prod.slug}`;
      const imageUrl = prod.featuredImage.startsWith('http')
        ? prod.featuredImage
        : `${BASE_URL}${prod.featuredImage}`;

      const isInStock = (prod.inStock ?? true) && (prod.stockQty === null || prod.stockQty === undefined || prod.stockQty > 0);
      const availability = isInStock ? 'in stock' : 'out of stock';

      const sellingPrice = Math.round(Number(prod.price));
      const originalPrice = prod.originalPrice ? Math.round(Number(prod.originalPrice)) : null;

      const hasDiscount = originalPrice && originalPrice > sellingPrice;
      const basePriceFormatted = hasDiscount ? `${originalPrice} BDT` : `${sellingPrice} BDT`;
      const salePriceFormatted = hasDiscount ? `${sellingPrice} BDT` : '';

      const categoryPath = getGoogleProductCategory(prod.category);
      const productType = escapeXml(`Atelier Accessories > ${prod.categoryLabel || prod.category}`);

      const additionalImages = (prod.galleryImages || [])
        .map((g: any) => (typeof g === 'string' ? g : g.url))
        .filter((url: string) => url && url !== prod.featuredImage)
        .slice(0, 5)
        .map((url: string) => {
          const absUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
          return `<g:additional_image_link>${escapeXml(absUrl)}</g:additional_image_link>`;
        })
        .join('\n        ');

      return `    <item>
      <g:id>${escapeXml(id)}</g:id>
      <g:title>${title}</g:title>
      <g:description>${description}</g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      ${additionalImages}
      <g:brand>Adorous Fashion</g:brand>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${basePriceFormatted}</g:price>
      ${hasDiscount ? `<g:sale_price>${salePriceFormatted}</g:sale_price>` : ''}
      <g:google_product_category>${categoryPath}</g:google_product_category>
      <g:product_type>${productType}</g:product_type>
      <g:custom_label_0>Still Life Photography</g:custom_label_0>
      <g:custom_label_1>Cash on Delivery Bangladesh</g:custom_label_1>
      <g:shipping>
        <g:country>BD</g:country>
        <g:service>Standard Nationwide Delivery</g:service>
        <g:price>80 BDT</g:price>
      </g:shipping>
    </item>`;
    })
    .join('\n');

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Adorous Fashion Atelier Product Catalog</title>
    <link>${BASE_URL}</link>
    <description>Curated luxury South Asian jewelry sets, velvet churi bangles, and handcrafted ladies satchels in Bangladesh.</description>
${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(xmlContent, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
