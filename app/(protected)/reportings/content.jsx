'use client';

import { Card } from '@/components/ui/card';
import UserStatics from './components/UserStatics';
import EventTrends from './components/EventTrends';
import SystemPerformance from './components/SystemPerformance';

export function Reporting() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reporting & Analytics</h1>
        <p className="text-lg text-gray-600 mb-1">Super Admin (Super Admin)</p>
        <p className="text-sm text-gray-500">
          Welcome, Super Admin. This page provides an overview of system-wide reports and analytics.
        </p>
      </div>

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
