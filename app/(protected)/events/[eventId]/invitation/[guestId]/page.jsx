'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, CalendarDays, Clock, MapPin, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/api';
import { formatEventDate } from '@/lib/date-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RSVPForm from '@/components/rsvp/rsvp-form';

export default function EventInvitationPage() {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session } = useSession();
  const params = useParams();

  const eventId = params.eventId;
  const guestId = params.guestId;

  useEffect(() => {
    if (eventId && guestId) {
      fetchEventInvitation();
    }
  }, [eventId, guestId, session?.user?.email]);

  const fetchEventInvitation = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      params.append('eventId', eventId);

      // Use session email if available, otherwise the API will handle authentication
      if (session?.user?.email) {
        params.append('email', session.user.email);
      }

      const queryString = params.toString();
      const url = `/api/attendee/events?${queryString}`;

      const response = await apiFetch(url);

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      const events = data?.data || [];

      // Find the specific event
      const foundEvent = events.find((e) => e.id === eventId);

      if (!foundEvent) {
        throw new Error('Event not found or you are not invited to this event');
      }

      setEvent(foundEvent);
    } catch (err) {
      console.error('Error fetching event invitation:', err);
      setError(err.message);
    } finally {
      setLoading(false);
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
          <div className="mt-4 space-x-2">
            <Button onClick={fetchEventInvitation} variant="outline">
              Try Again
            </Button>
            <Link href="/invited-events">
              <Button variant="outline">Back to Invited Events</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Event Not Found</h2>
          <p className="text-muted-foreground">
            The event you're looking for doesn't exist or you don't have access
            to it.
          </p>
          <Link href="/invited-events">
            <Button className="mt-4" variant="outline">
              Back to Invited Events
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const userGuest = event.guests?.[0]; // Get the user's guest record

  const handleRSVPUpdate = (updatedGuest) => {
    // Update the event state with the new guest information
    setEvent((prevEvent) => ({
      ...prevEvent,
      guests: [updatedGuest],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Enhanced Header with Better Layout */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20"></div>
        <div className="relative z-10 px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            {/* Left Side - Back Button */}
            <div className="flex items-center">
              <Link href="/invited-events">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all duration-200 backdrop-blur-sm bg-white/10"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">
                    Back to Invited Events
                  </span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
            </div>

            {/* Center - Title */}
            <div className="flex-1 text-center px-4">
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                You're Invited! 🎉
              </h1>
              <p className="text-blue-100 text-xs sm:text-sm font-medium mt-1">
                ✨ Special Event Invitation
              </p>
            </div>

            {/* Right Side - Event Status Badge */}
            <div className="flex items-center">
              {userGuest && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      userGuest.status === 'CONFIRMED'
                        ? 'bg-green-400'
                        : userGuest.status === 'PENDING'
                          ? 'bg-yellow-400'
                          : userGuest.status === 'DECLINED'
                            ? 'bg-red-400'
                            : 'bg-gray-400'
                    }`}
                  ></div>
                  <span className="text-white text-xs font-medium capitalize">
                    {userGuest.status || 'Pending'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Enhanced Decorative Elements */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-10 -translate-x-10"></div>
        <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-white/20 rounded-full"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white/30 rounded-full"></div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column - Event Image Only */}
          <div>
            {(event.eventThumbnailUrl || event.s3ImageUrl) && (
              <Card className="border-0 shadow-xl overflow-hidden h-full">
                <CardContent className="p-0">
                  <div className="relative w-full h-full min-h-[500px] lg:min-h-[600px] overflow-hidden">
                    <img
                      src={event.eventThumbnailUrl || event.s3ImageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    {/* Enhanced overlay with gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                    {/* Decorative border */}
                    <div className="absolute inset-0 border-4 border-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg"></div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Wedding Invitation & RSVP */}
          <div className="space-y-4">
            {/* Wedding Invitation Card */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/30">
              <CardHeader className="bg-gradient-to-r from-blue-400 to-purple-400 text-white rounded-t-lg">
                <div className="flex items-center justify-between gap-4">
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <div className="w-2 h-8 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full"></div>
                    {event.title}
                  </CardTitle>
                  {userGuest && (
                    <div className="text-right flex-shrink-0">
                      <span className="text-blue-100 text-sm font-medium whitespace-nowrap">
                        Invited {formatDate(userGuest.invitedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Event Details - Improved Layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {event.startDateTime && (
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                        <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-200">
                          <CalendarDays className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-blue-900 text-xs block mb-1">
                            Event Date
                          </span>
                          <p className="text-blue-700 font-medium text-sm truncate">
                            {formatEventDate(event.startDateTime)}
                          </p>
                        </div>
                      </div>
                    )}
                    {(event.locationAddress || event.locationUnit) && (
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                        <div className="p-2.5 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-200">
                          <MapPin className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-red-900 text-xs block mb-1">
                            Location
                          </span>
                          <p className="text-red-700 font-medium text-sm truncate">
                            {event.locationAddress}
                            {event.locationUnit
                              ? `, ${event.locationUnit}`
                              : ''}
                          </p>
                        </div>
                      </div>
                    )}
                    {event.User && (
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                        <div className="p-2.5 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-200">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-green-900 text-xs block mb-1">
                            Host
                          </span>
                          <p className="text-green-700 font-medium text-sm truncate">
                            {event.User.name || event.User.email}
                          </p>
                        </div>
                      </div>
                    )}
                    {event.time && (
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                        <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-200">
                          <Clock className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-purple-900 text-xs block mb-1">
                            Time
                          </span>
                          <p className="text-purple-700 font-medium text-sm truncate">
                            {event.time}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Event Description */}
                  {event.description && (
                    <div className="pt-4 border-t border-gradient-to-r from-blue-200 to-purple-200">
                      <h3 className="font-bold mb-3 text-lg bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent flex items-center gap-2">
                        <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                        About This Event
                      </h3>
                      <div className="p-3 bg-gradient-to-br from-gray-50 to-blue-50/50 rounded-lg border border-gray-100">
                        <p className="text-gray-700 leading-relaxed font-medium text-sm">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* RSVP Form */}
            <RSVPForm
              event={event}
              userGuest={userGuest}
              onRSVPUpdate={handleRSVPUpdate}
              session={session}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
