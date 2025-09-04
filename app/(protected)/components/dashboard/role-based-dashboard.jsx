'use client';

import { useRoleBasedAccess } from '@/hooks/use-role-based-access';
import { useSession } from 'next-auth/react';
import { HostDashboard } from './host-dashboard';
import { SuperAdminDashboard } from './superadmin-dashboard';
import { ApplicationAdminDashboard } from './application-admin-dashboard';
import { AttendeeDashboard } from './attendee-dashboard';

export function RoleBasedDashboard() {
  const { roles } = useRoleBasedAccess();
  const { data: session, status } = useSession();

  // Show loading while session is being fetched
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show loading if no session
  if (status === 'unauthenticated' || !session) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Please sign in</h2>
          <p className="text-muted-foreground">You need to be signed in to view your dashboard</p>
        </div>
      </div>
    );
  }

  // Render dashboard based on user role
  if (roles.isSuperAdmin) {
    return <SuperAdminDashboard />;
  } else if (roles.isApplicationAdmin) {
    return <ApplicationAdminDashboard />;
  } else if (roles.isHost) {
    return <HostDashboard />;
  } else if (roles.isAttendee) {
    return <AttendeeDashboard />;
  }

  // Fallback for unknown roles
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Welcome!</h2>
        <p className="text-muted-foreground">Your dashboard is being prepared...</p>
      </div>
    </div>
  );
}
