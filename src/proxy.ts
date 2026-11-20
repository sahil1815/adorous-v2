import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';
import { HOMEPAGE_MARKDOWN } from '@/lib/homepageMarkdown';
import { getPageMarkdown } from '@/lib/pageMarkdown';
import { NOT_FOUND_HTML } from '@/lib/notFoundHtml';
import { CATEGORIES } from '@/data/catalogue';

// Protect all routes under /admin except /admin/login
const protectedRoutes = ['/admin'];
const publicRoutes = ['/admin/login'];

const VALID_STATIC_PATHS = new Set([
  '',
  'shop',
  'about',
  'contact',
  'size-fit',
  'delivery-payment',
  'returns-exchange',
  'faq',
  'track-order',
  'lookbook',
  'gifting',
  'checkout',
  'order-success',
  'terms',
  'privacy',
  'pricing',
  'llms.txt',
  'llms-full.txt',
  'robots.txt',
  'sitemap.xml',
  'apple-icon.png',
  'icon.png',
  'favicon.ico',
  'manifest.json',
  'manifest.webmanifest',
  'file.svg',
  'globe.svg',
  'next.svg',
  'vercel.svg',
  'window.svg',
]);

const VALID_CATEGORIES = new Set([
  ...CATEGORIES.map((c) => c.slug.toLowerCase()),
  'umbrellas',
  'promo',
  'collections',
]);

const VALID_PREFIXES = new Set(['admin', 'account', 'api', '.well-known', '_next']);

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // 1. Return empty JS for any cached Vercel analytics requests (prevents 404 in logs)
  if (path.startsWith('/_vercel/')) {
    return new NextResponse('/* @vercel/analytics disabled on custom host */\n', {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  }

  // 2. Clean Facebook tracking parameter (?fbclid=...) and set official Meta attribution cookie
  const fbclid = req.nextUrl.searchParams.get('fbclid');
  if (fbclid) {
    const cleanUrl = req.nextUrl.clone();
    cleanUrl.searchParams.delete('fbclid');

    const response = NextResponse.redirect(cleanUrl, 307);
    const fbcValue = `fb.1.${Date.now()}.${fbclid}`;
    response.cookies.set('_fbc', fbcValue, {
      path: '/',
      maxAge: 90 * 24 * 60 * 60, // 90 days Meta attribution window
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false,
    });
    return response;
  }

  // 2. Safeguard against empty or malformed Server Action POST requests (prevents 500 JSON.parse crash)
  if (req.headers.has('next-action') && req.headers.get('content-length') === '0') {
    return new NextResponse('Invalid server action payload: body is empty', {
      status: 400,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  // 3. Gracefully handle raw non-action POST requests to homepage to prevent 405/500 crashes
  if (path === '/' && req.method === 'POST' && !req.headers.has('next-action')) {
    return NextResponse.redirect(new URL('/', req.nextUrl), 303);
  }

  // 4. Content negotiation: Serve Markdown when requested by agents (read-only methods only)
  const isReadMethod = req.method === 'GET' || req.method === 'HEAD';
  if (isReadMethod) {
    const acceptHeader = req.headers.get('accept') || '';
    const wantsMarkdown =
      acceptHeader.includes('text/markdown') ||
      acceptHeader.includes('text/x-markdown') ||
      req.nextUrl.searchParams.get('format') === 'markdown';

    if (wantsMarkdown) {
      const markdownContent = getPageMarkdown(path);
      if (markdownContent) {
        return new NextResponse(markdownContent, {
          status: 200,
          headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'Vary': 'Accept',
            'Link': '</llms.txt>; rel="describedby"; type="text/plain", </llms-full.txt>; rel="describedby"; type="text/plain", </>; rel="alternate"; type="text/markdown"',
          },
        });
      }
    }
  }

  // 4. Early 404 validation for missing pages so agents receive real HTTP 404
  const segments = path.split('/').filter(Boolean);
  if (segments.length === 1) {
    const root = segments[0].toLowerCase();
    if (!VALID_STATIC_PATHS.has(root) && !VALID_CATEGORIES.has(root) && !VALID_PREFIXES.has(root)) {
      return new NextResponse(NOT_FOUND_HTML, {
        status: 404,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'X-Robots-Tag': 'noindex, nofollow',
        },
      });
    }
  } else if (segments.length === 2) {
    const first = segments[0].toLowerCase();
    if (!VALID_CATEGORIES.has(first) && !VALID_PREFIXES.has(first) && first !== 'order-success') {
      return new NextResponse(NOT_FOUND_HTML, {
        status: 404,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'X-Robots-Tag': 'noindex, nofollow',
        },
      });
    }
  } else if (segments.length >= 3) {
    const first = segments[0].toLowerCase();
    if (!VALID_PREFIXES.has(first)) {
      return new NextResponse(NOT_FOUND_HTML, {
        status: 404,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'X-Robots-Tag': 'noindex, nofollow',
        },
      });
    }
  }

  // 5. Admin Route Protection
  const isAdminApi = path.startsWith('/api/admin');
  const isAdminPage =
    protectedRoutes.some((route) => path.startsWith(route)) &&
    !publicRoutes.some((route) => path.startsWith(route));

  if (isAdminApi || isAdminPage) {
    const sessionCookie = req.cookies.get('adorous_admin_session')?.value;
    const session = await decrypt(sessionCookie);

    if (!session) {
      if (isAdminApi) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: Admin authentication required.' },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL('/admin/login', req.nextUrl));
    }
  }

  // 6. Default response with RFC 8288 Link headers for machine discoverability
  const response = NextResponse.next();
  if (!path.startsWith('/admin') && !path.startsWith('/api/admin')) {
    response.headers.set(
      'Link',
      '</llms.txt>; rel="describedby"; type="text/plain", </llms-full.txt>; rel="describedby"; type="text/plain", </?format=markdown>; rel="alternate"; type="text/markdown"'
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - _next/data (data files)
     * - images/ (public images)
     * - fonts/ (public fonts)
     * - favicon.ico and other static assets
     */
    '/((?!_next/static|_next/image|_next/data|_next|images/|fonts/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2|woff|ttf)$).*)',
  ],
};
