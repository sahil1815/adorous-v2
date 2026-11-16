# Framework-Specific Implementation Recipes

Implementation details for agent-readiness features vary by web framework. This reference provides concrete code patterns for the major frontend and full-stack stacks.

---

## 1. Next.js (App Router)

### A. Middleware / Proxy for Markdown Negotiation & Link Headers
In Next.js 14, 15, and 16, intercept agent requests at `src/proxy.ts` (or `middleware.ts`):

```typescript
// src/proxy.ts or middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const acceptHeader = req.headers.get('accept') || '';

  // 1. Content Negotiation: Serve Markdown when requested
  if (acceptHeader.includes('text/markdown') && url.pathname === '/') {
    const markdownContent = `# Acme Storefront\n\nCurated luxury accessories.\n\n- [Pricing](/pricing): Full catalogue in USD.\n- [Catalogue](/shop): All collections.`;
    return new NextResponse(markdownContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Vary': 'Accept',
        'Link': '</llms.txt>; rel="describedby"; type="text/plain", </>; rel="alternate"; type="text/markdown"',
      },
    });
  }

  // 2. Default HTML responses: Attach RFC 8288 Link headers
  const response = NextResponse.next();
  response.headers.set(
    'Link',
    '</llms.txt>; rel="describedby"; type="text/plain", </>; rel="alternate"; type="text/markdown"'
  );
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};
```

### B. Accurate 404 Status Handling (Avoid Soft 404s with Suspense)
If dynamic pages render `<Suspense>`, Next.js streams headers immediately. If a route cannot be found, validate route existence synchronously or in middleware to guarantee a true `404` status code:

```typescript
// src/app/[category]/page.tsx
import { notFound } from 'next/navigation';
import { VALID_CATEGORIES } from '@/data/categories';

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const isValid = VALID_CATEGORIES.some((c) => c.slug === category);

  if (!isValid) {
    notFound(); // Triggers not-found.tsx with HTTP 404 before body flush
  }

  return <div>Category: {category}</div>;
}
```

### C. Server-Side Rendering Hydration Pitfall
Avoid client hydration guards in global providers that return `null` during SSR:
```typescript
// BAD: Erases SSR HTML, returning an empty DOM to crawlers
export function BadProvider({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null; // ❌ KILLS SSR FOR AGENTS
  return <>{children}</>;
}

// GOOD: Always render children on the server
export function GoodProvider({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return <>{children}</>; // ✅ Full HTML rendered on server
}
```

---

## 2. Astro

Astro's static-first architecture is naturally agent-friendly.

### A. Serving Markdown via Dynamic Endpoints (`src/pages/index.md.ts`)
```typescript
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const md = `# Acme Brand\n\nHigh-end handcrafted products.\n\n- [Shop](/shop): Full catalogue\n- [Pricing](/pricing): Itemized prices`;
  return new Response(md, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Vary': 'Accept',
      'Link': '</llms.txt>; rel="describedby"; type="text/plain"',
    },
  });
};
```

### B. Static Files
Place `llms.txt`, `robots.txt`, and `.well-known/mcp/server-card.json` in the `public/` directory.

---

## 3. Nuxt 3 / Vue

### A. Nitro Server Middleware for Headers & Content Negotiation
```typescript
// server/middleware/agent-negotiation.ts
import { defineEventHandler, getRequestHeader, setResponseHeaders } from 'h3';

export default defineEventHandler((event) => {
  const accept = getRequestHeader(event, 'accept') || '';
  
  setResponseHeaders(event, {
    'Link': '</llms.txt>; rel="describedby"; type="text/plain", </>; rel="alternate"; type="text/markdown"',
  });

  if (accept.includes('text/markdown') && event.node.req.url === '/') {
    event.node.res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    return `# Nuxt Storefront\n\nArtisanal products.\n\n- [Pricing](/pricing)`;
  }
});
```

---

## 4. Single Page Applications (Vite / CRA)

In pure client-side SPAs, web crawlers receive an empty `<div id="root"></div>`.
To make an SPA agent-ready:
1. **Pre-rendering**: Use Vite plugins (`vite-plugin-prerender` or SSG) to generate static HTML for key routes (`/`, `/about`, `/contact`, `/pricing`).
2. **Server Reverse Proxy (Nginx / Cloudflare Worker)**: Intercept `/llms.txt`, `robots.txt`, and `Accept: text/markdown` at the edge to return server-side text without booting the SPA bundle.
3. **Avoid Soft 404s**: Configure the server (e.g. Nginx `try_files`) to return a genuine `404` status for invalid API or asset routes rather than falling back to `index.html` with status `200`.
