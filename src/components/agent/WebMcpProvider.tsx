'use client';

import React, { useEffect } from 'react';

export default function WebMcpProvider() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const tools = [
      {
        name: 'search_products',
        description: 'Search Adorous Fashion catalogue for jewelry suites, bags, churi bangles, and earrings.',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search keywords, style, or color' },
            category: {
              type: 'string',
              enum: ['all', 'jewelry', 'bags', 'churi', 'earrings', 'more'],
              description: 'Filter by category',
            },
            maxPrice: { type: 'number', description: 'Maximum price limit in BDT (৳)' },
          },
        },
        execute: async (args: { query?: string; category?: string; maxPrice?: number } = {}) => {
          const params = new URLSearchParams();
          if (args.query) params.set('q', args.query);
          if (args.category && args.category !== 'all') params.set('category', args.category);
          const res = await fetch(`/api/products?${params.toString()}`);
          const data = await res.json();
          let products = data.products || [];
          if (args.maxPrice) {
            products = products.filter((p: any) => p.price <= (args.maxPrice || Infinity));
          }
          return {
            count: products.length,
            products: products.slice(0, 10).map((p: any) => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              category: p.category,
              price: p.price,
              inStock: p.inStock,
              url: `https://adorousfashion.store/${p.category}/${p.slug}`,
            })),
          };
        },
      },
      {
        name: 'get_product_details',
        description: 'Retrieve full specifications, colorways, in-stock status, and pricing for a product slug.',
        inputSchema: {
          type: 'object',
          properties: {
            slug: { type: 'string', description: 'Product slug identifier' },
          },
          required: ['slug'],
        },
        execute: async (args: { slug: string }) => {
          const res = await fetch('/api/products');
          const data = await res.json();
          const product = (data.products || []).find((p: any) => p.slug === args.slug);
          if (!product) return { error: `Product '${args.slug}' not found` };
          return {
            name: product.name,
            slug: product.slug,
            category: product.category,
            price: product.price,
            tagline: product.tagline,
            description: product.description,
            inStock: product.inStock,
            colorways: product.colorways,
            sizes: product.sizes,
            url: `https://adorousfashion.store/${product.category}/${product.slug}`,
          };
        },
      },
      {
        name: 'calculate_delivery',
        description: 'Calculate Cash on Delivery (COD) shipping fees, delivery duration, and courier terms for any district in Bangladesh.',
        inputSchema: {
          type: 'object',
          properties: {
            district: { type: 'string', description: 'Destination district within Bangladesh' },
          },
          required: ['district'],
        },
        execute: async (args: { district: string }) => {
          const isDhaka = (args.district || '').toLowerCase().includes('dhaka');
          return {
            destination: args.district,
            region: isDhaka ? 'Inside Dhaka Metro' : 'Outside Dhaka (Nationwide)',
            shippingFee: isDhaka ? 80 : 130,
            currency: 'BDT',
            estimatedDays: isDhaka ? '1–2 days' : '2–4 days',
            paymentMethod: 'Cash on Delivery (Pay on Hand)',
            orderVerification: 'Mandatory personal WhatsApp confirmation before dispatch',
          };
        },
      },
      {
        name: 'get_studio_contact',
        description: 'Retrieve official Adorous Fashion studio WhatsApp, direct phone, email, and location.',
        inputSchema: { type: 'object', properties: {} },
        execute: async () => ({
          brand: 'Adorous Fashion',
          phone: '+8801577731381',
          telLink: 'tel:+8801577731381',
          whatsapp: 'https://wa.me/8801577731381',
          email: 'support@adorousfashion.store',
          studioLocation: 'Rajshahi, Bangladesh',
          deliveryScope: 'All 64 districts in Bangladesh',
          hours: '10:00 AM - 10:00 PM BST',
        }),
      },
    ];

    // Imperative WebMCP Registration
    const nav = window.navigator as any;
    if (nav) {
      if (!nav.modelContext) {
        const toolsMap = new Map();
        nav.modelContext = {
          _tools: toolsMap,
          registerTool(tool: any) {
            toolsMap.set(tool.name, tool);
            return true;
          },
          getTools() {
            return Array.from(toolsMap.values());
          },
        };
      }

      if (typeof nav.modelContext?.registerTool === 'function') {
        tools.forEach((tool) => {
          try {
            nav.modelContext.registerTool(tool);
          } catch (err) {
            console.warn('[WebMCP] registerTool error:', tool.name, err);
          }
        });
      }
    }

    // Expose on window for in-browser inspection & test harnesses
    (window as any).__WEB_MCP_TOOLS__ = tools;
    if (!(window as any).modelContext && nav?.modelContext) {
      (window as any).modelContext = nav.modelContext;
    }

    window.dispatchEvent(new CustomEvent('webmcp:ready', { detail: { tools } }));
  }, []);

  return (
    <>
      {/* Declarative WebMCP annotations for in-browser agents inspecting DOM forms */}
      <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
        <form
          id="webmcp-search-form"
          {...({
            toolname: "search_products",
            tooldescription: "Search Adorous Fashion catalog for jewelry suites, bags, churi bangles, and earrings",
          } as any)}
          action="/shop"
          method="GET"
        >
          <input type="text" name="q" placeholder="Search keywords..." />
          <select name="category">
            <option value="">All Categories</option>
            <option value="jewelry">Jewelry Sets</option>
            <option value="bags">Ladies' Bags</option>
            <option value="churi">Churi (Bangles)</option>
            <option value="earrings">Earrings</option>
            <option value="more">More</option>
          </select>
          <button type="submit">Search</button>
        </form>

        <form
          id="webmcp-delivery-form"
          {...({
            toolname: "calculate_delivery",
            tooldescription: "Calculate Cash on Delivery shipping fees and timelines across Bangladesh",
          } as any)}
          action="/delivery-payment"
          method="GET"
        >
          <input type="text" name="district" placeholder="District name" defaultValue="Dhaka" />
          <button type="submit">Calculate</button>
        </form>

        <form
          id="webmcp-contact-form"
          {...({
            toolname: "get_studio_contact",
            tooldescription: "Retrieve Adorous Fashion phone, WhatsApp, and studio contact",
          } as any)}
          action="/contact"
          method="GET"
        >
          <input type="tel" name="phone" defaultValue="+8801577731381" />
          <input type="email" name="email" defaultValue="support@adorousfashion.store" />
          <button type="submit">Contact</button>
        </form>
      </div>
    </>
  );
}
