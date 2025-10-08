/**
 * Utility functions for session management and validation
 */

/**
 * Refresh the current session and validate user existence
 * @param {Object} options - Refresh options
 * @param {boolean} options.silent - Don't redirect on failure (default: false)
 * @param {boolean} options.force - Force refresh from database (default: false)
 * @returns {Promise<Object>} - Result object with success status and user data
 */
export async function refreshSession(options = {}) {
  const { silent = false, force = false } = options;

  try {
    const response = await fetch('/api/auth/refresh-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ force }),
    });

    const result = await response.json();

    if (!result.success) {
      // Session is invalid, user should be redirected
      if (result.shouldRedirect && !silent) {
        console.log('Session invalid, redirecting to:', result.redirectTo);
        window.location.href = result.redirectTo;
        return { success: false, shouldRedirect: true };
      }
      return { success: false, error: result.error };
    }

    return {
      success: true,
      user: result.user,
      message: result.message,
      fromCache: result.fromCache,
    };
  } catch (error) {
    console.error('Error refreshing session:', error);
    return {
      success: false,
      error: 'Failed to refresh session',
      shouldRedirect: !silent,
    };
  }
}

/**
 * Validate session on page load
 * @param {Object} session - Current session object
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export function validateSession(session, options = {}) {
  const { requireAuth = true, allowedRoles = null } = options;

  // Check if authentication is required
  if (requireAuth && (!session || !session.user)) {
    return {
      isValid: false,
      reason: 'not_authenticated',
      shouldRedirect: true,
      redirectTo: '/signin',
    };
  }

  // Check user status
  if (session?.user?.status !== 'ACTIVE') {
    return {
      isValid: false,
      reason: 'inactive_user',
      shouldRedirect: true,
      redirectTo: '/signin',
    };
  }

  // Check role permissions
  if (allowedRoles && !allowedRoles.includes(session?.user?.roleSlug)) {
    return {
      isValid: false,
      reason: 'insufficient_permissions',
      shouldRedirect: true,
      redirectTo: '/unauthorized',
    };
  }

  return {
    isValid: true,
    user: session?.user,
  };
}
