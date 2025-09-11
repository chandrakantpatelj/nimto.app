import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

function getRoleSlug(roleName) {
  if (!roleName) return null;
  return roleName.toLowerCase();
}

function redirect(path, req) {
  return NextResponse.redirect(new URL(path, req.url));
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    if (pathname === '/unauthorized') return NextResponse.next();
    if (!token) return redirect('/signin', req);

    const userRole = getRoleSlug(token.roleName);
    if (!userRole) return redirect('/unauthorized', req);
    if (token.status !== 'ACTIVE') return redirect('/unauthorized', req);

    // Super-admin and application-admin have access to all routes
    if (userRole === 'super-admin' || userRole === 'application-admin') {
      return NextResponse.next();
    }

    const routePermissions = {
      '/user-management': new Set(['super-admin', 'application-admin']),
      '/settings': new Set(['super-admin', 'application-admin']),
      '/reportings': new Set(['super-admin', 'application-admin']),
      '/templates': new Set(['super-admin', 'application-admin']),
      '/messaging': new Set(['host', 'super-admin', 'application-admin']),
      '/store-admin': new Set(['super-admin', 'application-admin']),
      '/network': new Set([
        'host',
        'attendee',
        'super-admin',
        'application-admin',
      ]),
      '/public-profile': new Set([
        'host',
        'attendee',
        'super-admin',
        'application-admin',
      ]),
      '/account': new Set([
        'host',
        'attendee',
        'super-admin',
        'application-admin',
      ]),
      '/my-profile': new Set([
        'host',
        'attendee',
        'super-admin',
        'application-admin',
      ]),
      '/events': new Set([
        'host',
        'attendee',
        'super-admin',
        'application-admin',
      ]),
      '/': new Set(['host', 'attendee', 'super-admin', 'application-admin']),
    };

    const sortedRoutes = Object.keys(routePermissions).sort(
      (a, b) => b.length - a.length,
    );
    for (const route of sortedRoutes) {
      if (pathname.startsWith(route)) {
        if (!routePermissions[route].has(userRole)) {
          return redirect('/unauthorized', req);
        }
        break;
      }
    }

    if (
      pathname.startsWith('/host/') &&
      !['host', 'super-admin', 'application-admin'].includes(userRole)
    ) {
      return redirect('/unauthorized', req);
    }

    if (
      pathname.startsWith('/admin/') &&
      !['super-admin', 'application-admin'].includes(userRole)
    ) {
      return redirect('/unauthorized', req);
    }

    return NextResponse.next();
  },
  {
    callbacks: { authorized: ({ token }) => !!token },
  },
);

export const config = {
  matcher: [
    '/',
    '/events/:path*',
    '/host/:path*',
    '/admin/:path*',
    '/settings/:path*',
    '/dashboard/:path*',
    '/user-management/:path*',
    '/reportings/:path*',
    '/my-profile/:path*',
    '/templates/:path*',
    '/image-editor/:path*',
    '/messaging/:path*',
    '/store-admin/:path*',
    '/network/:path*',
    '/public-profile/:path*',
    '/account/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico|signin|signup|verify-email|reset-password|unauthorized).*)',
  ],
};
