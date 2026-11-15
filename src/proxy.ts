import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';
import { HOMEPAGE_MARKDOWN } from '@/lib/homepageMarkdown';
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
  'llms.txt',
  'robots.txt',
  'sitemap.xml',
  'apple-icon.png',
  'icon.png',
  'favicon.ico',
]);

const VALID_CATEGORIES = new Set([
  ...CATEGORIES.map((c) => c.slug.toLowerCase()),
  'umbrellas',
  'promo',
  'collections',
]);

const VALID_PREFIXES = new Set(['admin', 'account', 'api', '.well-known']);

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // 1. Clean Facebook tracking parameter (?fbclid=...) and set official Meta attribution cookie
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

  // 2. Content negotiation: Serve Markdown when requested by agents
  const acceptHeader = req.headers.get('accept') || '';
  const wantsMarkdown =
    acceptHeader.includes('text/markdown') ||
    acceptHeader.includes('text/x-markdown') ||
    req.nextUrl.searchParams.get('format') === 'markdown';

  if (path === '/' && wantsMarkdown) {
    return new NextResponse(HOMEPAGE_MARKDOWN, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Vary': 'Accept',
        'Link': '</llms.txt>; rel="describedby"; type="text/plain", </>; rel="alternate"; type="text/markdown"',
      },
    });
  }

  // 3. Early 404 validation for missing pages so agents receive real HTTP 404
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

  // 4. Admin Route Protection
  const isProtectedRoute =
    protectedRoutes.some((route) => path.startsWith(route)) &&
    !publicRoutes.some((route) => path.startsWith(route));

  if (isProtectedRoute) {
    const sessionCookie = req.cookies.get('adorous_admin_session')?.value;
    const session = await decrypt(sessionCookie);

    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', req.nextUrl));
    }
  }

  // 5. Default response with RFC 8288 Link header for homepage
  const response = NextResponse.next();
  if (path === '/') {
    response.headers.set(
      'Link',
      '</llms.txt>; rel="describedby"; type="text/plain", </>; rel="alternate"; type="text/markdown"'
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
     * - favicon.ico (favicon file)
     * - images/ (public images)
     */
    '/((?!_next/static|_next/image|images/|favicon.ico).*)',
  ],
};
