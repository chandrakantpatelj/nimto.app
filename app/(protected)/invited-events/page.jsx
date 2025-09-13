'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle,
  Clock,
  Eye,
  Mail,
  MapPin,
  User,
  UserCheck,
  XCircle,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function InvitedEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  // Get parameters from URL
  const email = searchParams.get('email');
  const userId = searchParams.get('userId');

  useEffect(() => {
    fetchInvitedEvents();
  }, [session?.user?.email, email, userId]);

  const fetchInvitedEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters - only include email/userId for authenticated users
      // Don't include eventId to get ALL invited events for the list view
      const params = new URLSearchParams();

      // If user is authenticated, use their email
      if (session?.user?.email) {
        params.append('email', session.user.email);
      } else if (email) {
        params.append('email', email);
      } else if (userId) {
        params.append('userId', userId);
      }

      const queryString = params.toString();
      const url = `/api/attendee/events${queryString ? `?${queryString}` : ''}`;

      const response = await apiFetch(url);

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      setEvents(data?.data || []);
    } catch (err) {
      console.error('Error fetching invited events:', err);
      setError(err.message);
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

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.warn('Invalid date format:', dateString);
      return 'Invalid Date';
    }
  };

  const formatEventDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button
            onClick={fetchInvitedEvents}
            className="mt-4"
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 sm:p-6 text-white">
        <h1 className="text-xl sm:text-2xl font-bold mb-2">
          Your Invited Events
        </h1>
        <p className="text-blue-100 text-sm sm:text-base">
          Events you have been invited to attend
        </p>
        {events.length > 0 && (
          <p className="text-blue-200 text-xs mt-1">
            {events.length} event{events.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
            <p className="text-muted-foreground">
              You haven't been invited to any events yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {events.map((event) => {
            const userGuest = event.guests?.[0]; // Get the user's guest record
            return (
              <Card
                key={event.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="text-lg sm:text-xl mb-2">
                        {event.title}
                      </CardTitle>
                      {userGuest && (
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getStatusColor(userGuest.status)}>
                            {getStatusIcon(userGuest.status)}
                            <span className="ml-1">{userGuest.status}</span>
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Invited {formatDate(userGuest.invitedAt)}
                          </span>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const guestId = userGuest?.id;
                        if (guestId) {
                          router.push(
                            `/events/${event.id}/invitation/${guestId}`,
                          );
                        } else {
                          console.error('Guest ID not found');
                        }
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Event
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Event Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      {event.date && (
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          <span>{formatEventDate(event.date)}</span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                      {event.User && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">
                            Host: {event.User.name || event.User.email}
                          </span>
                        </div>
                      )}
                      {event.time && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{event.time}</span>
                        </div>
                      )}
                    </div>

                    {/* Event Description */}
                    {event.description && (
                      <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {event.description}
                        </p>
                      </div>
                    )}

                    {/* Event Image */}
                    {event.s3ImageUrl && (
                      <div className="pt-2">
                        <img
                          src={event.s3ImageUrl}
                          alt={event.title}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
