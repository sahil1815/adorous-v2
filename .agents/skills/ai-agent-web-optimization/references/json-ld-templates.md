# JSON-LD Structured Data Templates for Agent-Ready Websites

AI agents and search crawlers parse JSON-LD (`<script type="application/ld+json">`) directly into structured knowledge graphs. This document provides production-ready, validated schema templates.

---

## 1. Multi-Entity Unified Graph (`@graph`)

Consolidating all schemas into a single `@graph` array ensures agents understand the interrelationships between your business, website, pages, and products without duplicate identifiers.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://example.com/#organization",
      "name": "Acme Brand",
      "legalName": "Acme Commerce Ltd.",
      "url": "https://example.com",
      "logo": "https://example.com/images/logo.png",
      "description": "Artisanal high-end lifestyle accessories and heirloom handcrafted goods.",
      "email": "support@example.com",
      "telephone": "+1234567890",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "123 Atelier Way",
        "addressLocality": "Metropolis",
        "addressRegion": "NY",
        "postalCode": "10001",
        "addressCountry": "US"
      },
      "sameAs": [
        "https://www.facebook.com/acmebrand",
        "https://www.instagram.com/acmebrand",
        "https://www.linkedin.com/company/acmebrand",
        "https://twitter.com/acmebrand"
      ],
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "telephone": "+1234567890",
          "contactType": "customer service",
          "email": "support@example.com",
          "availableLanguage": ["English", "Bengali"],
          "areaServed": "US"
        }
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://example.com/#website",
      "url": "https://example.com",
      "name": "Acme Brand",
      "description": "Curated artisanal accessories and handcrafted suites.",
      "publisher": {
        "@id": "https://example.com/#organization"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://example.com/shop?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "WebPage",
      "@id": "https://example.com/#webpage",
      "url": "https://example.com",
      "name": "Acme Brand | Handcrafted Artisanal Suites",
      "isPartOf": {
        "@id": "https://example.com/#website"
      },
      "about": {
        "@id": "https://example.com/#organization"
      },
      "breadcrumb": {
        "@id": "https://example.com/#breadcrumb"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://example.com/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://example.com"
        }
      ]
    }
  ]
}
</script>
```

---

## 2. Product & Offer Schema (Zero-JS Pricing Discovery)

Agents reading your website to compare prices or make purchasing decisions require complete `Offer` nodes:

```json
{
  "@type": "Product",
  "@id": "https://example.com/jewelry/heritage-lotus-necklace#product",
  "name": "Heritage Lotus Filigree Necklace",
  "description": "Handcrafted 22k gold-plated filigree pendant suspended on delicate seed pearls.",
  "image": "https://example.com/images/products/heritage-lotus.jpg",
  "url": "https://example.com/jewelry/heritage-lotus-necklace",
  "sku": "ACME-LOTUS-001",
  "brand": {
    "@type": "Brand",
    "name": "Acme Brand"
  },
  "category": "Necklaces",
  "offers": {
    "@type": "Offer",
    "@id": "https://example.com/jewelry/heritage-lotus-necklace#offer",
    "price": 249,
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition",
    "priceValidUntil": "2027-12-31",
    "url": "https://example.com/jewelry/heritage-lotus-necklace",
    "seller": {
      "@id": "https://example.com/#organization"
    },
    "shippingDetails": {
      "@type": "OfferShippingDetails",
      "shippingRate": {
        "@type": "MonetaryAmount",
        "value": 15,
        "currency": "USD"
      },
      "shippingDestination": {
        "@type": "DefinedRegion",
        "addressCountry": "US"
      },
      "deliveryTime": {
        "@type": "ShippingDeliveryTime",
        "handlingTime": {
          "@type": "QuantitativeValue",
          "minValue": 0,
          "maxValue": 1,
          "unitCode": "DAY"
        },
        "transitTime": {
          "@type": "QuantitativeValue",
          "minValue": 2,
          "maxValue": 5,
          "unitCode": "DAY"
        }
      }
    }
  }
}
```

---

## 3. ItemList Schema (Category and Bestseller Listings)

Use `ItemList` to help agents index curated collections, bestseller rankings, or catalogue pages in a structured order:

```json
{
  "@type": "ItemList",
  "@id": "https://example.com/shop#featured-products",
  "name": "Featured Products & Official Pricing",
  "numberOfItems": 2,
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Heritage Lotus Necklace",
      "url": "https://example.com/jewelry/heritage-lotus-necklace",
      "item": {
        "@type": "Product",
        "name": "Heritage Lotus Necklace",
        "url": "https://example.com/jewelry/heritage-lotus-necklace",
        "image": "https://example.com/images/lotus.jpg",
        "offers": {
          "@type": "Offer",
          "price": 249,
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Peacock Bell Jhumkas",
      "url": "https://example.com/earrings/peacock-bell-jhumkas",
      "item": {
        "@type": "Product",
        "name": "Peacock Bell Jhumkas",
        "url": "https://example.com/earrings/peacock-bell-jhumkas",
        "image": "https://example.com/images/peacock.jpg",
        "offers": {
          "@type": "Offer",
          "price": 149,
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        }
      }
    }
  ]
}
```

---

## 4. FAQPage Schema

Agents handling customer inquiries look for `FAQPage` nodes to extract direct, factual answers for return policies, shipping times, and materials:

```json
{
  "@type": "FAQPage",
  "@id": "https://example.com/faq#faq",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is your return and exchange policy?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We offer a 7-day hassle-free exchange policy on unworn items with original seals intact."
      }
    },
    {
      "@type": "Question",
      "name": "How long does domestic delivery take?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Standard delivery takes 1 to 3 business days within metropolitan areas and 3 to 5 business days nationwide."
      }
    }
  ]
}
```

---

## Validation Checklist
- [ ] No syntax errors or trailing commas (`JSON.parse` must pass cleanly).
- [ ] Prices are numbers or clean decimal strings without currency symbols in the `price` field (`249`, not `"$249"`).
- [ ] Currency follows ISO 4217 code (`USD`, `BDT`, `EUR`, `GBP`).
- [ ] All URLs are absolute (`https://...`).
- [ ] `sameAs` links point to live, authenticated profiles.
