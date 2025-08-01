'use client';

import { useState } from 'react';
import { StoreClientWishlistSheet } from '@/app/(protected)/store-client/components/sheets/wishlist-sheet';
import { SearchResults } from '@/app/(protected)/store-client/search-results-grid/components/search-results';

export function WishlistContent() {
  const [open, setOpen] = useState(true);

  return (
    <>
      <SearchResults mode="card" />
      <StoreClientWishlistSheet
        open={open}
        onOpenChange={() => setOpen(false)}
      />
    </>
  );
}
