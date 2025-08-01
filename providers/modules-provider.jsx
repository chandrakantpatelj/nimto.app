'use client';

import { StoreClientProvider } from '@/app/(protected)/store-client/components/context';
import { StoreClientWrapper } from '@/app/(protected)/store-client/components/wrapper';

export function ModulesProvider({ children }) {
  return (
    <StoreClientProvider>
      <StoreClientWrapper>{children}</StoreClientWrapper>
    </StoreClientProvider>
  );
}
