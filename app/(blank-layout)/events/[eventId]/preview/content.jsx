'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEventActions, useEvents } from '@/store/hooks';
import { format } from 'date-fns';
import { ArrowLeft, CalendarDays, Clock, MapPin, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { DEFAULT_MAP_CENTER } from '@/lib/constants';
import { getTimezoneAbbreviation } from '@/lib/date-utils';
import { Button } from '@/components/ui/button';
import { GoogleMap } from '@/components/location/google-map';

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

  const fetchEventData = useCallback(async () => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    try {
      setLoading(true);
      setError(null);

      const event = await fetchEventById(eventId).unwrap();
      setSelectedEvent(event);
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

  // Function to format time for display (12-hour format with AM/PM)
  const formatTimeForDisplay = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Map center logic
  const getMapCenter = () => {
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

            {/* Right Section - Event Preview label aligned to right edge */}
            <div className="flex items-center pr-2">
              <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
                Event Preview
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Reduced padding and better spacing */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pt-16 pb-4 sm:pt-20 sm:pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 lg:gap-4">
          {/* Event Design Preview - Takes 3 columns on LG screens */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              {/* Preview Content - Minimal padding for maximum content space */}
              <div className="p-2 sm:p-4">
                <div className="relative">
                  {eventData.s3ImageUrl ? (
                    <div className="flex justify-center items-center">
                      <div className="relative w-full">
                        {!imageLoaded && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                          </div>
                        )}
                        <img
                          src={eventData.s3ImageUrl}
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
                    <div className="w-full h-[250px] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-500 flex items-center justify-center">
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
          </div>

          {/* Event Details Sidebar - Premium Design with improved width */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden sticky top-20 backdrop-blur-sm">
              {/* Premium Header with Gradient */}
              <div className="relative px-6 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative">
                  <h2 className="text-xl font-bold text-white tracking-wide">
                    Event Details
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">
                    Complete event information
                  </p>
                </div>
              </div>

              {/* Premium Content */}
              <div className="p-6 space-y-6">
                {/* Event Title - Premium Styling */}
                <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-700">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight mb-2">
                    {eventData.title || 'Event Title'}
                  </h3>
                  {eventData.description && (
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                      {eventData.description}
                    </p>
                  )}
                </div>

                {/* Date & Time - Premium Card Design */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-blue-100 dark:border-slate-600">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-500 rounded-xl shadow-lg flex-shrink-0">
                      <CalendarDays className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">
                        Event Schedule
                      </p>
                      {eventData.startDateTime ? (
                        <div className="space-y-2">
                          <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                            {format(
                              new Date(eventData.startDateTime),
                              'EEEE, MMMM d, yyyy',
                            )}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <p className="text-base font-semibold text-blue-600 dark:text-blue-400">
                              {formatTimeForDisplay(
                                format(
                                  new Date(eventData.startDateTime),
                                  'HH:mm',
                                ),
                              )}
                            </p>
                          </div>
                          {eventData.endDateTime && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-600 px-2 py-1 rounded-md inline-block">
                              Until{' '}
                              {format(
                                new Date(eventData.endDateTime),
                                'MMM d, yyyy',
                              )}{' '}
                              at{' '}
                              {formatTimeForDisplay(
                                format(
                                  new Date(eventData.endDateTime),
                                  'HH:mm',
                                ),
                              )}
                            </p>
                          )}
                          {eventData.timezone && (
                            <div className="flex items-center gap-1 mt-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                {getTimezoneAbbreviation(eventData.timezone)}
                              </p>
                            </div>
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

                {/* Location - Premium Card Design */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-green-100 dark:border-slate-600">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-green-500 rounded-xl shadow-lg flex-shrink-0">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-widest mb-3">
                        Venue Location
                      </p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white leading-tight">
                        {eventData.locationAddress
                          ? `${eventData.locationAddress}${eventData.locationUnit ? `, ${eventData.locationUnit}` : ''}`
                          : 'Location not set'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Host - Premium Card Design */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-purple-100 dark:border-slate-600">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-purple-500 rounded-xl shadow-lg flex-shrink-0">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-3">
                        Event Host
                      </p>
                      <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                        {session?.user?.name || session?.user?.email || 'Host'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Map Preview - Premium Design */}
                {eventData.showMap && eventData.locationAddress && (
                  <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-slate-500 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">
                        Location Map
                      </h4>
                    </div>
                    <div className="h-52 w-full rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden shadow-lg">
                      <GoogleMap
                        center={getMapCenter()}
                        className="h-full w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventPreviewContent;
