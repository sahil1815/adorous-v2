import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

const robotsTxtContent = `User-Agent: *
Allow: /
Allow: /api/mcp
Allow: /api/products
Allow: /api/catalog/
Allow: /.well-known/mcp/
Disallow: /api/admin/
Disallow: /admin
Disallow: /admin/*
Disallow: /checkout
Disallow: /order-success/
Disallow: /promo/
Disallow: /promo/*
Disallow: /collections/
Disallow: /collections/*

Content-Signal: search=yes, ai-train=no

Sitemap: https://adorousfashion.store/sitemap.xml
`;

export function GET() {
  return new NextResponse(robotsTxtContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=86400',
    },
  });
}
