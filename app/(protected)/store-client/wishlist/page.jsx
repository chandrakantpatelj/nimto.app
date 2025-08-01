'use client';

import { Container } from '@/components/common/container';
import { WishlistContent } from '@/app/(protected)/store-client/wishlist/content';

export default function WishlistPage() {
  return (
    <Container>
      <WishlistContent />
    </Container>
  );
}
