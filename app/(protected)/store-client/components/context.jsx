'use client';

import { useStoreClientCompat } from '@/hooks/use-store-client-compat';

// Re-export the compatibility hook for backward compatibility
export { useStoreClientCompat as useStoreClient };

// Legacy provider component - now just passes through children
// since we're using Redux instead of Context API
export function StoreClientProvider({ children }) {
  // No longer needed since we're using Redux
  // This is kept for backward compatibility
  return children;
}
