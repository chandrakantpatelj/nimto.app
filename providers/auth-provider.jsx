'use client';

import { SessionProvider } from 'next-auth/react';

export function AuthProvider({ children, session }) {
  const basePath =
    (typeof window !== 'undefined'
      ? process.env.NEXT_PUBLIC_BASE_PATH
      : process.env.NEXT_PUBLIC_BASE_PATH) || '';
  return (
    <SessionProvider session={session} basePath={`${basePath}/api/auth`}>
      {children}
    </SessionProvider>
  );
}
