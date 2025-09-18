'use client';

import { useRoleBasedAccess } from '@/hooks/use-role-based-access';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ScreenLoader } from './screen-loader';

export function withRouteProtection(
  WrappedComponent,
  {
    requiredRoles = [],
    requiredPermissions = [],
    redirectTo = '/unauthorized',
    fallback = null,
  } = {}
) {
  return function ProtectedComponent(props) {
    const { roles, permissions, isLoading, isAuthenticated } = useRoleBasedAccess();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && isAuthenticated) {
        // Check if user has required roles
        const hasRequiredRole = requiredRoles.length === 0 || 
          requiredRoles.some(role => {
            switch (role) {
              case 'super-admin':
                return roles.isSuperAdmin;
              case 'host':
                return roles.isHost;
              case 'attendee':
                return roles.isAttendee;
              case 'application-admin':
                return roles.isApplicationAdmin;
              case 'admin':
                return roles.isAdmin;
              default:
                return false;
            }
          });

        // Check if user has required permissions
        const hasRequiredPermission = requiredPermissions.length === 0 ||
          requiredPermissions.every(permission => permissions[permission]);

        const authorized = hasRequiredRole && hasRequiredPermission;

        if (!authorized) {
          router.push(redirectTo);
        }
      }
    }, [isLoading, isAuthenticated, roles, permissions, requiredRoles, requiredPermissions, router, redirectTo]);

    if (isLoading) {
      return <ScreenLoader />;
    }

    if (!isAuthenticated) {
      return fallback || <ScreenLoader />;
    }

    // Check if user has required roles
    const hasRequiredRole = requiredRoles.length === 0 || 
      requiredRoles.some(role => {
        switch (role) {
          case 'super-admin':
            return roles.isSuperAdmin;
          case 'host':
            return roles.isHost;
          case 'attendee':
            return roles.isAttendee;
          case 'application-admin':
            return roles.isApplicationAdmin;
          case 'admin':
            return roles.isAdmin;
          default:
            return false;
        }
      });

    // Check if user has required permissions
    const hasRequiredPermission = requiredPermissions.length === 0 ||
      requiredPermissions.every(permission => permissions[permission]);

    const authorized = hasRequiredRole && hasRequiredPermission;

    if (!authorized) {
      return fallback || <ScreenLoader />;
    }

    return <WrappedComponent {...props} />;
  };
}

// Convenience functions for common protection patterns
export function withSuperAdminProtection(WrappedComponent, options = {}) {
  return withRouteProtection(WrappedComponent, {
    requiredRoles: ['super-admin'],
    ...options,
  });
}

export function withHostProtection(WrappedComponent, options = {}) {
  return withRouteProtection(WrappedComponent, {
    requiredRoles: ['host'],
    ...options,
  });
}

export function withAdminProtection(WrappedComponent, options = {}) {
  return withRouteProtection(WrappedComponent, {
    requiredRoles: ['admin'],
    ...options,
  });
}

export function withEventManagerProtection(WrappedComponent, options = {}) {
  return withRouteProtection(WrappedComponent, {
    requiredPermissions: ['canManageEvents'],
    ...options,
  });
}

export function withUserManagerProtection(WrappedComponent, options = {}) {
  return withRouteProtection(WrappedComponent, {
    requiredPermissions: ['canManageUsers'],
    ...options,
  });
}
