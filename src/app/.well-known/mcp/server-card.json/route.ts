import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

const serverCard = {
  $schema: "https://modelcontextprotocol.io/schemas/server-card.json",
  name: "adorous-fashion-mcp-server",
  version: "1.0.0",
  description: "Model Context Protocol server for Adorous Fashion e-commerce catalog, real-time product search, inventory verification, and COD delivery calculations across Bangladesh.",
  homepage: "https://adorousfashion.store",
  endpoint: "https://adorousfashion.store/api/mcp",
  transport: {
    type: "http-jsonrpc",
    url: "https://adorousfashion.store/api/mcp"
  },
  capabilities: {
    tools: {
      listChanged: false
    },
    resources: {
      subscribe: false,
      listChanged: false
    },
    prompts: {
      listChanged: false
    }
  },
  tools: [
    {
      name: "search_products",
      description: "Search the Adorous Fashion product catalogue for jewelry suites, bags, churi bangles, and earrings.",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search term for jewelry, bag styles, colors, or materials"
          },
          category: {
            type: "string",
            enum: ["all", "jewelry", "bags", "churi", "earrings", "more"],
            description: "Category filter"
          },
          maxPrice: {
            type: "number",
            description: "Maximum price limit in Bangladeshi Taka (৳ BDT)"
          }
        }
      }
    },
    {
      name: "get_product_details",
      description: "Retrieve complete specifications, dimensions, colorways, in-stock status, and still-life photography for a product slug.",
      inputSchema: {
        type: "object",
        properties: {
          slug: {
            type: "string",
            description: "Product slug identifier (e.g. 'traditional-filigree-bell-jhumka')"
          }
        },
        required: ["slug"]
      }
    },
    {
      name: "calculate_delivery",
      description: "Calculate Cash on Delivery (COD) shipping fees, delivery duration, and courier terms for any district in Bangladesh.",
      inputSchema: {
        type: "object",
        properties: {
          district: {
            type: "string",
            description: "Destination district within Bangladesh (e.g. 'Dhaka', 'Chittagong', 'Rajshahi')"
          }
        },
        required: ["district"]
      }
    },
    {
      name: "get_studio_contact",
      description: "Retrieve official Adorous Fashion customer care WhatsApp, phone, email, and studio address.",
      inputSchema: {
        type: "object",
        properties: {}
      }
    }
  ],
  contact: {
    name: "Adorous Fashion Concierge",
    email: "support@adorousfashion.store",
    telephone: "+8801577731381",
    whatsapp: "https://wa.me/8801577731381"
  }
};

export function GET() {
  return new NextResponse(JSON.stringify(serverCard, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=86400',
    },
  });
}
