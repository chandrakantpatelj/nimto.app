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

    // Define route permissions
    const routePermissions = {
      // User Management - Super Admin and Application Admin only
      '/user-management': ['super admin', 'application admin'],
      
      // Settings - Super Admin and Application Admin only
      '/settings': ['super admin', 'application admin'],
      
      // Reporting - Super Admin and Application Admin only
      '/reportings': ['super admin', 'application admin'],
      
      // Templates - Host, Super Admin, and Application Admin
      '/templates': ['host', 'super admin', 'application admin'],
      
      // Image Editor - Host, Super Admin, and Application Admin
      '/image-editor': ['host', 'super admin', 'application admin'],
      
      // Messaging - Host, Super Admin, and Application Admin
      '/messaging': ['host', 'super admin', 'application admin'],
      
      // Store Admin - Super Admin and Application Admin only
      '/store-admin': ['super admin', 'application admin'],
      
      // Network - All authenticated users
      '/network': ['host', 'super admin', 'application admin', 'attendee'],
      
      // Public Profile - All authenticated users
      '/public-profile': ['host', 'super admin', 'application admin', 'attendee'],
      
      // Account - All authenticated users
      '/account': ['host', 'super admin', 'application admin', 'attendee'],
      
      // My Profile - All authenticated users
      '/my-profile': ['host', 'super admin', 'application admin', 'attendee'],
      
      // Events - All authenticated users (content varies by role)
      '/events': ['host', 'super admin', 'application admin', 'attendee'],
      
      // Dashboard - All authenticated users (content varies by role)
      '/': ['host', 'super admin', 'application admin', 'attendee'],
    };

    // Check if the current path requires specific permissions
    for (const [route, allowedRoles] of Object.entries(routePermissions)) {
      if (pathname.startsWith(route)) {
        const hasPermission = allowedRoles.some(role => 
          userRole === role.toLowerCase()
        );
        
        if (!hasPermission) {
          // Redirect to unauthorized page
          return NextResponse.redirect(new URL('/unauthorized', req.url));
        }
        break;
      }
    }

    // Legacy route protection (keeping for backward compatibility)
    // Host-specific routes - only accessible by hosts and admins
    if (pathname.startsWith('/host/')) {
      const isHost =
        userRole === 'host' ||
        userRole === 'super admin' ||
        userRole === 'application admin';
      if (!isHost) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    // Admin-specific routes - only accessible by admins
    if (pathname.startsWith('/admin/')) {
      const isAdmin =
        userRole === 'super admin' || userRole === 'application admin';
      if (!isAdmin) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
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
    '/templates/:path*',
    '/image-editor/:path*',
    '/messaging/:path*',
    '/store-admin/:path*',
    '/network/:path*',
    '/public-profile/:path*',
    '/account/:path*',
    '/unauthorized',
    // Exclude auth routes and public assets
    '/((?!api|_next/static|_next/image|favicon.ico|signin|signup|verify-email|reset-password).*)',
  ],
};
