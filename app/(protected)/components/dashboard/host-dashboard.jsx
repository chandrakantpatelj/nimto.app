'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  CalendarDays,
  Clock,
  Eye,
  MapPin,
  Plus,
  TrendingUp,
  UserCheck,
  Users,
  UserX,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/api';
import { formatDate, isFutureDate } from '@/lib/date-utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function HostDashboard() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalGuests: 0,
    confirmedGuests: 0,
    pendingGuests: 0,
    declinedGuests: 0,
    upcomingEvents: 0,
    recentEvents: [],
  });
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log('Session data:', session);
    console.log('User ID:', session?.user?.id);
    if (session?.user?.id) {
      fetchHostStats();
    }
  }, [session?.user?.id]);

  const fetchHostStats = async () => {
    try {
      setLoading(true);

      // Fetch events created by the current user (API now automatically filters by user)
      const apiUrl = `/api/events`;
      console.log('Making API call to:', apiUrl);
      const eventsResponse = await apiFetch(apiUrl);
      console.log('Events API Response:', eventsResponse);

      if (!eventsResponse.ok) {
        throw new Error(`HTTP error! status: ${eventsResponse.status}`);
      }

      const result = await eventsResponse.json();
      console.log('Events API Result:', result);

      const events = result?.data || [];

      // Calculate statistics
      const totalEvents = events.length;
      const upcomingEvents = events.filter((event) =>
        isFutureDate(event.startDateTime),
      ).length;

      // Get guest statistics
      let totalGuests = 0;
      let confirmedGuests = 0;
      let pendingGuests = 0;
      let declinedGuests = 0;

      console.log('Processing events for guest stats:', events);

      for (const event of events) {
        const guests = event.guests || [];
        console.log(
          `Event ${event.id} (${event.title}) has ${guests.length} guests:`,
          guests,
        );
        totalGuests += guests.length;
        confirmedGuests += guests.filter(
          (guest) => guest.status === 'CONFIRMED',
        ).length;
        pendingGuests += guests.filter(
          (guest) => guest.status === 'PENDING',
        ).length;
        declinedGuests += guests.filter(
          (guest) => guest.status === 'DECLINED',
        ).length;
      }

      console.log('Guest statistics:', {
        totalGuests,
        confirmedGuests,
        pendingGuests,
        declinedGuests,
      });

      // Get recent events (last 5)
      const recentEvents = events
        .sort((a, b) => {
          try {
            return new Date(b.createdAt) - new Date(a.createdAt);
          } catch (error) {
            return 0;
          }
        })
        .slice(0, 5);

      const finalStats = {
        totalEvents,
        totalGuests,
        confirmedGuests,
        pendingGuests,
        declinedGuests,
        upcomingEvents,
        recentEvents,
      };

      console.log('Final stats being set:', finalStats);
      setStats(finalStats);
    } catch (error) {
      console.error('Error fetching host stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventStatusColor = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 sm:p-6 text-white">
        <h1 className="text-xl sm:text-2xl font-bold mb-2">
          Welcome back, {session?.user?.name}!
        </h1>
        <p className="text-blue-100 text-sm sm:text-base">
          Here's an overview of your events and guest activity
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.upcomingEvents} upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGuests}</div>
            <p className="text-xs text-muted-foreground">Across all events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.confirmedGuests}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalGuests > 0
                ? Math.round((stats.confirmedGuests / stats.totalGuests) * 100)
                : 0}
              % response rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pendingGuests}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start"
              onClick={() => router.push('/events')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Event
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push('/templates')}
            >
              <Eye className="h-4 w-4 mr-2" />
              Browse Templates
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Guest Response Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Confirmed</span>
                </div>
                <span className="font-medium">{stats.confirmedGuests}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Pending</span>
                </div>
                <span className="font-medium">{stats.pendingGuests}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserX className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Declined</span>
                </div>
                <span className="font-medium">{stats.declinedGuests}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
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
              <p>No events created yet</p>
              <Button className="mt-4" onClick={() => router.push('/events')}>
                Create Your First Event
              </Button>
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
                      <Badge className={getEventStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4" />
                        {formatDate(event.startDateTime)}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4" />
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
