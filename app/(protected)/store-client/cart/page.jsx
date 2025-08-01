'use client';

import { Container } from '@/components/common/container';
import { CartContent } from '@/app/(protected)/store-client/cart/content';

export default function CartPage() {
  return (
    <Container>
      <CartContent />
    </Container>
  );
}
