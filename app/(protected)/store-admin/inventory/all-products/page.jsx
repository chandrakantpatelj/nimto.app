'use client';

import { Container } from '@/components/common/container';
import { AllProductsContent } from '@/app/(protected)/store-admin/inventory/all-products/content';

export default function AllProductsPage() {
  return (
    <Container>
      <AllProductsContent />
    </Container>
  );
}
