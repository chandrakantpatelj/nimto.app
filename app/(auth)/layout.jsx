'use client';

import { BrandedLayout } from './layouts/branded';
import { AuthRedirect } from '@/components/common/auth-redirect';

export default function Layout({ children }) {
  return (
    <AuthRedirect redirectTo="/templates">
      <BrandedLayout>{children}</BrandedLayout>
    </AuthRedirect>
  );
}
