# The `llms.txt` and `llms-full.txt` Standard Specification

The `/llms.txt` specification creates a clean, lightweight, machine-readable index of your website tailored specifically for Large Language Model (LLM) agents, developer tools, and search crawlers.

---

## 1. File Location & HTTP Response Headers

- **Primary Path**: `https://<domain>/llms.txt`
- **Extended Full Documentation**: `https://<domain>/llms-full.txt` (Optional, for deep technical or product documentation)
- **MIME Type**: `Content-Type: text/plain; charset=utf-8`
- **Cache Header**: `Cache-Control: public, max-age=86400, stale-while-revalidate=604800`

> [!WARNING]
> Returning `text/html` (e.g. from an SPA catch-all route or 404 handler) causes agent parsers to fail. The route must strictly return plain text.

---

## 2. Document Structure Rules

A well-formed `llms.txt` MUST adhere to the following sequence:

1. **Title (Level 1 Heading)**: Exactly one `# <Site Name>` on the first line.
2. **Blockquote Summary**: A `> <Brief overview>` immediately following the title, summarizing the business, purpose, or service in 1–3 concise sentences.
3. **Sections (Level 2 Headings)**: Logical groupings using `## <Section Name>`.
   - Examples: `## Core Services`, `## Product Catalogue & Pricing`, `## Developer API`, `## Policies & Support`.
4. **Markdown Link Items**: Unordered list items with standard markdown syntax:
   `- [Link Title](https://domain.com/absolute-path): Crisp description of what this page contains.`
5. **Optional Subsection**: `## Optional` for secondary or verbose references that agents can ignore when saving context window tokens.

---

## 3. Production Template for E-Commerce / Business

```markdown
# Acme Fashion Atelier

> Acme Fashion Atelier is a luxury South Asian bespoke accessory studio crafting heirloom jewellery, filigree choker suites, bridal jhumkas, and velvet keepsakes.

## Core Collections & Discovery
- [Necklaces & Choker Sets](https://example.com/necklaces): Heritage bridal choker suites, filigree collars, and multi-strand pearl rani haars.
- [Earrings & Jhumkas](https://example.com/earrings): Handcrafted bell jhumkas, floral ear studs, and lightweight chandelier drops.
- [Full Product Catalogue](https://example.com/shop): Comprehensive searchable catalogue with live inventory and filter controls.
- [Official Pricing & Catalogue](https://example.com/pricing): Complete itemized price list in USD with stock status and direct purchasing links.

## Customer Support & Operations
- [About the Atelier](https://example.com/about): Brand history, artisan craftsmanship ethics, and studio materials.
- [Delivery & Logistics](https://example.com/delivery-payment): Domestic shipping timelines (1–3 business days), flat-rate fees, and payment methods.
- [Returns & Exchanges](https://example.com/returns-exchange): 7-day hassle-free exchange policy on unworn items with original seals.
- [Terms & Conditions](https://example.com/terms): Official purchasing agreement, buyer protections, and legal terms.
- [Privacy Policy](https://example.com/privacy): Data handling practices, customer protections, and compliance disclosures.
- [Contact Customer Care](https://example.com/contact): Direct WhatsApp concierge (+1234567890) and support email (support@example.com).

## Machine-Readable Agent Resources
- [MCP Server Card](https://example.com/.well-known/mcp/server-card.json): SEP-1649 MCP Server Card describing available tools and endpoints.
- [JSON-LD Knowledge Graph](https://example.com/): Machine-readable Organization, Product, and Offer schema on the homepage.
- [XML Sitemap](https://example.com/sitemap.xml): Canonical index of all public URLs.
```

---

## 4. Serving in Different Frameworks

### Next.js App Router (`src/app/llms.txt/route.ts`)
```typescript
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static';
export const revalidate = 86400;

export async function GET() {
  const filePath = path.join(process.cwd(), 'public', 'llms.txt');
  const content = fs.readFileSync(filePath, 'utf-8');

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}
```

### Express / Node.js
```javascript
app.get('/llms.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.sendFile(path.join(__dirname, 'public', 'llms.txt'));
});
```

---

## 5. Automated Validation Commands

Verify your deployed or local file with `curl`:

```bash
# 1. Verify 200 OK and Content-Type: text/plain
curl -sI "https://example.com/llms.txt" | grep -Ei "HTTP/|content-type"

# 2. Verify top-level # heading and blockquote summary
curl -s "https://example.com/llms.txt" | head -n 5
```
