'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

/**
 * AuthRedirect component that redirects authenticated users away from auth pages
 */
// eslint-disable-next-line react/prop-types
export function AuthRedirect({ children, redirectTo = '/templates' }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If user is authenticated, redirect them away from auth pages
    if (status === 'authenticated' && session) {
      router.push(redirectTo);
      router.refresh();
    }
  }, [status, session, router, redirectTo]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is authenticated, don't render the auth form
  if (status === 'authenticated' && session) {
    return null;
  }

  // If user is not authenticated, render the auth form
  return <>{children}</>;
}
