'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle,
  Clock,
  Eye,
  Mail,
  MapPin,
  Phone,
  UserCheck,
  UserX,
  XCircle,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/api';
import {
  formatDate,
  formatEventDate,
  formatTime,
  isFutureDate,
} from '@/lib/date-utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AttendeeDashboard() {
  const [stats, setStats] = useState({
    totalInvitations: 0,
    confirmedEvents: 0,
    pendingInvitations: 0,
    declinedEvents: 0,
    upcomingEvents: [],
    recentInvitations: [],
    allEvents: [],
  });
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.email) {
      fetchAttendeeStats();
    }
  }, [session?.user?.email]);

  const fetchAttendeeStats = async () => {
    try {
      setLoading(true);

      // Fetch all guests for the current user by email
      const guestsResponse = await apiFetch(
        `/api/attendee/guests?email=${encodeURIComponent(session?.user?.email)}`,
      );

      if (!guestsResponse.ok) {
        throw new Error(
          `API request failed: ${guestsResponse.status} ${guestsResponse.statusText}`,
        );
      }

      const guestsData = await guestsResponse.json();
      const guests = guestsData?.data || [];

      // Fetch all events the user has been invited to
      const eventsResponse = await apiFetch(
        `/api/attendee/events?email=${encodeURIComponent(session?.user?.email)}`,
      );

      if (!eventsResponse.ok) {
        throw new Error(
          `Events API request failed: ${eventsResponse.status} ${eventsResponse.statusText}`,
        );
      }

      const eventsData = await eventsResponse.json();
      const allEvents = eventsData?.data || [];

      // Calculate statistics
      const totalInvitations = guests.length;
      const confirmedEvents = guests.filter(
        (guest) => guest.status === 'CONFIRMED',
      ).length;
      const pendingInvitations = guests.filter(
        (guest) => guest.status === 'PENDING',
      ).length;
      const declinedEvents = guests.filter(
        (guest) => guest.status === 'DECLINED',
      ).length;

      // Get upcoming events (confirmed events with future dates)
      const upcomingEvents = guests
        .filter(
          (guest) =>
            guest.status === 'CONFIRMED' &&
            guest.event &&
            isFutureDate(guest.event.startDateTime),
        )
        .map((guest) => guest.event)
        .slice()
        .sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime))
        .slice(0, 5);

      // Get recent invitations (last 10)
      const recentInvitations = [...guests]
        .sort((a, b) => {
          try {
            return new Date(b.invitedAt) - new Date(a.invitedAt);
          } catch (error) {
            return 0;
          }
        })
        .slice(0, 10);

      setStats({
        totalInvitations,
        confirmedEvents,
        pendingInvitations,
        declinedEvents,
        upcomingEvents,
        recentInvitations,
        allEvents,
      });
    } catch (error) {
      console.error('Error fetching attendee stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'DECLINED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'PENDING':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'DECLINED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
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
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-4 sm:p-6 text-white">
        <h1 className="text-xl sm:text-2xl font-bold mb-2">
          Welcome, {session?.user?.name}!
        </h1>
        <p className="text-green-100 text-sm sm:text-base">
          Here's your event invitation overview
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Invitations
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvitations}</div>
            <p className="text-xs text-muted-foreground">
              Event invitations received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.confirmedEvents}
            </div>
            <p className="text-xs text-muted-foreground">
              Events you'll attend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pendingInvitations}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting your response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Declined</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.declinedEvents}
            </div>
            <p className="text-xs text-muted-foreground">Events you declined</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Your Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.upcomingEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming events</p>
              <p className="text-sm">
                You don't have any confirmed upcoming events
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 gap-3"
                >
                  <div className="flex-1">
                    <h3 className="font-medium mb-2 text-sm sm:text-base">
                      {event.title}
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4" />
                        {formatEventDate(event.startDateTime)}
                      </div>
                      {(event.locationAddress || event.locationUnit) && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="truncate">
                            {event.locationAddress}
                            {event.locationUnit
                              ? `, ${event.locationUnit}`
                              : ''}
                          </span>
                        </div>
                      )}
                      {event.startDateTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                          {formatTime(event.startDateTime)}
                        </div>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => router.push(`/events/${event.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Event
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Invitations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Recent Invitations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentInvitations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No invitations yet</p>
              <p className="text-sm">
                You haven't received any event invitations
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 gap-3"
                >
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="font-medium text-sm sm:text-base">
                        {invitation.event?.title || 'Event Title'}
                      </h3>
                      <Badge className={getStatusColor(invitation.status)}>
                        {invitation.status}
                      </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(invitation.status)}
                        Invited {formatDate(invitation.invitedAt)}
                      </div>
                      {invitation.event?.startDateTime && (
                        <div className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4" />
                          {formatEventDate(invitation.event.startDateTime)}
                        </div>
                      )}
                      {(invitation.event?.locationAddress ||
                        invitation.event?.locationUnit) && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="truncate">
                            {invitation.event.locationAddress}
                            {invitation.event.locationUnit
                              ? `, ${invitation.event.locationUnit}`
                              : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {invitation.event && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() =>
                        router.push(`/events/${invitation.event.id}`)
                      }
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
