'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle,
  Clock,
  Eye,
  Gift,
  Heart,
  MapPin,
  PartyPopper,
  Share2,
  Sparkles,
  User,
  XCircle,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/api';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
      const url = queryString
        ? `/api/attendee/events?${queryString}`
        : '/api/attendee/events';

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

  const getStatusBadgeClass = (status) => {
    if (status === 'CONFIRMED') {
      return 'bg-green-500 hover:bg-green-600';
    }
    if (status === 'PENDING') {
      return 'bg-yellow-500 hover:bg-yellow-600';
    }
    return 'bg-red-500 hover:bg-red-600';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Minimal Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Invited Events
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {events.length > 0
                  ? `${events.length} event${events.length !== 1 ? 's' : ''} waiting for your response`
                  : 'No pending invitations'}
              </p>
            </div>
            {events.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {events.length} New
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Events List */}
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <CalendarDays className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No invitations yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
              When you receive event invitations, they'll appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {events.map((event) => {
              const userGuest = event.guests?.[0];

              return (
                <Card
                  key={event.id}
                  className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 rounded-xl"
                >
                  {/* Event Image Container - Full Focus */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {event.eventThumbnailUrl || event.s3ImageUrl ? (
                      <>
                        <img
                          src={event.eventThumbnailUrl || event.s3ImageUrl}
                          alt={event.title}
                          className="w-full h-full object-contain bg-gray-50 dark:bg-gray-900 group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        {/* Fallback for broken images */}
                        <div
                          className="w-full h-full bg-gray-100 dark:bg-gray-800 items-center justify-center"
                          style={{ display: 'none' }}
                        >
                          <div className="text-center p-8">
                            <CalendarDays className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                            <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
                              {event.title}
                            </p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <div className="text-center p-8">
                          <CalendarDays className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                          <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
                            {event.title}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Status Badge - Top Left */}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-gray-600 hover:bg-gray-700 text-white border-0 shadow-lg font-medium px-3 py-1">
                        INVITED
                      </Badge>
                    </div>

                    {/* Status Indicator - Top Right */}
                    <div className="absolute top-4 right-4">
                      {userGuest && (
                        <div
                          className={`w-3 h-3 rounded-full shadow-lg ${
                            userGuest.status === 'CONFIRMED'
                              ? 'bg-green-500'
                              : userGuest.status === 'PENDING'
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                          }`}
                        ></div>
                      )}
                    </div>

                    {/* Dark Overlay Section - Bottom */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent p-5">
                      {/* Event Title */}
                      <h3 className="text-white font-bold text-lg mb-3 drop-shadow-md">
                        {event.title}
                      </h3>

                      {/* Event Details */}
                      <div className="space-y-2 mb-4">
                        {event.date && (
                          <div className="flex items-center gap-2 text-white text-sm drop-shadow-sm">
                            <CalendarDays className="h-4 w-4" />
                            <span className="font-medium">
                              {formatEventDate(event.date)}
                            </span>
                            {event.time && (
                              <>
                                <span className="text-white/60">•</span>
                                <span className="font-medium">
                                  {event.time}
                                </span>
                              </>
                            )}
                          </div>
                        )}

                        {event.location && (
                          <div className="flex items-center gap-2 text-white text-sm drop-shadow-sm">
                            <MapPin className="h-4 w-4" />
                            <span className="font-medium truncate">
                              {event.location}
                            </span>
                          </div>
                        )}

                        {event.User && (
                          <div className="flex items-center gap-2 text-white text-sm drop-shadow-sm">
                            <User className="h-4 w-4" />
                            <span className="font-medium">
                              by {event.User.name || event.User.email}
                            </span>
                          </div>
                        )}

                        {/* Guest Count */}
                        <div className="flex items-center gap-2 text-white/90 text-sm">
                          <div className="flex -space-x-1">
                            <div className="w-5 h-5 bg-white/20 rounded-full border border-white/30 flex items-center justify-center">
                              <User className="h-3 w-3" />
                            </div>
                            <div className="w-5 h-5 bg-white/20 rounded-full border border-white/30 flex items-center justify-center">
                              <User className="h-3 w-3" />
                            </div>
                          </div>
                          <span className="font-medium">1 guest</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm transition-all duration-200 rounded-md py-2 font-medium text-sm"
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
                        View Event Details
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
