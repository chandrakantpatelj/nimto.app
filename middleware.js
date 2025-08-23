import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // If no token, redirect to signin
    if (!token) {
      return NextResponse.redirect(new URL('/signin', req.url));
    }

    // Role-based route protection
    const userRole = token.roleName?.toLowerCase();

    // Host-specific routes - only accessible by hosts and admins
    if (pathname.startsWith('/host/')) {
      const isHost =
        userRole === 'host' ||
        userRole === 'super admin' ||
        userRole === 'administrator';
      if (!isHost) {
        // Redirect to main events page instead of showing host in URL
        return NextResponse.redirect(new URL('/events', req.url));
      }
    }

    // Admin-specific routes - only accessible by admins
    if (pathname.startsWith('/admin/')) {
      const isAdmin =
        userRole === 'super admin' || userRole === 'administrator';
      if (!isAdmin) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // Settings routes - only accessible by admins
    if (pathname.startsWith('/settings')) {
      const isAdmin =
        userRole === 'super admin' || userRole === 'administrator';
      if (!isAdmin) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: [
    // Protected routes that require authentication
    '/events/:path*',
    '/host/:path*',
    '/admin/:path*',
    '/settings/:path*',
    '/dashboard/:path*',
    '/user-management/:path*',
    '/reportings/:path*',
    '/my-profile/:path*',
    // Exclude auth routes and public assets
    '/((?!api|_next/static|_next/image|favicon.ico|signin|signup|verify-email|reset-password).*)',
  ],
};
