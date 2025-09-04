'use client';

import { StoreClientProvider } from '@/app/(protected)/store-client/components/context';
import { StoreClientWrapper } from '@/app/(protected)/store-client/components/wrapper';

export function ModulesProvider({ children }) {
  // StoreClientProvider is now just a passthrough since we use Redux
  // The StoreClientWrapper can still be used for UI components
  return (
    <StoreClientProvider>
      <StoreClientWrapper>{children}</StoreClientWrapper>
    </StoreClientProvider>
  );
}
