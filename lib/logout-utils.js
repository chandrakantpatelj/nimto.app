import { useAppDispatch } from '@/store/hooks';
import { clearAuth } from '@/store/slices/authSlice';
import { signOut } from 'next-auth/react';

/**
 * Clear all browser storage: localStorage, sessionStorage, cookies
 */
export const clearBrowserStorage = () => {
  try {
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }

    // Clear all cookies
    if (typeof document !== 'undefined') {
      document.cookie.split(';').forEach((cookie) => {
        const name = cookie.split('=')[0].trim();
        if (name) {
          // Clear cookie with multiple path/domain combinations for thoroughness
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
        }
      });
    }

    console.log(
      'Browser storage cleared (localStorage, sessionStorage, cookies)',
    );
  } catch (error) {
    console.error('Error clearing browser storage:', error);
  }
};

/**
 * Perform full logout
 */
export const performLogout = async (options = {}) => {
  const {
    redirect = true,
    redirectUrl = '/signin',
    reload = true,
    onSuccess,
    onError,
  } = options;

  try {
    // Clear browser storage
    clearBrowserStorage();

    // Clear Redux state
    if (typeof window !== 'undefined') {
      try {
        const { store } = await import('@/store/index');
        store.dispatch(clearAuth());
      } catch {
        /* ignore */
      }
    }

    // Sign out from NextAuth
    await signOut({ redirect: false });

    if (onSuccess) onSuccess();

    // Handle redirect/reload (don't reload if redirecting - redirect will load the new page)
    if (typeof window !== 'undefined') {
      if (redirect) {
        window.location.href = redirectUrl;
      } else if (reload) {
        window.location.reload();
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    if (onError) onError(error);

    // Handle redirect/reload even on error (don't reload if redirecting)
    if (typeof window !== 'undefined') {
      if (redirect) {
        window.location.href = redirectUrl;
      } else if (reload) {
        window.location.reload();
      }
    }

    return { success: false, error };
  }
};

/**
 * Hook for logout functionality with Redux
 */
export const useLogout = () => {
  const dispatch = useAppDispatch();

  const logout = async (options = {}) => {
    try {
      dispatch(clearAuth());
      return await performLogout(options);
    } catch (error) {
      console.error('Logout hook error:', error);
      return { success: false, error };
    }
  };

  return logout;
};
