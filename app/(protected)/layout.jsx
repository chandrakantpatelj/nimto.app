'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ScreenLoader } from '@/components/common/screen-loader';
import { Demo1Layout } from '../components/layouts/demo1/layout';

export default function ProtectedLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Allow public access to templates and events routes
  const isPublicRoute = pathname.startsWith('/templates') || pathname.startsWith('/events');

  useEffect(() => {
    if (!isPublicRoute && status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router, isPublicRoute]);

  if (status === 'loading' && !isPublicRoute) {
    return <ScreenLoader />;
  }

  // For public routes, render without authentication check
  if (isPublicRoute) {
    return <Demo1Layout>{children}</Demo1Layout>;
  }

  // For protected routes, require authentication
  return session ? <Demo1Layout>{children}</Demo1Layout> : null;
}
