# MCP Server Card (SEP-1649) & WebMCP Standard Specification

The Model Context Protocol (MCP) bridges websites with AI agents. This reference details how to publish an MCP Server Card, register in-browser WebMCP tools, and implement a JSON-RPC 2.0 endpoint.

---

## 1. SEP-1649 MCP Server Card (`/.well-known/mcp/server-card.json`)

The SEP-1649 standard defines a discovery manifest served at `/.well-known/mcp/server-card.json`. AI agents inspect this manifest to discover available server tools and transport mechanisms.

### Specification & Payload

- **URL**: `https://<domain>/.well-known/mcp/server-card.json`
- **MIME Type**: `application/json; charset=utf-8`
- **HTTP Status**: `200 OK`

```json
{
  "schema_version": "1.0.0",
  "name": "acme-fashion-mcp-server",
  "version": "1.0.0",
  "description": "Official MCP server for Acme Brand. Exposes catalogue discovery, order tracking, and product lookup tools to autonomous agents.",
  "endpoint": "https://example.com/api/mcp",
  "transport": "http",
  "capabilities": {
    "tools": {
      "listChanged": false
    },
    "resources": {},
    "prompts": {}
  },
  "tools": [
    {
      "name": "search_products",
      "description": "Search the product catalogue by keyword, category, or price range.",
      "inputSchema": {
        "type": "object",
        "properties": {
          "query": {
            "type": "string",
            "description": "Search term, product name, or category"
          },
          "maxPrice": {
            "type": "number",
            "description": "Optional upper price filter in USD"
          }
        },
        "required": ["query"]
      }
    },
    {
      "name": "get_product_details",
      "description": "Fetch complete specifications, real-time stock availability, and pricing for a specific product ID or slug.",
      "inputSchema": {
        "type": "object",
        "properties": {
          "slug": {
            "type": "string",
            "description": "Product URL slug or unique SKU"
          }
        },
        "required": ["slug"]
      }
    },
    {
      "name": "track_order",
      "description": "Retrieve current fulfillment and shipping status for a confirmed order ID.",
      "inputSchema": {
        "type": "object",
        "properties": {
          "orderId": {
            "type": "string",
            "description": "Unique customer order reference identifier"
          }
        },
        "required": ["orderId"]
      }
    }
  ]
}
```

---

## 2. In-Browser WebMCP Tool Registration

WebMCP enables in-browser AI assistants (such as Chrome's built-in Gemini Nano or agent extensions) to interact directly with page capabilities without fragile DOM element scraping.

### Approach A: Imperative API (`navigator.modelContext.registerTool`)

Execute during client mounting (e.g. in a React `useEffect` or DOMContentLoaded listener):

```typescript
'use client';

import { useEffect } from 'react';

export function WebMcpProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const nav = window.navigator as any;
    if (nav.modelContext && typeof nav.modelContext.registerTool === 'function') {
      try {
        // Tool 1: Product Search
        nav.modelContext.registerTool({
          name: 'search_catalogue',
          description: 'Search available products by query or category',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Search term or category' },
            },
            required: ['query'],
          },
          execute: async ({ query }: { query: string }) => {
            const res = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
            const data = await res.json();
            return {
              results: (data.products || []).slice(0, 5).map((p: any) => ({
                name: p.name,
                price: p.price,
                url: `https://example.com/${p.category}/${p.slug}`,
                inStock: p.inStock,
              })),
            };
          },
        });

        // Tool 2: Order Tracking
        nav.modelContext.registerTool({
          name: 'track_order',
          description: 'Look up shipping status of an order',
          inputSchema: {
            type: 'object',
            properties: {
              orderId: { type: 'string', description: 'Order tracking ID' },
            },
            required: ['orderId'],
          },
          execute: async ({ orderId }: { orderId: string }) => {
            const res = await fetch(`/api/orders/track?id=${encodeURIComponent(orderId)}`);
            return await res.json();
          },
        });
      } catch (err) {
        console.warn('WebMCP registration error:', err);
      }
    }
  }, []);

  return <>{children}</>;
}
```

### Approach B: Declarative DOM Form Annotations

Annotate HTML forms so in-browser agents can detect and trigger actions directly through semantic DOM attributes:

```html
<form
  action="/shop"
  method="GET"
  toolname="search_catalogue"
  tooldescription="Search products by title, design, or collection category"
>
  <input
    type="search"
    name="q"
    placeholder="Search products..."
    aria-label="Search catalogue"
    required
  />
  <button type="submit">Search</button>
</form>
```

---

## 3. JSON-RPC 2.0 MCP Endpoint (`/api/mcp`)

The accompanying server route handles requests conforming to the JSON-RPC 2.0 specification:

```typescript
// src/app/api/mcp/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jsonrpc, id, method, params } = body;

    if (jsonrpc !== '2.0') {
      return NextResponse.json(
        { jsonrpc: '2.0', id: id ?? null, error: { code: -32600, message: 'Invalid Request' } },
        { status: 400 }
      );
    }

    // 1. Initialize
    if (method === 'initialize') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: { name: 'acme-mcp-server', version: '1.0.0' },
        },
      });
    }

    // 2. Tools List
    if (method === 'tools/list') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          tools: [
            {
              name: 'search_products',
              description: 'Search catalogue products',
              inputSchema: {
                type: 'object',
                properties: { query: { type: 'string' } },
                required: ['query'],
              },
            },
          ],
        },
      });
    }

    // 3. Tools Call
    if (method === 'tools/call') {
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};

      if (toolName === 'search_products') {
        const query = String(toolArgs.query || '').toLowerCase();
        // Return structured content items
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ message: `Results for ${query}`, items: [] }),
              },
            ],
          },
        });
      }

      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Tool not found: ${toolName}` },
      });
    }

    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: `Method not found: ${method}` },
    });
  } catch (err: any) {
    return NextResponse.json(
      { jsonrpc: '2.0', id: null, error: { code: -32603, message: 'Internal error' } },
      { status: 500 }
    );
  }
}
```
