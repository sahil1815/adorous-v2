import { NextResponse } from 'next/server';
import { PRODUCTS, CATEGORIES } from '@/data/catalogue';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    server: 'adorous-fashion-mcp-server',
    version: '1.0.0',
    capabilities: ['tools'],
    endpoint: 'https://adorousfashion.store/api/mcp',
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jsonrpc, id, method, params } = body;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    };

    if (method === 'initialize') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {
              listChanged: false,
            },
          },
          serverInfo: {
            name: 'adorous-fashion-mcp-server',
            version: '1.0.0',
          },
        },
      }, { headers: corsHeaders });
    }

    if (method === 'ping') {
      return NextResponse.json({ jsonrpc: '2.0', id, result: {} }, { headers: corsHeaders });
    }

    if (method === 'tools/list') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          tools: [
            {
              name: 'search_products',
              description: 'Search the Adorous Fashion product catalogue for jewelry suites, bags, churi bangles, and earrings.',
              inputSchema: {
                type: 'object',
                properties: {
                  query: { type: 'string', description: 'Search term for jewelry, bag styles, colors, or materials' },
                  category: { type: 'string', enum: ['all', 'jewelry', 'bags', 'churi', 'earrings', 'more'], description: 'Category filter' },
                  maxPrice: { type: 'number', description: 'Maximum price limit in Bangladeshi Taka (৳ BDT)' },
                },
              },
            },
            {
              name: 'get_product_details',
              description: 'Retrieve complete specifications, dimensions, colorways, in-stock status, and still-life photography for a product slug.',
              inputSchema: {
                type: 'object',
                properties: {
                  slug: { type: 'string', description: 'Product slug identifier' },
                },
                required: ['slug'],
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
            },
            {
              name: 'get_studio_contact',
              description: 'Retrieve official Adorous Fashion customer care WhatsApp, phone, email, and studio address.',
              inputSchema: { type: 'object', properties: {} },
            },
          ],
        },
      }, { headers: corsHeaders });
    }

    if (method === 'tools/call') {
      const toolName = params?.name;
      const args = params?.arguments || {};

      if (toolName === 'search_products') {
        const query = (args.query || '').toLowerCase();
        const category = args.category;
        const maxPrice = args.maxPrice ? Number(args.maxPrice) : undefined;

        let results = PRODUCTS.filter((p) => !p.isHidden);
        if (category && category !== 'all') {
          results = results.filter((p) => p.category.toLowerCase() === category.toLowerCase());
        }
        if (query) {
          results = results.filter(
            (p) =>
              p.name.toLowerCase().includes(query) ||
              p.tagline.toLowerCase().includes(query) ||
              p.description.toLowerCase().includes(query) ||
              p.categoryLabel.toLowerCase().includes(query)
          );
        }
        if (maxPrice !== undefined) {
          results = results.filter((p) => p.price <= maxPrice);
        }

        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  results.slice(0, 10).map((p) => ({
                    id: p.id,
                    name: p.name,
                    slug: p.slug,
                    category: p.category,
                    price: p.price,
                    inStock: p.inStock,
                    tagline: p.tagline,
                    url: `https://adorousfashion.store/${p.category}/${p.slug}`,
                  })),
                  null,
                  2
                ),
              },
            ],
          },
        }, { headers: corsHeaders });
      }

      if (toolName === 'get_product_details') {
        const p = PRODUCTS.find((prod) => prod.slug === args.slug);
        if (!p) {
          return NextResponse.json({
            jsonrpc: '2.0',
            id,
            error: { code: -32602, message: `Product '${args.slug}' not found` },
          }, { headers: corsHeaders });
        }
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    name: p.name,
                    slug: p.slug,
                    category: p.category,
                    price: p.price,
                    originalPrice: p.originalPrice,
                    inStock: p.inStock,
                    description: p.description,
                    details: p.details,
                    piecesIncluded: p.piecesIncluded,
                    colorways: p.colorways,
                    sizes: p.sizes,
                    url: `https://adorousfashion.store/${p.category}/${p.slug}`,
                  },
                  null,
                  2
                ),
              },
            ],
          },
        }, { headers: corsHeaders });
      }

      if (toolName === 'calculate_delivery') {
        const district = (args.district || '').toLowerCase();
        const isDhaka = district.includes('dhaka');
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    destination: args.district,
                    region: isDhaka ? 'Inside Dhaka Metro' : 'Outside Dhaka (All 64 Districts)',
                    shippingFee: isDhaka ? 80 : 130,
                    currency: 'BDT',
                    deliveryEstimate: isDhaka ? '1–2 business days' : '2–4 business days',
                    paymentMethod: 'Cash on Delivery (Pay on Hand)',
                    verification: 'Required via WhatsApp before parcel dispatch',
                  },
                  null,
                  2
                ),
              },
            ],
          },
        }, { headers: corsHeaders });
      }

      if (toolName === 'get_studio_contact') {
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    brand: 'Adorous Fashion',
                    phone: '+8801577731381',
                    telLink: 'tel:+8801577731381',
                    whatsapp: 'https://wa.me/8801577731381',
                    email: 'support@adorousfashion.store',
                    studioLocation: 'Rajshahi, Bangladesh',
                    serviceCoverage: 'Nationwide (all 64 districts)',
                    operatingHours: '10:00 AM - 10:00 PM BST',
                  },
                  null,
                  2
                ),
              },
            ],
          },
        }, { headers: corsHeaders });
      }
    }

    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: `Method '${method}' not found` },
    }, { headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json({
      jsonrpc: '2.0',
      error: { code: -32700, message: 'Parse error', data: err?.message },
    }, { status: 400 });
  }
}
