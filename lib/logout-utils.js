import { useAppDispatch } from '@/store/hooks';
import { clearAuth } from '@/store/slices/authSlice';
import { signOut } from 'next-auth/react';

/**
 * Comprehensive logout utility that clears all user state
 * @param {Object} options - Logout options
 * @param {boolean} options.redirect - Whether to redirect after logout (default: true)
 * @param {string} options.redirectUrl - URL to redirect to after logout (default: '/')
 * @param {boolean} options.reload - Whether to reload the page after logout (default: true)
 * @param {Function} options.onSuccess - Callback function to run on successful logout
 * @param {Function} options.onError - Callback function to run on logout error
 */
export const performLogout = async (options = {}) => {
  const {
    redirect = true,
    redirectUrl = '/',
    reload = true,
    onSuccess,
    onError,
  } = options;

  try {
    // Clear Redux state first
    if (typeof window !== 'undefined') {
      // Only run on client side
      const { store } = await import('@/store/index');
      store.dispatch(clearAuth());
    }

    // Clear any localStorage/sessionStorage if needed
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user-preferences');
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user-session');
      sessionStorage.clear();

      // Clear any other app-specific storage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith('user-') ||
            key.startsWith('auth-') ||
            key.startsWith('session-'))
        ) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    }

    // Sign out from NextAuth
    await signOut({
      redirect: false, // We'll handle redirect manually
      callbackUrl: redirectUrl,
    });

    // Execute success callback
    if (onSuccess) {
      onSuccess();
    }

    // Handle redirect and reload
    if (typeof window !== 'undefined') {
      if (redirect) {
        window.location.href = redirectUrl;
      }

      if (reload) {
        window.location.reload();
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);

    // Execute error callback
    if (onError) {
      onError(error);
    }

    // Fallback: still redirect even if logout fails
    if (typeof window !== 'undefined') {
      if (redirect) {
        window.location.href = redirectUrl;
      }
      if (reload) {
        window.location.reload();
      }
    }

    return { success: false, error };
  }
};

/**
 * Hook for logout functionality with Redux dispatch
 * @returns {Function} logout function
 */
export const useLogout = () => {
  const dispatch = useAppDispatch();

  const logout = async (options = {}) => {
    try {
      // Clear Redux state
      dispatch(clearAuth());

      // Perform the rest of the logout
      return await performLogout(options);
    } catch (error) {
      console.error('Logout hook error:', error);
      return { success: false, error };
    }
  };

  return logout;
};

/**
 * Clear all user-related data from browser storage
 */
export const clearUserData = () => {
  if (typeof window === 'undefined') return;

  // Clear localStorage
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (
      key &&
      (key.startsWith('user-') ||
        key.startsWith('auth-') ||
        key.startsWith('session-') ||
        key.includes('token') ||
        key.includes('credential'))
    ) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));

  // Clear sessionStorage
  sessionStorage.clear();

  // Clear cookies (if any)
  document.cookie.split(';').forEach((c) => {
    const eqPos = c.indexOf('=');
    const name = eqPos > -1 ? c.substr(0, eqPos) : c;
    if (name.trim().startsWith('auth') || name.trim().startsWith('session')) {
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    }
  });
};
