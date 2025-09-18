'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard when accessing the root protected route
    router.push('/dashboard');
  }, [router]);

  return null;
}
