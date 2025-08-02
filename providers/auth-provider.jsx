'use client';

import { SessionProvider } from 'next-auth/react';

export function AuthProvider({ children, session }) {
  // Use environment variable directly without server/client branching
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  
  return (
    <SessionProvider session={session} basePath={`${basePath}/api/auth`}>
      {children}
    </SessionProvider>
  );
}
