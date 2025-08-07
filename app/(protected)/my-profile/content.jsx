'use client';

import { Card } from '@/components/ui/card';
import ProfileTabs from './components/ProfileTabs';

export function MyProfile() {
  return (
    <Card className="p-4">
      <ProfileTabs />
    </Card>
  );
}
