'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { validateSession as validateSessionUtil } from '@/lib/session-utils';

/**
 * Session Guard Component
 * Automatically handles session validation and redirects
 */
export function SessionGuard({
  children,
  requireAuth = true,
  allowedRoles = null,
  onSessionInvalid = null,
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      // Wait for session to load
      if (status === 'loading') return;

      // Validate current session
      const validation = validateSessionUtil(session, {
        requireAuth,
        allowedRoles,
      });

      if (!validation.isValid) {
        console.log('Session validation failed:', validation.reason);

        if (onSessionInvalid) {
          onSessionInvalid(validation);
        }

        if (validation.shouldRedirect) {
          router.push(validation.redirectTo);
        }
        setIsValidating(false);
        return;
      }

      // Session is valid
      setIsValidating(false);
    };

    validateSession();
  }, [session, status, requireAuth, allowedRoles, router, onSessionInvalid]);

  // Show loading while validating
  if (status === 'loading' || isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Validating session...
          </p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!session && requireAuth) {
    return null;
  }

  // Render children if session is valid
  return <>{children}</>;
}

/**
 * Higher-order component for protecting pages
 */
export function withSessionGuard(WrappedComponent, options = {}) {
  return function ProtectedPage(props) {
    return (
      <SessionGuard {...options}>
        <WrappedComponent {...props} />
      </SessionGuard>
    );
  };
}
