'use client';

import { Container } from '@/components/common/container';
import { OrderReceiptContent } from '@/app/(protected)/store-client/order-receipt/content';

export default function OrderReceiptPage() {
  return (
    <Container>
      <OrderReceiptContent />
    </Container>
  );
}
