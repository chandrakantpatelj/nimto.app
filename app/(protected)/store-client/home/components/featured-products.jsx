'use client';

import { Card1 } from '@/app/(protected)/store-client/components/common/card1';

export function FeaturedProducts() {
  return (
    <div className="grid sm:grid-cols-4 xl:grid-cols-7 gap-5 mb-2">
      <Card1 />
    </div>
  );
}
