'use client';

import { Bestsellers } from '@/app/(protected)/store-admin/dashboard/components/bestsellers';
import { Inventory } from '@/app/(protected)/store-admin/dashboard/components/inventory';
import { InventorySummary } from '@/app/(protected)/store-admin/dashboard/components/inventory-summary';
import { Orders } from '@/app/(protected)/store-admin/dashboard/components/orders';
import { RecentOrders } from '@/app/(protected)/store-admin/dashboard/components/recent-orders';
import { SalesActivity } from '@/app/(protected)/store-admin/dashboard/components/sales-activity';

export function DashboardContent() {
  return (
    <div className="flex flex-col gap-5 lg:gap-7.5">
      <div className="grid lg:grid-cols-3 gap-5 lg:gap-7.5">
        <Orders />
        <Inventory />
        <Bestsellers />
      </div>

      <div className="grid lg:grid-cols-3 gap-5 lg:gap-7.5">
        <div className="lg:col-span-2">
          <SalesActivity />
        </div>

        <div className="lg:col-span-1">
          <InventorySummary />
        </div>
      </div>

      <div className="grid lg:grid-cols-1">
        <div className="lg:col-span-1">
          <RecentOrders />
        </div>
      </div>
    </div>
  );
}
