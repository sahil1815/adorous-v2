import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';
import { cookies } from 'next/headers';

// Protect all routes under /admin except /admin/login
const protectedRoutes = ['/admin'];
const publicRoutes = ['/admin/login'];

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
  
  // 2. Check if it's an admin route
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route)) && 
                           !publicRoutes.some(route => path.startsWith(route));

  if (isProtectedRoute) {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('adorous_admin_session')?.value;
    const session = await decrypt(sessionCookie);

    if (!session) {
      // Redirect to login if unauthenticated
      return NextResponse.redirect(new URL('/admin/login', req.nextUrl));
    }
  }

  // Allow access if logged in or if it's a public route
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/collections/:path*',
  ],
};
