'use client';

import { usePathname } from 'next/navigation';
import { SessionGuard } from '@/components/common/session-guard';
import { Demo1Layout } from '../components/layouts/demo1/layout';

export default function ProtectedLayout({ children }) {
  const pathname = usePathname();

  // Allow public access to templates and events routes
  const isPublicRoute =
    pathname.startsWith('/templates') || pathname.startsWith('/events');

  // For public routes, render without authentication check
  if (isPublicRoute) {
    return <Demo1Layout>{children}</Demo1Layout>;
  }

  // For protected routes, use session guard with automatic validation and redirect
  return (
    <SessionGuard
      requireAuth={true}
      onSessionInvalid={(validation) => {
        console.log('Session invalid in protected layout:', validation.reason);
      }}
    >
      <Demo1Layout>{children}</Demo1Layout>
    </SessionGuard>
  );
}
