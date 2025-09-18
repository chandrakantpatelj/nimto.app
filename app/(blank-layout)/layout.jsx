'use client';

import { useSession } from 'next-auth/react';
import { ScreenLoader } from '@/components/common/screen-loader';
import LayoutWithHeader from '@/app/components/layouts/layout-with-header/layout';

export default function BlankLayout({ children }) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <ScreenLoader />;
  }

  // Allow both authenticated and non-authenticated users
  return <LayoutWithHeader>{children}</LayoutWithHeader>;
}
