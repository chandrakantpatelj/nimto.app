'use client';

import { Container } from '@/components/common/container';
import { StoreClientContent } from '@/app/(protected)/store-client/home/content';

export default function StoreClientPage() {
  return (
    <Container>
      <StoreClientContent />
    </Container>
  );
}
