'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEventActions, useEvents } from '@/store/hooks';
import { format } from 'date-fns';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  Clock,
  Clock as ClockIcon,
  Mail,
  MapPin,
  Pencil,
  Phone,
  User,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { DEFAULT_MAP_CENTER } from '@/lib/constants';
import { formatTimeInTimezone, getTimezoneOffset } from '@/lib/date-utils';
import { Button } from '@/components/ui/button';
import { GoogleMap } from '@/components/location/google-map';
import { geocodeAddressIfNeeded } from '@/lib/utils';

function EventPreviewContent() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId;
  const { data: session } = useSession();
  const { selectedEvent: eventData } = useEvents();
  const { updateSelectedEvent, fetchEventById, setSelectedEvent } =
    useEventActions();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const hasLoadedRef = useRef(false);

  // Guest list functionality - use guests from event data
  const guests = eventData?.guests || [];
  const guestsLoading = loading; // Use the same loading state as event data
  const guestsError = error; // Use the same error state as event data
  const [showAllGuests, setShowAllGuests] = useState(false);

  const fetchEventData = useCallback(async () => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    try {
      setLoading(true);
      setError(null);
        const event = await fetchEventById(eventId).unwrap();

        let eventWithMapCenter = event;
        if (event.showMap && event.locationAddress) {
            eventWithMapCenter = await geocodeAddressIfNeeded(event);
            console.log('Geocoded event:', eventWithMapCenter);
        }

        setSelectedEvent(eventWithMapCenter);
    } catch (err) {
      const errorMessage = err.message || 'Error loading event data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [eventId, fetchEventById, setSelectedEvent]);

  // Load existing event data
  useEffect(() => {
    if (eventId && !hasLoadedRef.current) {
      fetchEventData();
    } else if (eventData) {
      setLoading(false);
    }
  }, [eventId, eventData?.id, fetchEventData]);

  // Helper function to get guest status icon and color
  const getGuestStatusInfo = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
      case 'ACCEPTED':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          text: 'Confirmed',
        };
      case 'DECLINED':
      case 'REJECTED':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          text: 'Declined',
        };
      case 'PENDING':
      default:
        return {
          icon: ClockIcon,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          text: 'Pending',
        };
    }
  };

  // Helper function to get total guest count
  const getTotalGuestCount = () => {
    return (
      guests?.reduce((total, guest) => {
        return (
          total +
          (guest.adults || 1) +
          (guest.children || 0) +
          (guest.plusOnes || 0)
        );
      }, 0) || 0
    );
  };

  // Map center logic
    const getMapCenter = () => {
        console.log('Event Data for Map Center:', eventData);
    if (eventData?.mapCenter) {
      return eventData.mapCenter;
    }
    if (eventData?.locationAddress && !eventData?.mapCenter) {
      return DEFAULT_MAP_CENTER;
    }
    return DEFAULT_MAP_CENTER;
  };

  // Loading state
  if (loading || !eventData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event preview...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchEventData} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Enhanced Header - Fixed Position with Professional Design */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 shadow-lg">
        <div className="w-full">
          <div className="flex items-center justify-between h-16 px-0">
            {/* Left Section - Only Back button */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center space-x-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors px-4 py-2 rounded-none h-full"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium">Back</span>
              </Button>
            </div>

            {/* Right Section - Edit Event button aligned to right edge */}
            <div className="flex items-center pr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/events/${eventId}`)}
                className="flex items-center space-x-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors px-4 py-2 rounded-lg"
              >
                <Pencil className="w-4 h-4" />
                <span className="font-medium">Edit Event</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - New Layout Structure */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pt-4 pb-4 sm:pt-10 sm:pb-6">
        {/* Top Row: Event Thumbnail + Event Details (Side by Side) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
          {/* Left: Event Thumbnail Section */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4">
              {/* <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 text-center">
                Event Thumbnail
              </h3> */}
              <div className="relative">
                {eventData?.eventThumbnailUrl || eventData.s3ImageUrl ? (
                  <div className="flex justify-center items-center">
                    <div className="relative w-full">
                      {!imageLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                      <img
                        src={
                          eventData?.eventThumbnailUrl || eventData.s3ImageUrl
                        }
                        alt="Event Design Preview"
                        className={`w-full h-auto object-contain shadow-xl rounded-lg transition-opacity duration-300 ${
                          imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => setImageLoaded(true)}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div
                        className="hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-lg p-6 text-center min-h-[250px] items-center justify-center"
                        style={{ display: 'none' }}
                      >
                        <div className="w-12 h-12 bg-slate-300 dark:bg-slate-500 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg
                            className="w-6 h-6 text-slate-500 dark:text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <span className="text-slate-600 dark:text-slate-300 font-medium">
                          Event Design Preview
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-[300px] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-500 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-slate-300 dark:bg-slate-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg
                          className="w-6 h-6 text-slate-500 dark:text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                      </div>
                      <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-1">
                        No Preview Available
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Event design not available
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Event Details Section */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4">
              {/* Event Title */}
              <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-700 mb-4">
                <h4 className="text-xl font-bold text-slate-900 dark:text-white leading-tight mb-2">
                  {eventData.title || 'Event Title'}
                </h4>
                {eventData.description && (
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                    {eventData.description}
                  </p>
                )}
              </div>

              {/* Date & Time */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-3 border border-blue-100 dark:border-slate-600 mb-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-500 rounded-lg shadow-lg flex-shrink-0">
                    <CalendarDays className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">
                      Event Schedule
                    </p>
                    {eventData.startDateTime ? (
                      <div className="space-y-1">
                        <p className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                          {format(
                            new Date(eventData.startDateTime),
                            'EEEE, MMMM d, yyyy',
                          )}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-3 h-3 text-blue-500" />
                          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                            {formatTimeInTimezone(
                              eventData.startDateTime,
                              eventData.timezone || 'UTC',
                            )}
                          </p>
                        </div>
                        {eventData.endDateTime && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-600 px-2 py-1 rounded-md inline-block">
                            Until{' '}
                            {format(
                              new Date(eventData.endDateTime),
                              'MMM d, yyyy',
                            )}{' '}
                            at{' '}
                            {formatTimeInTimezone(
                              eventData.endDateTime,
                              eventData.timezone || 'UTC',
                            )}{' '}
                            {getTimezoneOffset(eventData.timezone || 'UTC')}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                        Date & time not set
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-3 border border-green-100 dark:border-slate-600 mb-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-green-500 rounded-lg shadow-lg flex-shrink-0">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-widest mb-2">
                      Venue Location
                    </p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                      {eventData.locationAddress
                        ? `${eventData.locationAddress}${eventData.locationUnit ? `, ${eventData.locationUnit}` : ''}`
                        : 'Location not set'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Host */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-3 border border-purple-100 dark:border-slate-600 mb-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-purple-500 rounded-lg shadow-lg flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-2">
                      Event Host
                    </p>
                    <p className="text-sm font-bold text-purple-700 dark:text-purple-300">
                      {session?.user?.name || session?.user?.email || 'Host'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Map Preview or Alternative Content */}
              {eventData.showMap && eventData.locationAddress ? (
                <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-3 border border-slate-200 dark:border-slate-600">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-slate-500 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">
                      Location Map
                    </h4>
                  </div>
                  <div className="h-48 w-full rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden shadow-lg">
                    <GoogleMap
                      center={getMapCenter()}
                      className="h-full w-full"
                    />
                  </div>
                </div>
              ) : (
                /* Alternative Content when map is not shown */
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-3 border border-amber-100 dark:border-slate-600">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                      <CalendarDays className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">
                      Event Highlights
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {/* Event Capacity Info */}
                    {eventData.limitEventCapacity && (
                      <div className="bg-white dark:bg-slate-700 rounded-lg p-2 border border-amber-200 dark:border-slate-600">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            Event Capacity
                          </span>
                          <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                            {eventData.maxEventCapacity || 'Unlimited'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* RSVP Settings */}
                    <div className="bg-white dark:bg-slate-700 rounded-lg p-3 border border-amber-200 dark:border-slate-600">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                            Plus Ones Allowed
                          </span>
                          <span
                            className={`text-sm font-bold ${eventData.allowPlusOnes ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                          >
                            {eventData.allowPlusOnes ? 'Yes' : 'No'}
                          </span>
                        </div>
                        {eventData.allowPlusOnes &&
                          eventData.maxPlusOnes > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                Max Plus Ones
                              </span>
                              <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                                {eventData.maxPlusOnes}
                              </span>
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Family Settings */}
                    <div className="bg-white dark:bg-slate-700 rounded-lg p-3 border border-amber-200 dark:border-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                          Family Headcount
                        </span>
                        <span
                          className={`text-sm font-bold ${eventData.allowFamilyHeadcount ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                        >
                          {eventData.allowFamilyHeadcount
                            ? 'Enabled'
                            : 'Disabled'}
                        </span>
                      </div>
                    </div>

                    {/* Maybe RSVP */}
                    <div className="bg-white dark:bg-slate-700 rounded-lg p-3 border border-amber-200 dark:border-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                          Maybe RSVP
                        </span>
                        <span
                          className={`text-sm font-bold ${eventData.allowMaybeRSVP ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                        >
                          {eventData.allowMaybeRSVP ? 'Allowed' : 'Not Allowed'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row: Invited Guest List (Full Width with Rounded Corners) */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl shadow-xl border border-indigo-100 dark:border-slate-600 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-indigo-500 rounded-xl shadow-lg flex-shrink-0">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Invited Guest List
                  </h3>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400">
                    {guests?.length || 0} Invited • {getTotalGuestCount()} Total
                    Guests
                  </p>
                </div>
              </div>
            </div>

            {guestsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-slate-600 dark:text-slate-300">
                  Loading guests...
                </span>
              </div>
            ) : guestsError ? (
              <div className="text-center py-12">
                <p className="text-red-600 dark:text-red-400 mb-2">
                  Error loading guests
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {guestsError}
                </p>
              </div>
            ) : !guests || guests.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-slate-600 dark:text-slate-300 font-medium mb-2">
                  No guests invited yet
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Start building your guest list to see them here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Guest Status Summary */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {['PENDING', 'CONFIRMED', 'DECLINED'].map((status) => {
                    const statusInfo = getGuestStatusInfo(status);
                    const count =
                      guests?.filter((g) => g.status?.toUpperCase() === status)
                        ?.length || 0;
                    const StatusIcon = statusInfo.icon;

                    return (
                      <div
                        key={status}
                        className={`${statusInfo.bgColor} ${statusInfo.borderColor} border rounded-xl p-4 text-center`}
                      >
                        <StatusIcon
                          className={`w-6 h-6 mx-auto mb-2 ${statusInfo.color}`}
                        />
                        <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
                          {count}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {statusInfo.text}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Guest List */}
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {(showAllGuests ? guests : guests.slice(0, 8)).map(
                    (guest, index) => {
                      const statusInfo = getGuestStatusInfo(guest.status);
                      const StatusIcon = statusInfo.icon;
                      const totalCount =
                        (guest.adults || 1) +
                        (guest.children || 0) +
                        (guest.plusOnes || 0);

                      return (
                        <div
                          key={guest.id || index}
                          className={`${statusInfo.bgColor} ${statusInfo.borderColor} border rounded-xl p-4 transition-all hover:shadow-md`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                                  <UserCheck className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-slate-900 dark:text-white truncate">
                                    {guest.name || 'Guest'}
                                  </p>
                                  <div className="space-y-1 text-sm text-slate-500 dark:text-slate-400">
                                    {guest.email && (
                                      <div className="flex items-center space-x-1">
                                        <Mail className="w-4 h-4 flex-shrink-0" />
                                        <span className="truncate min-w-0">
                                          {guest.email}
                                        </span>
                                      </div>
                                    )}
                                    {guest.phone && (
                                      <div className="flex items-center space-x-1">
                                        <Phone className="w-4 h-4 flex-shrink-0" />
                                        <span className="truncate min-w-0">
                                          {guest.phone}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 flex-shrink-0">
                              <div className="text-right">
                                <p className="text-base font-medium text-slate-900 dark:text-white">
                                  {totalCount}{' '}
                                  {totalCount === 1 ? 'guest' : 'guests'}
                                </p>
                                {guest.adults > 1 && (
                                  <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {guest.adults}A
                                    {guest.children > 0
                                      ? ` + ${guest.children}C`
                                      : ''}
                                    {guest.plusOnes > 0
                                      ? ` + ${guest.plusOnes}+`
                                      : ''}
                                  </p>
                                )}
                              </div>
                              <div
                                className={`flex items-center space-x-2 px-3 py-2 rounded-full ${statusInfo.bgColor} ${statusInfo.borderColor} border`}
                              >
                                <StatusIcon
                                  className={`w-4 h-4 ${statusInfo.color}`}
                                />
                                <span
                                  className={`text-sm font-medium ${statusInfo.color}`}
                                >
                                  {statusInfo.text}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>

                {/* Show More/Less Button */}
                {guests.length > 8 && (
                  <div className="text-center pt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllGuests(!showAllGuests)}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                    >
                      {showAllGuests
                        ? `Show Less`
                        : `Show All ${guests.length} Guests`}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventPreviewContent;
