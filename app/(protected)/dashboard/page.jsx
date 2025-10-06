'use client';

import { useSettings } from '@/providers/settings-provider';
import { RoleBasedDashboard } from '../components/dashboard/role-based-dashboard';
import { Demo2Page } from '../components/demo2';
import { Demo3Page } from '../components/demo3';
import { Demo4Page } from '../components/demo4';
import { Demo5Page } from '../components/demo5';

export default function DashboardPage() {
  const { settings } = useSettings();

  // Use role-based dashboard for demo1 layout (main dashboard)
  if (settings?.layout === 'demo1') {
    return (
      <div className="flex flex-col h-screen">
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <div className="container mx-auto p-4 sm:p-6">
                <RoleBasedDashboard />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (settings?.layout === 'demo2') {
    return <Demo2Page />;
  } else if (settings?.layout === 'demo3') {
    return <Demo3Page />;
  } else if (settings?.layout === 'demo4') {
    return <Demo4Page />;
  } else if (settings?.layout === 'demo5') {
    return <Demo5Page />;
  } else if (settings?.layout === 'demo6') {
    return <Demo4Page />;
  } else if (settings?.layout === 'demo7') {
    return <Demo2Page />;
  } else if (settings?.layout === 'demo8') {
    return <Demo4Page />;
  } else if (settings?.layout === 'demo9') {
    return <Demo2Page />;
  } else if (settings?.layout === 'demo10') {
    return <Demo3Page />;
  }

  // Default to role-based dashboard
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <div className="container mx-auto p-4 sm:p-6">
              <RoleBasedDashboard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
