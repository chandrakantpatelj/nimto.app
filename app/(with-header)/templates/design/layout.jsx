'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ScreenLoader } from '@/components/common/screen-loader';
import LayoutWithHeader from '@/app/components/layouts/layout-with-header/layout';

export default function ProtectedLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <ScreenLoader />;
  }

  return session ? <LayoutWithHeader>{children}</LayoutWithHeader> : null;
}
