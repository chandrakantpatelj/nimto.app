'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const ShippingDate = () => {
  return (
    <div className="space-y-3">
      <div className="flex flex-col items-start grow gap-2 w-full">
        <span className="form-info text-xs text-mono font-medium">
          Shipping Date
        </span>

        <Input id="active" type="text" placeholder="Active" />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox />
        <Label>Send</Label>
        <Button mode="link" asChild>
          <Link href="#" className="text-xs font-medium">
            Shipping Info
          </Link>
        </Button>
        <Label>to Customer</Label>
      </div>
    </div>
  );
};
