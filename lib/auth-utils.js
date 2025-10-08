import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';

/**
 * Common role-based access control utility
 * @param {string[]} allowedRoles - Array of role slugs that are allowed
 * @param {string} operation - Description of the operation for error messages
 * @returns {Object} - { session, userRole, error } or null if access is denied
 */
export async function checkRoleAccess(
  allowedRoles,
  operation = 'access this resource',
) {
  // Get user session for authentication
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      error: NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      ),
    };
  }

  // Check if user has permission
  const userRole = session.user.roleSlug;

  if (!allowedRoles.includes(userRole)) {
    const roleNames = allowedRoles
      .map((role) => {
        switch (role) {
          case 'super-admin':
            return 'super administrators';
          case 'application-admin':
            return 'application administrators';
          case 'host':
            return 'hosts';
          default:
            return role;
        }
      })
      .join(', ');

    return {
      error: NextResponse.json(
        {
          success: false,
          error: `Forbidden: Only ${roleNames} can ${operation}`,
        },
        { status: 403 },
      ),
    };
  }

  return { session, userRole };
}

/**
 * Predefined role groups for common use cases
 */
export const ROLE_GROUPS = {
  // Can create, update, delete events and manage guests
  EVENT_MANAGERS: ['host', 'super-admin', 'application-admin'],

  // Can view all events (including drafts)
  EVENT_VIEWERS: ['host', 'super-admin', 'application-admin'],

  // Can only view published events
  EVENT_ATTENDEES: ['attendee'],

  // Full system access
  SYSTEM_ADMINS: ['super-admin', 'application-admin'],

  // Can manage users and system settings
  USER_MANAGERS: ['super-admin', 'application-admin'],
};

/**
 * Convenience function for event management operations
 */
export async function checkEventManagementAccess(operation = 'manage events') {
  return await checkRoleAccess(ROLE_GROUPS.EVENT_MANAGERS, operation);
}

/**
 * Convenience function for guest management operations
 */
export async function checkGuestManagementAccess(operation = 'manage guests') {
  return await checkRoleAccess(ROLE_GROUPS.EVENT_MANAGERS, operation);
}

/**
 * Convenience function for system administration operations
 */
export async function checkSystemAdminAccess(
  operation = 'access system administration',
) {
  return await checkRoleAccess(ROLE_GROUPS.SYSTEM_ADMINS, operation);
}
