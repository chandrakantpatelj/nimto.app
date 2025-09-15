'use client';

import { useSession } from 'next-auth/react';
import { useRoleBasedAccess } from '@/hooks/use-role-based-access';
import { AdminEventContent } from '../routes/admin/admin-content';
import { ApplicationAdminEventContent } from '../routes/application-admin/application-admin-content';
import { AttendeeEventContent } from '../routes/attendee/attendee-content';
import { HostEventContent } from '../routes/host/host-content';

export function RoleBasedEventContent() {
  const { data: session } = useSession();
  const { roles } = useRoleBasedAccess();
  const isAuthenticated = !!session;

  // Route mapping based on user role - only supporting the four specified roles
  const getRoleComponent = () => {
    // If not authenticated, show public events view (same as attendee view)
    if (!isAuthenticated) {
      return <AttendeeEventContent />;
    }

    if (roles.isSuperAdmin) {
      return <AdminEventContent />;
    }

    if (roles.isApplicationAdmin) {
      return <ApplicationAdminEventContent />;
    }

    if (roles.isHost) {
      return <HostEventContent />;
    }
    
    if (roles.isAttendee) {
      return <AttendeeEventContent />;
    }

    return <h3>no user role</h3>;
  };

  return getRoleComponent();
}
