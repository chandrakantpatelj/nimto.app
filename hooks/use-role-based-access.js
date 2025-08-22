'use client';

import { useSession } from 'next-auth/react';

export function useRoleBasedAccess() {
  const { data: session } = useSession();
  const userRole = session?.user?.roleName?.toLowerCase();

  // Role definitions - only supporting the four specified roles
  const roles = {
    isSuperAdmin: userRole === 'super admin',
    isHost: userRole === 'host',
    isAttendee: userRole === 'attendee',
    isApplicationAdmin: userRole === 'application admin',
    // Legacy support for backward compatibility
    isAdmin: userRole === 'super admin' || userRole === 'application admin',
  };

  // Permission checks
  const permissions = {
    canManageEvents:
      roles.isHost || roles.isSuperAdmin || roles.isApplicationAdmin,
    canCreateEvents:
      roles.isHost || roles.isSuperAdmin || roles.isApplicationAdmin,
    canEditEvents:
      roles.isHost || roles.isSuperAdmin || roles.isApplicationAdmin,
    canDeleteEvents:
      roles.isHost || roles.isSuperAdmin || roles.isApplicationAdmin,
    canViewAllEvents:
      roles.isHost || roles.isSuperAdmin || roles.isApplicationAdmin,
    canManageUsers: roles.isSuperAdmin || roles.isApplicationAdmin,
    canManageRoles: roles.isSuperAdmin || roles.isApplicationAdmin,
    canViewReports: roles.isSuperAdmin || roles.isApplicationAdmin,
    canAccessSettings: roles.isSuperAdmin || roles.isApplicationAdmin,
  };

  // Design variations based on role
  const designVariants = {
    eventsPage: roles.isHost
      ? 'host'
      : roles.isSuperAdmin || roles.isApplicationAdmin
        ? 'admin'
        : 'attendee',
    dashboard:
      roles.isSuperAdmin || roles.isApplicationAdmin
        ? 'admin'
        : roles.isHost
          ? 'host'
          : 'user',
    navigation:
      roles.isSuperAdmin || roles.isApplicationAdmin
        ? 'full'
        : roles.isHost
          ? 'host'
          : 'limited',
  };

  return {
    user: session?.user,
    role: userRole,
    roles,
    permissions,
    designVariants,
    isAuthenticated: !!session,
    isLoading: session === undefined,
  };
}
