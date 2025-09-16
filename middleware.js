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

    // Allow public access to root route (homepage)
    if (pathname === '/') return NextResponse.next();
    if (pathname === '/unauthorized') return NextResponse.next();
    
    // Allow public access to specific events routes, protect main events listing
    if (pathname.startsWith('/events/design')) return NextResponse.next();
    if (pathname.match(/^\/events\/[a-zA-Z0-9_-]+$/)) return NextResponse.next(); // Allow /events/[eventId]
    
    // Redirect non-logged-in users from /events to home page
    if (pathname === '/events' && !token) {
      return redirect('/', req);
    }
    
    // Redirect authenticated users away from auth pages
    if (token && (pathname.startsWith('/signin') || pathname.startsWith('/signup') || pathname.startsWith('/reset-password'))) {
      // Redirect based on user role
      const userRole = getRoleSlug(token.roleName);
      if (userRole === 'attendee') {
        return redirect('/invited-events', req);
      }
      return redirect('/templates', req);
    }
    
    if (!token) return redirect('/', req);

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
      '/templates': new Set(['host', 'super-admin', 'application-admin']),
      '/messaging': new Set(['host', 'super-admin', 'application-admin']),
      '/store-admin': new Set(['super-admin', 'application-admin']),
      '/invited-events': new Set(['attendee', 'super-admin', 'application-admin']),
      '/dashboard': new Set([
        'host',
        'attendee',
        'super-admin',
        'application-admin',
      ]),
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
    };

    // Special redirect for attendees trying to access templates
    if (userRole === 'attendee' && pathname === '/templates') {
      return redirect('/invited-events', req);
    }

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
    callbacks: { 
      authorized: ({ token, req }) => {
        // Allow public access to root route
        if (req.nextUrl.pathname === '/') return true;
        // Allow public access to specific events routes, protect main events listing
        if (req.nextUrl.pathname.startsWith('/events/design')) return true;
        if (req.nextUrl.pathname.match(/^\/events\/[a-zA-Z0-9_-]+$/)) return true; // Allow /events/[eventId]
        // Allow /events route to be processed by middleware (for redirect logic)
        if (req.nextUrl.pathname === '/events') return true;
        // Require token for all other routes including /templates
        return !!token;
      }
    },
  },
);

export const config = {
  matcher: [
    '/host/:path*',
    '/admin/:path*',
    '/settings/:path*',
    '/dashboard/:path*',
    '/user-management/:path*',
    '/reportings/:path*',
    '/templates/:path*',
    '/invited-events/:path*',
    '/my-profile/:path*',
    '/image-editor/:path*',
    '/messaging/:path*',
    '/store-admin/:path*',
    '/network/:path*',
    '/public-profile/:path*',
    '/account/:path*',
    '/events', // Add /events to matcher to handle authentication
    '/((?!api|_next/static|_next/image|favicon.ico|signin|signup|verify-email|reset-password|unauthorized|events/design|events/[a-zA-Z0-9_-]+|pixie-assets|^/$).*)',
  ],
};
