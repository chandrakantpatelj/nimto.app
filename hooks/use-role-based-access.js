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
    // Event-related permissions
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
    
    // User management permissions
    canManageUsers: roles.isSuperAdmin || roles.isApplicationAdmin,
    canManageRoles: roles.isSuperAdmin || roles.isApplicationAdmin,
    
    // System permissions
    canViewReports: roles.isSuperAdmin || roles.isApplicationAdmin,
    canAccessSettings: roles.isSuperAdmin || roles.isApplicationAdmin,
    canAccessTemplates: roles.isHost || roles.isSuperAdmin || roles.isApplicationAdmin,

    canAccessMessaging: roles.isHost || roles.isSuperAdmin || roles.isApplicationAdmin,
    canAccessStoreAdmin: roles.isSuperAdmin || roles.isApplicationAdmin,
    
    // Route access permissions
    canAccessUserManagement: roles.isSuperAdmin || roles.isApplicationAdmin,
    canAccessReporting: roles.isSuperAdmin || roles.isApplicationAdmin,
    
    // General access permissions
    canAccessNetwork: true, // All authenticated users
    canAccessPublicProfile: true, // All authenticated users
    canAccessAccount: true, // All authenticated users
    canAccessMyProfile: true, // All authenticated users
    canAccessEvents: true, // All authenticated users
    canAccessDashboard: true, // All authenticated users
  };

  // Route access mapping
  const routeAccess = {
    '/user-management': permissions.canAccessUserManagement,
    '/settings': permissions.canAccessSettings,
    '/reportings': permissions.canAccessReporting,
    '/templates': permissions.canAccessTemplates,

    '/messaging': permissions.canAccessMessaging,
    '/store-admin': permissions.canAccessStoreAdmin,
    '/network': permissions.canAccessNetwork,
    '/public-profile': permissions.canAccessPublicProfile,
    '/account': permissions.canAccessAccount,
    '/my-profile': permissions.canAccessMyProfile,
    '/events': permissions.canAccessEvents,
    '/': permissions.canAccessDashboard,
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

  // Check if user can access a specific route
  const canAccessRoute = (route) => {
    return routeAccess[route] || false;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roleList) => {
    return roleList.some(role => {
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
  };

  // Check if user has all of the specified permissions
  const hasAllPermissions = (permissionList) => {
    return permissionList.every(permission => permissions[permission]);
  };

  // Check if user has any of the specified permissions
  const hasAnyPermission = (permissionList) => {
    return permissionList.some(permission => permissions[permission]);
  };

  return {
    user: session?.user,
    role: userRole,
    roles,
    permissions,
    designVariants,
    routeAccess,
    isAuthenticated: !!session,
    isLoading: session === undefined,
    canAccessRoute,
    hasAnyRole,
    hasAllPermissions,
    hasAnyPermission,
  };
}
