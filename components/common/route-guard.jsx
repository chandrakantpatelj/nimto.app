'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useRoleBasedAccess } from '@/hooks/use-role-based-access';
import { ScreenLoader } from './screen-loader';

export function RouteGuard({ 
  children, 
  requiredRoles = [], 
  requiredPermissions = [],
  fallback = null,
  redirectTo = '/unauthorized'
}) {
  const { data: session, status } = useSession();
  const { roles, permissions } = useRoleBasedAccess();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }

    if (status === 'authenticated' && session) {
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
      setIsAuthorized(authorized);

      if (!authorized) {
        router.push(redirectTo);
      }
    }

    setIsLoading(false);
  }, [session, status, roles, permissions, requiredRoles, requiredPermissions, router, redirectTo]);

  if (status === 'loading' || isLoading) {
    return <ScreenLoader />;
  }

  if (!isAuthorized) {
    return fallback || null;
  }

  return children;
}

// Convenience components for common role checks
export function SuperAdminOnly({ children, fallback = null }) {
  return (
    <RouteGuard 
      requiredRoles={['super-admin']} 
      fallback={fallback}
    >
      {children}
    </RouteGuard>
  );
}

export function HostOnly({ children, fallback = null }) {
  return (
    <RouteGuard 
      requiredRoles={['host']} 
      fallback={fallback}
    >
      {children}
    </RouteGuard>
  );
}

export function AdminOnly({ children, fallback = null }) {
  return (
    <RouteGuard 
      requiredRoles={['admin']} 
      fallback={fallback}
    >
      {children}
    </RouteGuard>
  );
}

export function EventManagerOnly({ children, fallback = null }) {
  return (
    <RouteGuard 
      requiredPermissions={['canManageEvents']} 
      fallback={fallback}
    >
      {children}
    </RouteGuard>
  );
}

export function UserManagerOnly({ children, fallback = null }) {
  return (
    <RouteGuard 
      requiredPermissions={['canManageUsers']} 
      fallback={fallback}
    >
      {children}
    </RouteGuard>
  );
}
