'use client';

import Link from 'next/link';
import { MoveLeft, SquareMousePointer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Payment } from '@/app/(protected)/store-client/checkout/payment-method/components/payment';
import { Order } from '@/app/(protected)/store-client/checkout/shipping-info/components/order';

export function PaymentMethodContent() {
  return (
    <div className="grid xl:grid-cols-3 gap-5 lg:gap-9 mb-5 lg:mb-10">
      <div className="lg:col-span-2 space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <Payment />
        </div>
        <div className="flex justify-end items-center flex-wrap gap-3">
          <Button variant="outline">
            <MoveLeft className="text-base" />
            <Link href="/store-client/checkout/shipping-info">
              Shipping Info
            </Link>
          </Button>

          <Button>
            <Link href="/store-client/checkout/order-placed">Place Order</Link>
            <SquareMousePointer className="text-base" />
          </Button>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="space-y-5">
          <Order />
        </div>
      </div>
    </div>
  );
}
