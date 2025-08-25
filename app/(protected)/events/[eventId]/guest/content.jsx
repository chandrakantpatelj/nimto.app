'use client';

import { Card } from '@/components/ui/card';
import { GuestListTable } from './components';
import ManageGuestForm from './components/manage-guest-form';

export function ManageGuestContent() {
  return (
    <Card className="p-4">
      <ManageGuestForm />
      <GuestListTable />
    </Card>
  );
}
