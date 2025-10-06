'use client';

import { useSession } from 'next-auth/react';
import { useRoleBasedAccess } from '@/hooks/use-role-based-access';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminEventContent } from '../routes/admin/admin-content';
import { ApplicationAdminEventContent } from '../routes/application-admin/application-admin-content';
import { AttendeeEventContent } from '../routes/attendee/attendee-content';
import { HostEventContent } from '../routes/host/host-content';

export function RoleBasedEventContent() {
  const { data: session, status } = useSession();
  const { roles } = useRoleBasedAccess();
  const isAuthenticated = !!session;
  console.log('roles', roles);
  // Wait for session to load to prevent multiple components from rendering
  if (status === 'loading') {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>

        {/* Search Bar Skeleton */}
        <Skeleton className="h-10 w-full" />

        {/* Events Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Route mapping based on user role - only supporting the four specified roles
  const getRoleComponent = () => {
    // If not authenticated, show public events view (same as attendee view)
    // if (!isAuthenticated) {
    //   return <AttendeeEventContent />;
    // }

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
