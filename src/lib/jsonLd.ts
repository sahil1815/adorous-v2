import { PRODUCTS, CATEGORIES } from '@/data/catalogue';

const featuredProducts = PRODUCTS.filter((p) => !p.isHidden).slice(0, 8);

const productSchemaNodes = featuredProducts.map((p) => ({
  '@type': 'Product',
  '@id': `https://adorousfashion.store/${p.category}/${p.slug}#product`,
  name: p.name,
  description: p.description || p.tagline || `${p.name} - Curated luxury boutique South Asian accessory suite.`,
  image: p.featuredImage.startsWith('http')
    ? p.featuredImage
    : `https://adorousfashion.store${p.featuredImage}`,
  url: `https://adorousfashion.store/${p.category}/${p.slug}`,
  sku: p.id,
  brand: {
    '@type': 'Brand',
    name: 'Adorous Fashion',
  },
  category: p.categoryLabel || p.category,
  offers: {
    '@type': 'Offer',
    '@id': `https://adorousfashion.store/${p.category}/${p.slug}#offer`,
    price: Math.round(p.price),
    priceCurrency: 'BDT',
    availability: p.inStock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    itemCondition: 'https://schema.org/NewCondition',
    priceValidUntil: '2027-12-31',
    url: `https://adorousfashion.store/${p.category}/${p.slug}`,
    seller: {
      '@id': 'https://adorousfashion.store/#organization',
    },
    hasMerchantReturnPolicy: {
      '@id': 'https://adorousfashion.store/#organization',
    },
    shippingDetails: {
      '@type': 'OfferShippingDetails',
      shippingRate: {
        '@type': 'MonetaryAmount',
        value: 80,
        currency: 'BDT',
      },
      shippingDestination: {
        '@type': 'DefinedRegion',
        addressCountry: 'BD',
      },
      deliveryTime: {
        '@type': 'ShippingDeliveryTime',
        handlingTime: {
          '@type': 'QuantitativeValue',
          minValue: 0,
          maxValue: 1,
          unitCode: 'DAY',
        },
        transitTime: {
          '@type': 'QuantitativeValue',
          minValue: 1,
          maxValue: 4,
          unitCode: 'DAY',
        },
      },
    },
  },
}));

export const ROOT_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['Organization', 'OnlineStore', 'JewelryStore'],
      '@id': 'https://adorousfashion.store/#organization',
      name: 'Adorous Fashion',
      alternateName: ['Adorous Fashion BD', 'Adorous Fashion Dhaka'],
      url: 'https://adorousfashion.store',
      logo: {
        '@type': 'ImageObject',
        '@id': 'https://adorousfashion.store/#logo',
        url: 'https://adorousfashion.store/images/logo/logo-monogram.png',
        contentUrl: 'https://adorousfashion.store/images/logo/logo-monogram.png',
        caption: 'Adorous Fashion Atelier Monogram',
      },
      image: {
        '@type': 'ImageObject',
        '@id': 'https://adorousfashion.store/#hero-image',
        url: 'https://adorousfashion.store/images/hero/hero-still-life.jpg',
        caption: 'Adorous Fashion Luxury Still Life Jewellery Collection',
      },
      description: 'Curated boutique luxury accessories and jewelry suites in Bangladesh. Handcrafted Pakistani bridal suites, velvet churi bangles, ladies satchel bags, and crystal sets with Cash on Delivery nationwide.',
      telephone: '+8801577731381',
      email: 'support@adorousfashion.store',
      priceRange: '৳৳',
      currenciesAccepted: 'BDT',
      paymentAccepted: ['Cash on Delivery', 'bKash', 'Nagad', 'Visa', 'Mastercard'],
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Rajshahi',
        addressRegion: 'Rajshahi Division',
        addressCountry: 'BD',
      },
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: '+8801577731381',
          contactType: 'customer service',
          email: 'support@adorousfashion.store',
          areaServed: 'BD',
          availableLanguage: ['English', 'Bengali'],
        },
      ],
      sameAs: [
        'https://www.facebook.com/adorousfashion',
        'https://www.instagram.com/adorousfashion',
        'https://wa.me/8801577731381',
        'https://tiktok.com/@adorousfashion',
      ],
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'BD',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://adorousfashion.store/#website',
      url: 'https://adorousfashion.store',
      name: 'Adorous Fashion',
      description: 'Luxury South Asian Jewelry Sets, Velvet Churi, and Ladies Bags',
      publisher: {
        '@id': 'https://adorousfashion.store/#organization',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://adorousfashion.store/shop?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
      inLanguage: 'en-US',
    },
    {
      '@type': 'WebPage',
      '@id': 'https://adorousfashion.store/#webpage',
      url: 'https://adorousfashion.store',
      name: 'Adorous Fashion — Boutique Accessories & Fashion Jewelry | Rajshahi, Bangladesh',
      description: 'Curated premium jewelry sets, velvet churi bangles, luxury bags, and fashion accessories. Cash on Delivery across all 64 districts in Bangladesh.',
      isPartOf: {
        '@id': 'https://adorousfashion.store/#website',
      },
      about: {
        '@id': 'https://adorousfashion.store/#organization',
      },
      inLanguage: 'en-US',
    },
    {
      '@type': 'ItemList',
      '@id': 'https://adorousfashion.store/#featured-collections',
      name: 'Featured Boutique Collections',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Jewelry Sets',
          url: 'https://adorousfashion.store/jewelry',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: "Ladies' Bags",
          url: 'https://adorousfashion.store/bags',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Churi (Bangles)',
          url: 'https://adorousfashion.store/churi',
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'Earrings',
          url: 'https://adorousfashion.store/earrings',
        },
        {
          '@type': 'ListItem',
          position: 5,
          name: 'Curated Lifestyle & More',
          url: 'https://adorousfashion.store/more',
        },
      ],
    },
    {
      '@type': 'ItemList',
      '@id': 'https://adorousfashion.store/#curated-products',
      name: 'Featured Products & Official Pricing',
      numberOfItems: featuredProducts.length,
      itemListElement: featuredProducts.map((p, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: p.name,
        url: `https://adorousfashion.store/${p.category}/${p.slug}`,
        item: {
          '@type': 'Product',
          name: p.name,
          url: `https://adorousfashion.store/${p.category}/${p.slug}`,
          image: p.featuredImage.startsWith('http')
            ? p.featuredImage
            : `https://adorousfashion.store${p.featuredImage}`,
          offers: {
            '@type': 'Offer',
            price: Math.round(p.price),
            priceCurrency: 'BDT',
            availability: p.inStock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',
            priceValidUntil: '2027-12-31',
            url: `https://adorousfashion.store/${p.category}/${p.slug}`,
          },
        },
      })),
    },
    ...productSchemaNodes,
  ],
};
