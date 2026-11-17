import { HOMEPAGE_MARKDOWN } from '@/lib/homepageMarkdown';
import { PRODUCTS, CATEGORIES } from '@/data/catalogue';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://adorousfashion.store';

export function getPageMarkdown(path: string): string | null {
  const cleanPath = path.toLowerCase().replace(/\/$/, '') || '/';

  // 1. Homepage
  if (cleanPath === '/') {
    return HOMEPAGE_MARKDOWN;
  }

  // 2. Shop Page
  if (cleanPath === '/shop') {
    const productList = PRODUCTS.filter((p) => !p.isHidden)
      .map((p, idx) => {
        const directUrl = `${BASE_URL}/${p.category}/${p.slug}`;
        const price = Math.round(p.price);
        const originalPrice = p.originalPrice ? Math.round(p.originalPrice) : null;
        const discount = originalPrice && originalPrice > price ? ` (Original: ৳${originalPrice})` : '';
        const stock = p.inStock ? 'In Stock' : 'Out of Stock';
        return `${idx + 1}. **[${p.name}](${directUrl})** — ৳${price} BDT${discount} [${stock}]
   - Category: ${p.categoryLabel || p.category}
   - Tagline: ${p.tagline || 'Boutique South Asian luxury piece'}`;
      })
      .join('\n\n');

    return `# Adorous Fashion — Complete Shop Catalogue

> Browse all handcrafted Pakistani & South Asian luxury jewelry suites, velvet churi (bangles), ladies' satchels, and artisanal accessories. Nationwide Cash on Delivery (COD) across all 64 districts in Bangladesh with personal WhatsApp confirmation.

## Trust & Fulfillment
- **Nationwide Cash on Delivery**: Available across all 64 districts in Bangladesh.
- **Fast Dispatch**: Dhaka Metro: 1–2 days (৳80 fee); Outside Dhaka: 2–4 days (৳130 fee).
- **7-Day Exchange**: Hassle-free size and style exchange for complete peace of mind.
- **WhatsApp Support**: [+8801577731381](https://wa.me/8801577731381)

## Available Products (${PRODUCTS.length} Items)

${productList}

---
- [Official Pricing Table](${BASE_URL}/pricing)
- [Bangle Size & Fit Guide](${BASE_URL}/size-fit)
- [Delivery & Payment Details](${BASE_URL}/delivery-payment)
`;
  }

  // 3. Pricing Page
  if (cleanPath === '/pricing') {
    const rows = PRODUCTS.filter((p) => !p.isHidden)
      .map((p) => {
        const price = Math.round(p.price);
        const originalPrice = p.originalPrice ? Math.round(p.originalPrice) : null;
        const discount = originalPrice && originalPrice > price ? `৳${originalPrice}` : '—';
        const stock = p.inStock ? 'In Stock' : 'Sold Out';
        const link = `[${p.name}](${BASE_URL}/${p.category}/${p.slug})`;
        return `| ${link} | ${p.categoryLabel || p.category} | **৳${price}** | ${discount} | ${stock} |`;
      })
      .join('\n');

    return `# Official Pricing & Product Catalogue — Adorous Fashion Dhaka

> Complete itemized price list in Bangladeshi Taka (৳ BDT) across all handcrafted jewelry sets, velvet churi bangles, and ladies' satchels. Cash on Delivery (COD) across Bangladesh.

## Pricing Table

| Product Name | Collection | Current Price (BDT) | Original Price | Status |
|---|---|---|---|---|
${rows}

## Delivery Charges & Transit Times
- **Dhaka Metro**: ৳80 flat delivery fee · 1–2 business days.
- **Outside Dhaka (63 Districts)**: ৳130 flat delivery fee · 2–4 business days.
- **Payment Method**: Cash on Delivery (COD) with zero mandatory advance payment.

---
- [Browse Shop](${BASE_URL}/shop)
- [Delivery & Payment Policy](${BASE_URL}/delivery-payment)
- [Contact Support via WhatsApp](${BASE_URL}/contact)
`;
  }

  // 4. Delivery & Payment Information
  if (cleanPath === '/delivery-payment') {
    return `# Delivery & Cash on Delivery (COD) Information — Adorous Fashion

> Reliable door-to-door courier service across all 64 districts of Bangladesh with zero advance payment Cash on Delivery.

## Delivery Coverage & Fees
- **Dhaka Metro & Greater Dhaka**:
  - Delivery Fee: **৳80 Flat Rate**
  - Timeline: **24–48 hours (1–2 business days)**
  - Courier Partners: Steadfast Express, Paperfly, RedX, Pathao
- **Outside Dhaka (All 63 Districts)**:
  - Delivery Fee: **৳130 Flat Rate**
  - Timeline: **48–72 hours (2–4 business days)**
  - Coverage: All upazilas, zilas, and regional hubs

## Cash on Delivery (COD) Terms
- **Zero Advance Payment**: You pay in cash when the courier hands the parcel to your doorstep.
- **WhatsApp Order Verification**: Every order receives a personal WhatsApp confirmation from the atelier team (+8801577731381) before parcel dispatch.
- **Inspection**: You may inspect the outer luxury packaging upon courier handover.

## Contact Support
- **WhatsApp**: [+8801577731381](https://wa.me/8801577731381)
- **Direct Phone**: [+8801577731381](tel:+8801577731381)
- **Email**: [support@adorousfashion.store](mailto:support@adorousfashion.store)
`;
  }

  // 5. Returns & Exchange Policy
  if (cleanPath === '/returns-exchange') {
    return `# 7-Day Doorstep Exchange Policy — Adorous Fashion

> Hassle-free 7-day doorstep size and style exchange policy across Bangladesh. Guaranteed fit on all Churi bangles, jewelry, and luxury bags.

## Core Policy Pillars
1. **7-Day Exchange Window**: Notify our team within 7 calendar days of courier delivery to initiate an exchange.
2. **Doorstep Exchange**: The courier delivers the replacement item directly to your door and collects the original parcel simultaneously.
3. **Condition**: Items must remain in their original unworn condition with tags and luxury keepsake packaging intact.
4. **Exchange Hotline**: Message our dedicated team on WhatsApp at [+8801577731381](https://wa.me/8801577731381) with your order ID.

## Exchange Process
1. Contact us on WhatsApp with your Order ID and preferred replacement size/color.
2. Our atelier packs your replacement piece.
3. Courier arrives at your doorstep: you receive the new piece and hand back the original.
`;
  }

  // 6. Size & Fit Guide
  if (cleanPath === '/size-fit') {
    return `# Churi (Bangle) & Jewelry Sizing Guide — Adorous Fashion

> Traditional South Asian bangle sizing is measured at the hand knuckles circumference, NOT the wrist, because rigid bangles must slip over the widest part of the hand.

## Churi Sizing Chart

| Size (BD / Indian) | Inner Diameter | Hand Knuckle Circumference | Fit Profile |
|---|---|---|---|
| **2-4** | 2.25" (5.7 cm) | 7.0" – 7.5" (17.8 – 19.0 cm) | Petite / Slender Hand |
| **2-6** | 2.375" (6.0 cm) | 7.5" – 8.0" (19.0 – 20.3 cm) | Standard Bangladeshi Hand (~70% of patrons) |
| **2-8** | 2.50" (6.4 cm) | 8.0" – 8.5" (20.3 – 21.6 cm) | Comfort / Wider Knuckles |

## How to Measure Hand Circumference
1. Bring thumb and pinky finger together as if sliding a bangle on.
2. Wrap a soft measuring tape tightly around the widest point across your knuckles.
3. Note the circumference: 7.0"–7.5" corresponds to 2-4; 7.5"–8.0" corresponds to 2-6; 8.0"–8.5" corresponds to 2-8.

## Fit Assistance
Unsure of your size? Message us on WhatsApp: [+8801577731381](https://wa.me/8801577731381).
`;
  }

  // 7. About Atelier
  if (cleanPath === '/about') {
    return `# About Adorous Fashion — Heritage Atelier & Craftsmanship

> Adorous Fashion (https://adorousfashion.store) is a premier South Asian boutique studio based in Bangladesh curating handcrafted 5-piece bridal suites, heritage crystal sets, hand-wrapped velvet & silk thread churi (bangles), and architectural satchels.

## Our Design Ethos & Strict Still-Life Policy
- **Zero Human Models**: Adorous Fashion adheres to a strict non-model philosophy. All visual assets are photographed exclusively using architectural limestone and sandstone plinths, velvet neckforms, and velvet keepsake trays.
- **Craftsmanship First**: Every jewelry suite is inspected for stone setting symmetry, prong integrity, and metal finish.
- **Nationwide Dispatch**: Operating from our atelier in Rajshahi, Bangladesh, with daily fulfillment to all 64 districts.
`;
  }

  // 8. FAQ
  if (cleanPath === '/faq') {
    return `# Frequently Asked Questions — Adorous Fashion

### How do I place an order?
You can order directly through our website by selecting your items, clicking **Order Now**, and providing your delivery address. No advance card payment is required.

### What are the delivery charges and delivery times?
- **Dhaka Metro**: ৳80 flat delivery fee · 1–2 business days.
- **Outside Dhaka (63 Districts)**: ৳130 flat delivery fee · 2–4 business days.

### Is Cash on Delivery available?
Yes, 100% Cash on Delivery (COD) is supported across all 64 districts in Bangladesh.

### Can I exchange an item if the size does not fit?
Yes, we offer a 7-day hassle-free doorstep exchange policy across Bangladesh. Contact WhatsApp +8801577731381 to arrange.

### How do I determine my bangle size?
Refer to our [Size & Fit Guide](${BASE_URL}/size-fit). Most patrons (70%) wear size 2-6 (6.0 cm diameter).
`;
  }

  // 9. Contact
  if (cleanPath === '/contact') {
    return `# Contact Adorous Fashion Studio

- **WhatsApp Support**: [+8801577731381](https://wa.me/8801577731381)
- **Direct Phone**: [+8801577731381](tel:+8801577731381)
- **Email**: [support@adorousfashion.store](mailto:support@adorousfashion.store)
- **Studio Address**: Adorous Fashion Atelier, Rajshahi, Bangladesh
- **Operating Hours**: Saturday – Thursday: 10:00 AM – 10:00 PM BST; Friday: 2:00 PM – 10:00 PM BST
`;
  }

  // 10. Category landing pages (e.g. /jewelry, /bags, /churi, /earrings, /more)
  const categorySlug = cleanPath.replace(/^\//, '');
  const matchedCategory = CATEGORIES.find((c) => c.slug.toLowerCase() === categorySlug);
  if (matchedCategory) {
    const categoryProducts = PRODUCTS.filter((p) => p.category.toLowerCase() === categorySlug && !p.isHidden)
      .map((p, idx) => {
        const directUrl = `${BASE_URL}/${p.category}/${p.slug}`;
        const price = Math.round(p.price);
        const stock = p.inStock ? 'In Stock' : 'Sold Out';
        return `${idx + 1}. **[${p.name}](${directUrl})** — ৳${price} BDT [${stock}]
   - ${p.description || p.tagline || 'Handcrafted South Asian piece'}`;
      })
      .join('\n\n');

    return `# ${matchedCategory.name} — Adorous Fashion

> ${matchedCategory.blurb} Nationwide Cash on Delivery (COD) across all 64 districts of Bangladesh.

## Available ${matchedCategory.name}

${categoryProducts || 'No products currently active in this collection.'}

---
- [Browse Full Catalogue](${BASE_URL}/shop)
- [Official Pricing Table](${BASE_URL}/pricing)
- [Contact Atelier on WhatsApp](${BASE_URL}/contact)
`;
  }

  return null;
}
