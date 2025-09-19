'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft, CalendarDays, Clock, MapPin, User } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import {
  getCategoryTheme,
  getFallbackGradientClasses,
  getHeaderGradientClasses,
} from '@/lib/category-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RSVPForm from '@/components/rsvp/rsvp-form';

export default function PublicEventInvitationPage() {
  const [event, setEvent] = useState(null);
  const [guest, setGuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const params = useParams();

  const eventId = params.eventId;
  const guestId = params.guestId;

  useEffect(() => {
    if (eventId && guestId) {
      fetchEventAndGuest();
    }
  }, [eventId, guestId]);

  const fetchEventAndGuest = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, get the guest record to get the email
      const guestResponse = await apiFetch(`/api/public/guests/${guestId}`);

      if (!guestResponse.ok) {
        const errorData = await guestResponse.json().catch(() => ({}));
        const errorInfo = {
          message: errorData.message || 'Guest invitation not found or invalid',
          errorType: errorData.errorType || 'UNKNOWN_ERROR',
          originalError: errorData.error || 'Unknown error'
        };
        throw errorInfo;
      }

      const guestData = await guestResponse.json();
      const guestRecord = guestData.data;

      if (!guestRecord || guestRecord.eventId !== eventId) {
        const error = new Error('The invitation link appears to be corrupted or invalid. Please check the link and try again.');
        error.errorType = 'INVALID_LINK';
        error.originalError = 'Invalid invitation link';
        throw error;
      }

      setGuest(guestRecord);

      // The guest record includes event information, so we can use it directly
      const eventWithGuest = {
        ...guestRecord.event,
        guests: [guestRecord], // Include the guest data in the event
      };

      setEvent(eventWithGuest);
    } catch (err) {
      console.error('Error fetching invitation:', {
        eventId,
        guestId,
        error: err,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
      setError(err);
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
      console.warn('Invalid date format:', dateString, error);
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
      console.warn('Invalid date format:', dateString, error);
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
    const getErrorIcon = (errorType) => {
      switch (errorType) {
        case 'EVENT_CANCELLED':
          return '❌';
        case 'EVENT_COMPLETED':
          return '✅';
        case 'EVENT_REMOVED':
          return '🗑️';
        case 'EVENT_NOT_FOUND':
          return '🔍';
        case 'INVALID_INVITATION':
          return '🔗';
        case 'INVALID_LINK':
          return '⚠️';
        default:
          return '❓';
      }
    };

    const getErrorTitle = (errorType) => {
      switch (errorType) {
        case 'EVENT_CANCELLED':
          return 'Event Cancelled';
        case 'EVENT_COMPLETED':
          return 'Event Completed';
        case 'EVENT_REMOVED':
          return 'Event Removed';
        case 'EVENT_NOT_FOUND':
          return 'Event Not Found';
        case 'INVALID_INVITATION':
          return 'Invalid Invitation';
        case 'INVALID_LINK':
          return 'Invalid Link';
        default:
          return 'Error';
      }
    };

    const getErrorSuggestions = (errorType) => {
      switch (errorType) {
        case 'EVENT_CANCELLED':
          return [
            'Contact the event organizer for more information',
            'Check if the event has been rescheduled',
            'Look for alternative events on our platform'
          ];
        case 'EVENT_COMPLETED':
          return [
            'This event has already taken place',
            'Check with the organizer for future events',
            'Browse other upcoming events on our platform',
            'Thank you for your interest in the event!'
          ];
        case 'EVENT_REMOVED':
          return [
            'The host/organizer may have deleted this event',
            'Contact the organizer directly for updates',
            'The event may have been removed from the platform',
            'Browse other available events'
          ];
        case 'EVENT_NOT_FOUND':
          return [
            'The event may have been deleted by the host',
            'Check with the person who sent you this invitation',
            'Verify the invitation link is correct',
            'The host account may have been removed'
          ];
        case 'INVALID_INVITATION':
          return [
            'Double-check the invitation link',
            'Contact the event organizer for a new invitation',
            'Make sure you\'re using the correct link'
          ];
        case 'INVALID_LINK':
          return [
            'Copy and paste the link again',
            'Check for any missing characters',
            'Ask the organizer to resend the invitation'
          ];
        default:
          return [
            'Try refreshing the page',
            'Check your internet connection',
            'Contact support if the problem persists'
          ];
      }
    };

    const errorType = error.errorType || 'UNKNOWN_ERROR';
    const errorMessage = error.message || (typeof error === 'string' ? error : 'An unexpected error occurred');
    const suggestions = getErrorSuggestions(errorType);

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-slate-900/50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <Card className="border-0 shadow-2xl bg-white dark:bg-gray-800">
            <CardContent className="p-8 text-center">
              {/* Error Icon */}
              <div className="text-6xl mb-6">
                {getErrorIcon(errorType)}
              </div>
              
              {/* Error Title */}
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {getErrorTitle(errorType)}
              </h1>
              
              {/* Error Message */}
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                {errorMessage}
              </p>
              
              {/* Suggestions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">
                  What you can do:
                </h3>
                <ul className="text-left space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <li key={`suggestion-${index}-${suggestion.slice(0, 20)}`} className="flex items-start gap-3 text-blue-800 dark:text-blue-200">
                      <span className="text-blue-500 dark:text-blue-400 mt-1">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={fetchEventAndGuest} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  🔄 Try Again
                </Button>
                <Link href="/">
                  <Button className="flex items-center gap-2">
                    🏠 Go to Home
                  </Button>
                </Link>
              </div>
              
              {/* Contact Information */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Need help? Contact our support team or reach out to the event organizer.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!event || !guest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-slate-900/50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <Card className="border-0 shadow-2xl bg-white dark:bg-gray-800">
            <CardContent className="p-8 text-center">
              {/* Error Icon */}
              <div className="text-6xl mb-6">
                🔍
              </div>
              
              {/* Error Title */}
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Invitation Not Found
              </h1>
              
              {/* Error Message */}
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                The invitation you're looking for doesn't exist or is no longer
            valid. This could happen if the event has been completed, cancelled, removed by the host, or the invitation link is incorrect.
              </p>
              
              {/* Suggestions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">
                  What you can do:
                </h3>
                <ul className="text-left space-y-2">
                  <li className="flex items-start gap-3 text-blue-800 dark:text-blue-200">
                    <span className="text-blue-500 dark:text-blue-400 mt-1">•</span>
                    <span>Check with the person who sent you this invitation</span>
                  </li>
                  <li className="flex items-start gap-3 text-blue-800 dark:text-blue-200">
                    <span className="text-blue-500 dark:text-blue-400 mt-1">•</span>
                    <span>Verify the invitation link is complete and correct</span>
                  </li>
                  <li className="flex items-start gap-3 text-blue-800 dark:text-blue-200">
                    <span className="text-blue-500 dark:text-blue-400 mt-1">•</span>
                    <span>Contact the event organizer for a new invitation</span>
                  </li>
                  <li className="flex items-start gap-3 text-blue-800 dark:text-blue-200">
                    <span className="text-blue-500 dark:text-blue-400 mt-1">•</span>
                    <span>The host may have deleted the event or their account</span>
                  </li>
                </ul>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={fetchEventAndGuest} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  🔄 Try Again
                </Button>
                <Link href="/">
                  <Button className="flex items-center gap-2">
                    🏠 Go to Home
                  </Button>
                </Link>
              </div>
              
              {/* Contact Information */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Need help? Contact our support team or reach out to the event organizer.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const userGuest = event.guests?.[0] || guest; // Use the guest from event or fallback to direct guest

  // Get category from template or default
  const category = event?.Template?.category || 'default';
  const categoryTheme = getCategoryTheme(category);

  const handleRSVPUpdate = (updatedGuest) => {
    // Update the event state with the new guest information
    setEvent((prevEvent) => ({
      ...prevEvent,
      guests: [updatedGuest],
    }));
    setGuest(updatedGuest);
  };

  // Create a session-like object for the RSVPForm (since it expects session data)
  const guestSession = {
    user: {
      name: guest.name,
      email: guest.email,
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-slate-900/50">
      {/* Enhanced Header with Better Layout */}
      <div
        className={`${getHeaderGradientClasses(category)} text-white shadow-xl relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 px-4 sm:px-6 py-6">
          <div className="max-w-7xl mx-auto">
            {/* Mobile-first layout */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Back Button */}
              <div className="flex items-center">
                <Link href="/">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all duration-200 backdrop-blur-sm bg-white/10"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </div>

              {/* Title - Center on larger screens, left-aligned on mobile */}
              <div className="text-center sm:flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  You're Invited! {categoryTheme.icon}
                </h1>
                <p className="text-blue-100 text-sm sm:text-base font-medium mt-1">
                  ✨ {categoryTheme.name} Event Invitation
                </p>
              </div>

              {/* Status Badge - Hidden on mobile, shown in guest card instead */}
              <div className="hidden sm:flex items-center">
                {userGuest && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
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
                    <span className="text-white text-sm font-medium capitalize">
                      {userGuest.status || 'Pending'}
                    </span>
                  </div>
                )}
              </div>
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
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Event Image Section - Full Width */}
        <div className="mb-8">
          <Card className="border-0 shadow-2xl overflow-hidden">
            <CardContent className="p-0">
              {event.s3ImageUrl ? (
                <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] overflow-hidden">
                  <img
                    src={event.s3ImageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  {/* Enhanced overlay with gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  {/* Event title overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 drop-shadow-lg">
                      {event.title}
                    </h2>
                    <p className="text-lg sm:text-xl opacity-90 drop-shadow">
                      {formatEventDate(event.startDateTime)}{' '}
                      {event.startDateTime &&
                        `• ${format(new Date(event.startDateTime), 'h:mm a')}`}
                    </p>
                  </div>
                </div>
              ) : (
                /* Fallback when no image */
                <div
                  className={`relative w-full h-[200px] sm:h-[250px] ${getFallbackGradientClasses(category)} flex items-center justify-center`}
                >
                  <div className="text-center text-white p-6">
                    <div className="mb-3 text-4xl sm:text-5xl">
                      {categoryTheme.icon}
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 drop-shadow-lg">
                      {event.title}
                    </h2>
                    <p className="text-lg sm:text-xl opacity-90 drop-shadow">
                      {formatEventDate(event.startDateTime)}{' '}
                      {event.startDateTime &&
                        `• ${format(new Date(event.startDateTime), 'h:mm a')}`}
                    </p>
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 dark:bg-white/20 rounded-full"></div>
                  <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/5 dark:bg-white/10 rounded-full"></div>
                  <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-white/20 dark:bg-white/30 rounded-full"></div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid - Event Details & RSVP */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Event Details */}
          <div className="xl:col-span-2">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-slate-800/50 dark:border-gray-700">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <CalendarDays className="h-6 w-6" />
                  Event Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 dark:text-gray-100">
                <div className="space-y-6">
                  {/* Event Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-100 dark:border-blue-800 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
                        <CalendarDays className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <span className="font-semibold text-blue-900 dark:text-blue-300 text-sm block mb-1">
                          Date
                        </span>
                        <p className="text-blue-700 dark:text-blue-200 font-medium">
                          {formatEventDate(event.startDateTime)}
                        </p>
                      </div>
                    </div>

                    {event.startDateTime && (
                      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg border border-purple-100 dark:border-purple-800 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg">
                          <Clock className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <span className="font-semibold text-purple-900 dark:text-purple-300 text-sm block mb-1">
                            Time
                          </span>
                          <p className="text-purple-700 dark:text-purple-200 font-medium">
                            {format(new Date(event.startDateTime), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    )}

                    {event.location && (
                      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg border border-red-100 dark:border-red-800 shadow-sm hover:shadow-md transition-all duration-300 sm:col-span-2">
                        <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg">
                          <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <span className="font-semibold text-red-900 dark:text-red-300 text-sm block mb-1">
                            Location
                          </span>
                          <p className="text-red-700 dark:text-red-200 font-medium">
                            {event.location}
                          </p>
                        </div>
                      </div>
                    )}

                    {event.User && (
                      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-100 dark:border-green-800 shadow-sm hover:shadow-md transition-all duration-300 sm:col-span-2">
                        <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <span className="font-semibold text-green-900 dark:text-green-300 text-sm block mb-1">
                            Hosted by
                          </span>
                          <p className="text-green-700 dark:text-green-200 font-medium">
                            {event.User.name || event.User.email}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Event Description */}
                  {event.description && (
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-600">
                      <h3 className="font-bold mb-4 text-xl text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                        About This Event
                      </h3>
                      <div className="p-4 bg-gradient-to-br from-gray-50 to-blue-50/50 dark:from-gray-700/50 dark:to-blue-900/20 rounded-lg border border-gray-100 dark:border-gray-600">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - RSVP Form */}
          <div className="xl:col-span-1">
            {/* Guest Status Card */}
            {userGuest && (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-slate-800/50 dark:border-gray-700 mb-6">
                <CardHeader className="bg-gradient-to-r from-blue-400 to-purple-400 text-white rounded-t-lg pb-4">
                  <CardTitle className="text-lg font-bold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Your Invitation
                    </span>
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
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
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 dark:text-gray-100">
                  <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      <strong>Invited as:</strong> {userGuest.name}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Invited {formatDate(userGuest.invitedAt)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* RSVP Form */}
            <RSVPForm
              event={event}
              userGuest={userGuest}
              onRSVPUpdate={handleRSVPUpdate}
              session={guestSession}
            />
          </div>
        </div>

        {/* Mobile-friendly spacing */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}
