'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEventActions, useEvents } from '@/store/hooks';
import {
  Activity,
  BarChart3,
  CalendarDays,
  FileText,
  MessageSquare,
  Settings,
  Shield,
  UserCheck,
  Users,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ApplicationAdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalGuests: 0,
    activeUsers: 0,
    recentEvents: [],
    systemStats: {},
  });
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();

  // Redux state and actions
  const { events } = useEvents();
  const { fetchAllEvents } = useEventActions();

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);

      // Fetch users (limited for admin view)
      const usersResponse = await apiFetch(
        '/api/user-management/users?limit=100',
      );
      const usersData = await usersResponse.json();
      const users = usersData?.data || [];

      // Fetch events using Redux (admin can see all events)
      await fetchAllEvents({ admin: 'true' });

      // Fetch guests
      const guestsResponse = await apiFetch('/api/events/guests');
      const guestsData = await guestsResponse.json();
      const guests = guestsData?.data || [];

      // Calculate statistics
      const totalUsers = users.length;
      const activeUsers = users.filter(
        (user) => user.status === 'ACTIVE',
      ).length;
      const totalEvents = events.length; // Now using Redux events
      const totalGuests = guests.length;

      // Get recent events
      const recentEvents = [...events]
        .sort((a, b) => {
          try {
            return new Date(b.createdAt) - new Date(a.createdAt);
          } catch (error) {
            return 0;
          }
        })
        .slice(0, 8);

      setStats({
        totalUsers,
        totalEvents,
        totalGuests,
        activeUsers,
        recentEvents,
        systemStats: {
          publishedEvents: events.filter((e) => e.status === 'PUBLISHED')
            .length,
          draftEvents: events.filter((e) => e.status === 'DRAFT').length,
          confirmedGuests: guests.filter((g) => g.status === 'CONFIRMED')
            .length,
          pendingGuests: guests.filter((g) => g.status === 'PENDING').length,
        },
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      console.error('Error details:', error.message, error.stack);
      // Set some default stats in case of error
      setStats((prev) => ({
        ...prev,
        totalUsers: 0,
        totalEvents: 0,
        totalGuests: 0,
        activeUsers: 0,
        recentEvents: [],
        systemStats: {
          publishedEvents: 0,
          draftEvents: 0,
          confirmedGuests: 0,
          pendingGuests: 0,
        },
      }));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      console.warn('Invalid date format:', dateString);
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-4 sm:p-6 text-white">
        <h1 className="text-xl sm:text-2xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-indigo-100 text-sm sm:text-base">
          Welcome, {session?.user?.name}. Manage your application
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers} active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.systemStats.publishedEvents} published,{' '}
              {stats.systemStats.draftEvents} drafts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGuests}</div>
            <p className="text-xs text-muted-foreground">
              {stats.systemStats.confirmedGuests} confirmed,{' '}
              {stats.systemStats.pendingGuests} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-muted-foreground">
              All services operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Management Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start"
              onClick={() => router.push('/user-management/users')}
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push('/user-management/roles')}
            >
              <Shield className="h-4 w-4 mr-2" />
              Manage Roles
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push('/settings')}
            >
              <Settings className="h-4 w-4 mr-2" />
              App Settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Content Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start"
              onClick={() => router.push('/events')}
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              Manage Events
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push('/templates')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Manage Templates
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push('/reportings')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              View Reports
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push('/messaging')}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Messaging
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Events
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/events')}
            >
              View All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No events found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 gap-3"
                >
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="font-medium text-sm sm:text-base">
                        {event.title}
                      </h3>
                      <Badge variant="outline">{event.status}</Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                        Created by {event.User?.name || 'Unknown'}
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4" />
                        {formatDate(event.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <UserCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                        {event.guests?.length || 0} guests
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => router.push(`/events/${event.id}`)}
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
