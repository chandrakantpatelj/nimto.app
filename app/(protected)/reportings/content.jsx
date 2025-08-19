'use client';

import { Card } from '@/components/ui/card';
import EventTrends from './components/EventTrends';
import SystemPerformance from './components/SystemPerformance';
import UserStatics from './components/UserStatics';

export function Reporting() {
  return (
    <div className="space-y-8">
      {/* User Statistics Section */}
      <Card className="p-6">
        <UserStatics />
      </Card>

      {/* Event Trends Section */}
      <Card className="p-6">
        <EventTrends />
      </Card>

      {/* System Performance Section */}
      <Card className="p-6">
        <SystemPerformance />
      </Card>
    </div>
  );
}
