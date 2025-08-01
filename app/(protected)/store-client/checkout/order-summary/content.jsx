'use client';

import Link from 'next/link';
import { MoveRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Order } from '@/app/(protected)/store-client/checkout/order-summary/components/order';
import { Card4 } from '@/app/(protected)/store-client/components/common/card4';

export function OrderSummaryContent() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 lg:gap-9 mb-5 lg:mb-10">
      <div className="col-span-2 space-y-5">
        <div className="grid sm:grid-cols-1 gap-5">
          <Card4 limit={4} />
        </div>
        <div className="flex justify-end items-center flex-wrap gap-3">
          <Button variant="outline">Cancel</Button>

          <Button>
            <Link href="/store-client/checkout/shipping-info">
              Shipping Info
            </Link>
            <MoveRight className="text-base" />
          </Button>
        </div>
      </div>

      <div className="col-span-1">
        <div className="space-y-5">
          <Order />
        </div>
      </div>
    </div>
  );
}
