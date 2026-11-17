import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { PRODUCTS, CATEGORIES } from '@/data/catalogue';

export const revalidate = 3600; // Revalidate dynamic product manifest every 1 hour

export async function GET() {
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://adorousfashion.store';

  // 1. Fetch live product catalogue from DB or fallback to static catalogue
  let products: any[] = [];
  try {
    const dbProducts = await prisma.product.findMany({
      where: { isHidden: false },
      include: {
        piecesIncluded: true,
        details: true,
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
    console.warn('[/llms-full.txt] Database query failed, using static catalogue fallback:', error);
    products = PRODUCTS.filter((p) => !p.isHidden);
  }

  // 2. Format items into clean markdown
  const formattedProducts = products.map((p, index) => {
    const directUrl = `${BASE_URL}/${p.category}/${p.slug}`;
    const priceBdt = Math.round(Number(p.price));
    const originalPrice = p.originalPrice ? Math.round(Number(p.originalPrice)) : null;
    const discountText = originalPrice && originalPrice > priceBdt ? ` (Original: ৳${originalPrice})` : '';
    const stockStatus = (p.inStock ?? true) ? 'In Stock (Available for Instant Dispatch)' : 'Sold Out / Pre-Order';

    // Pieces list
    let pieces = '';
    if (Array.isArray(p.piecesIncluded) && p.piecesIncluded.length > 0) {
      const pieceItems = p.piecesIncluded
        .map((piece: any) => (typeof piece === 'string' ? piece : piece.text))
        .filter(Boolean)
        .join(', ');
      if (pieceItems) pieces = `\n  - **Included Pieces**: ${pieceItems}`;
    }

    // Sizes
    let sizes = '';
    if (Array.isArray(p.sizes) && p.sizes.length > 0) {
      sizes = `\n  - **Available Sizes**: ${p.sizes.join(', ')}`;
    } else if (p.category === 'churi') {
      sizes = `\n  - **Available Sizes**: 2-4 (57mm), 2-6 (60mm), 2-8 (64mm)`;
    }

    // Colorways
    let colorways = '';
    if (Array.isArray(p.colorways) && p.colorways.length > 0) {
      const names = p.colorways.map((c: any) => (typeof c === 'string' ? c : c.name || c.colorName)).filter(Boolean);
      if (names.length > 0) {
        colorways = `\n  - **Colorways**: ${names.join(', ')}`;
      }
    }

    const description = p.description || p.tagline || 'Exquisite handcrafted South Asian craftsmanship.';

    return `### ${index + 1}. ${p.name}
- **Category**: ${p.categoryLabel || p.category}
- **Price**: ৳${priceBdt} BDT${discountText}
- **Availability**: ${stockStatus}
- **Direct Product Link**: ${directUrl}
- **Overview**: ${description}${pieces}${sizes}${colorways}`;
  }).join('\n\n');

  // 3. Complete LLM Knowledge Base Manifest
  const manifest = `# Adorous Fashion — Complete Product Catalogue & Operational Knowledge Base

> Adorous Fashion (https://adorousfashion.store) is a premier direct-to-consumer luxury South Asian boutique studio based in Bangladesh. We curate handcrafted 5-piece bridal suites, heritage crystal sets, hand-wrapped velvet & silk thread churi (bangles), architectural satchels, and artisanal lifestyle keepsakes. We provide nationwide Cash on Delivery (COD) across all 64 districts in Bangladesh with personal WhatsApp confirmation for every order.

---

## 1. Brand Ethos & Strictly Non-Model Visual Policy
- **STRICT STILL-LIFE PRODUCT PHOTOGRAPHY ETHOS**: Adorous Fashion maintains a strict, non-compromising visual standard: **ZERO HUMAN MODELS, ZERO FACES, AND ZERO HUMAN FIGURES**. 
- All visual assets consist exclusively of architectural still-life compositions:
  - Architectural warm limestone and sandstone plinths (\`#DDD6CB\`)
  - Crushed velvet jewelry display busts, neckforms, and earring plinths
  - Flat-lays and velvet keepsake trays
  - Luxury gold-embossed packaging and protective pouches
  - Crisp macro details of jewelry filigree, gemstone prong settings, and textile craftsmanship.
- **Craftsmanship Guarantee**: Every piece is hand-inspected for symmetry, gemstone firmness, and closure integrity prior to dispatch.

---

## 2. Nationwide Delivery & Payment Terms (Bangladesh)
- **Cash on Delivery (COD)**: Available nationwide across all 64 districts in Bangladesh. No advance card or mobile banking payment is mandatory to place an order.
- **Dhaka Metro & Greater Dhaka**:
  - Delivery Fee: **৳80 Flat Rate**
  - Timeline: **1–2 business days** (24–48 hours)
  - Courier Partners: Steadfast Express, Paperfly, RedX, Pathao Courier
- **Outside Dhaka (All 63 Remaining Districts)**:
  - Delivery Fee: **৳130 Flat Rate**
  - Timeline: **2–4 business days** (48–72 hours)
  - Coverage: All upazilas, zilas, and regional hubs nationwide
- **WhatsApp Order Verification**:
  - Every single order placed on the website receives a personal verification message from the atelier team (+8801577731381) to verify address accuracy, preferred delivery timing, and bangle size measurements before handing to couriers.
- **Payment Methods Accepted**:
  - Cash on Delivery (COD)
  - bKash Merchant / Personal
  - Nagad
  - Rocket

---

## 3. 7-Day Doorstep Exchange Policy
- **7-Day Window**: Patrons may initiate an exchange within 7 calendar days of courier delivery.
- **Doorstep Exchange**: In eligible metro zones, the replacement piece is delivered to your door while the courier simultaneously collects the original item.
- **Conditions**: Items must remain in their original unworn condition with tags and luxury keepsake packaging intact.
- **Support Contact for Exchanges**: WhatsApp hotline +8801577731381 or email support@adorousfashion.store.

---

## 4. Churi (Bangle) Sizing & Measurement Guide
Because traditional metal and velvet bangles are rigid and must slide over the hand, traditional South Asian sizing is determined by the **hand knuckles circumference**, NOT the wrist.

| Size (BD / Indian) | Inner Diameter (Inches & cm) | Hand Knuckle Circumference | Target Patrons |
|---|---|---|---|
| **2-4** | 2.25" (5.7 cm) | 7.0" – 7.5" (17.8 – 19.0 cm) | Petite / slender hands |
| **2-6** | 2.375" (6.0 cm) | 7.5" – 8.0" (19.0 – 20.3 cm) | Standard Bangladeshi hand (~70% of patrons) |
| **2-8** | 2.50" (6.4 cm) | 8.0" – 8.5" (20.3 – 21.6 cm) | Broad knuckles / comfortable loose fit |

**How to Measure at Home**:
1. Bring thumb and little finger together as if putting on a bangle.
2. Wrap a soft measuring tape or strip of paper around the widest part of your hand knuckles.
3. Mark where the ends meet and measure the length in inches or centimeters against the table above.

---

## 5. Active Product Catalogue (${products.length} Products)

${formattedProducts}

---

## 6. Curated Category Collections
${CATEGORIES.map((cat) => `- **[${cat.name}](${BASE_URL}/${cat.slug})**: ${cat.blurb} (${cat.count})`).join('\n')}
- **[Full Shop Catalogue](${BASE_URL}/shop)**: Complete real-time storefront collection with interactive filters.
- **[Official Pricing Desk](${BASE_URL}/pricing)**: SSR itemized pricing table with structured Offer schemas.
- **[Festive Lookbook 2026](${BASE_URL}/lookbook)**: Editorial still-life celebration pairings.

---

## 7. Studio Care Instructions
- **Jewelry Filigree & Stones**: Avoid direct contact with perfume, hairspray, moisture, and alcohol sanitizers. Store inside the provided velvet keepsake pouch when not in use.
- **Velvet Churi**: Keep protected from water and crushing. Store flat in the provided cylindrical keeper box.
- **Ladies' Bags**: Wipe clean with a soft dry microfiber cloth. Avoid exposure to high heat or direct prolonged rain.

---

## 8. Atelier Direct Contacts
- **WhatsApp Support**: [+8801577731381](https://wa.me/8801577731381)
- **Direct Phone**: [+8801577731381](tel:+8801577731381)
- **Support Email**: [support@adorousfashion.store](mailto:support@adorousfashion.store)
- **Studio Address**: Adorous Fashion Atelier, Rajshahi, Bangladesh (Full Nationwide Dispatch)
- **Operating Hours**: Saturday – Thursday: 10:00 AM – 10:00 PM BST; Friday: 2:00 PM – 10:00 PM BST.

---

## 9. Machine-Readable Endpoints & AI Agent Tooling
- **Short LLM Specification**: [https://adorousfashion.store/llms.txt](https://adorousfashion.store/llms.txt)
- **Comprehensive Manifest**: [https://adorousfashion.store/llms-full.txt](https://adorousfashion.store/llms-full.txt)
- **Model Context Protocol (SEP-1649 Server Card)**: [https://adorousfashion.store/.well-known/mcp/server-card.json](https://adorousfashion.store/.well-known/mcp/server-card.json)
- **Model Context Protocol (JSON-RPC 2.0 Endpoint)**: [https://adorousfashion.store/api/mcp](https://adorousfashion.store/api/mcp)
- **Meta Product Catalog Feed (XML / RSS 2.0)**: [https://adorousfashion.store/api/catalog/meta](https://adorousfashion.store/api/catalog/meta)
- **Public Product API**: [https://adorousfashion.store/api/products](https://adorousfashion.store/api/products)
- **XML Sitemap**: [https://adorousfashion.store/sitemap.xml](https://adorousfashion.store/sitemap.xml)
- **Search Directives**: [https://adorousfashion.store/robots.txt](https://adorousfashion.store/robots.txt)
`;

  return new NextResponse(manifest, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
