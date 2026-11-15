import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

const llmsTxtContent = `# Adorous Fashion

> Adorous Fashion (https://adorousfashion.store) is a premier direct-to-consumer boutique studio in Bangladesh curating handcrafted luxury Pakistani & South Asian bridal jewelry sets, velvet churi (bangles), ladies' satchels and handbags, and artisanal lifestyle accessories. Operating with nationwide Cash on Delivery (COD) across all 64 districts in Bangladesh with personal WhatsApp order confirmation.

## Core Collections
- [Jewelry Sets](https://adorousfashion.store/jewelry): Handcrafted 5-piece bridal suites, crystal choker sets, and heritage festive suites presented in artisanal gift cases.
- [Churi (Bangles)](https://adorousfashion.store/churi): Silk thread bangle collections, Kundan mirror border stacks, and velvet quads in sizes 2-4 (57mm), 2-6 (60mm), and 2-8 (64mm).
- [Ladies' Bags](https://adorousfashion.store/bags): Architectural croc-embossed satchels, woven French tweed totes, and everyday commuter bags.
- [Earrings](https://adorousfashion.store/earrings): Kashmiri heritage lotus & peacock jhumkas and multi-stone filigree bell earrings.
- [Curated Lifestyle & More](https://adorousfashion.store/more): Curated lifestyle accessories, UV-blocking designer umbrellas, and artisanal keepsakes.
- [Shop Full Catalogue](https://adorousfashion.store/shop): Complete product catalogue with real-time stock levels, pricing, and filters.
- [Official Pricing & Catalogue](https://adorousfashion.store/pricing): Itemized prices in Bangladeshi Taka (৳ BDT) across all 30+ jewelry suites, velvet churi bangles, and satchel bags.
- [Festive Lookbook 2026](https://adorousfashion.store/lookbook): Curated celebration styling, suite pairings, and photography inspirations.

## Customer Care & Operations
- [Delivery & Payment Terms](https://adorousfashion.store/delivery-payment): Nationwide Cash on Delivery (COD) across all 64 districts in Bangladesh. Dhaka Metro: 1–2 days (৳80 fee); Outside Dhaka: 2–4 days (৳130 fee).
- [Returns & Exchange Policy](https://adorousfashion.store/returns-exchange): 7-day hassle-free size and style exchange policy.
- [Churi Sizing Guide](https://adorousfashion.store/size-fit): Official size guide for wrist measurements and standard bangle diameters.
- [Frequently Asked Questions](https://adorousfashion.store/faq): Common inquiries regarding ordering, delivery, materials, and care.
- [About the Atelier](https://adorousfashion.store/about): Studio ethos, craftsmanship standards, and still-life presentation.
- [Contact Studio](https://adorousfashion.store/contact): WhatsApp (+8801577731381), direct telephone, and email support.
- [Terms of Service](https://adorousfashion.store/terms): Ordering terms, warranty, and customer sales agreements.
- [Privacy Policy](https://adorousfashion.store/privacy): Customer data protection and privacy standards.

## Machine-Readable Resources
- [Sitemap](https://adorousfashion.store/sitemap.xml): Complete XML sitemap of all product and category URLs.
- [MCP Server Card](https://adorousfashion.store/.well-known/mcp/server-card.json): SEP-1649 Model Context Protocol server capabilities.
- [Robots Configuration](https://adorousfashion.store/robots.txt): Search crawler directives with Content-Signal declared.
`;

export function GET() {
  return new NextResponse(llmsTxtContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=86400',
    },
  });
}
