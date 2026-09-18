import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';
import { cookies } from 'next/headers';

// Protect all routes under /admin except /admin/login
const protectedRoutes = ['/admin'];
const publicRoutes = ['/admin/login'];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // Check if it's an admin route
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

// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
