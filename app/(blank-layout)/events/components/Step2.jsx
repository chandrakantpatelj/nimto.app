'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useEventActions, useEvents } from '@/store/hooks';
import { format } from 'date-fns';
import { CalendarDays, Clock, Info, MapPin, User } from 'lucide-react';
import { DEFAULT_MAP_CENTER } from '@/lib/constants';
import {
  formatTimeInTimezone,
  getTimezoneAbbreviation,
  getUserTimezone,
} from '@/lib/date-utils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SeparateDateTimeFields } from '@/components/ui/separate-datetime-fields';
import { Textarea } from '@/components/ui/textarea';
import { GoogleMap } from '@/components/location/google-map';
import LocationDrawer from '@/components/location/location-drawer';

function Step2({ thumbnailData, session }) {
  const { selectedEvent: eventData } = useEvents();
  const { updateSelectedEvent: updateEventData } = useEventActions();
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Set default timezone automatically using smart logic
  useEffect(() => {
    if (!eventData?.timezone) {
      // Smart timezone logic: User timezone > Browser timezone > UTC
      const smartTimezone =
        session?.user?.timezone || getUserTimezone() || 'UTC';
      updateEventData({ timezone: smartTimezone });
    }
  }, [eventData?.timezone, session?.user?.timezone, updateEventData]);

  // Geocode address when component loads or when address changes
  useEffect(() => {
    const geocodeAddress = async () => {
      // Always geocode if we have an address and not currently geocoding
      if (eventData?.locationAddress && !isGeocoding) {
        setIsGeocoding(true);
        try {
          if (window.google && window.google.maps) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode(
              { address: eventData.locationAddress },
              (results, status) => {
                if (status === 'OK' && results[0]) {
                  const location = results[0].geometry.location;
                  const mapCenter = {
                    lat: location.lat(),
                    lng: location.lng(),
                  };

                  updateEventData({ mapCenter });
                } else {
                  console.warn('Geocoding failed:', status);
                }
                setIsGeocoding(false);
              },
            );
          } else {
            // Wait for Google Maps to load
            const checkGoogleMaps = () => {
              if (window.google && window.google.maps) {
                geocodeAddress();
              } else {
                setTimeout(checkGoogleMaps, 100);
              }
            };
            checkGoogleMaps();
          }
        } catch (error) {
          console.warn('Error geocoding address:', error);
          setIsGeocoding(false);
        }
      }
    };

    geocodeAddress();
  }, [
    eventData?.locationAddress,
    eventData?.mapCenter,
    isGeocoding,
    updateEventData,
  ]);

  // Map center logic - use saved mapCenter or geocode the address
  const getMapCenter = () => {
    // If we have a saved mapCenter, use it
    if (eventData?.mapCenter) {
      return eventData.mapCenter;
    }

    // If we have a locationAddress but no mapCenter, return default for now
    // The geocoding will happen in the useEffect and update the mapCenter
    if (eventData?.locationAddress && !eventData?.mapCenter) {
      return DEFAULT_MAP_CENTER;
    }

    // Fallback to default
    return DEFAULT_MAP_CENTER;
  };
  // Function to format time for display (12-hour format with AM/PM)
  const formatTimeForDisplay = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Handle start date and time change
  const handleStartDateTimeChange = (dateTime) => {
    if (dateTime) {
      updateEventData({
        startDateTime: dateTime.toISOString(),
      });
      // Scroll to show event details card after selection
      setTimeout(() => scrollToEventDetails(), 100);
    } else {
      // Handle clearing the start date/time
      updateEventData({
        startDateTime: null,
      });
    }
  };

  // Handle end date and time change
  const handleEndDateTimeChange = (dateTime) => {
    if (dateTime) {
      updateEventData({
        endDateTime: dateTime.toISOString(),
      });
      // Scroll to show event details card after selection
      setTimeout(() => scrollToEventDetails(), 100);
    } else {
      // Handle clearing the end date/time
      updateEventData({
        endDateTime: null,
      });
    }
  };

  // Function to scroll left side to show event details card
  const scrollToEventDetails = () => {
    const eventDetailsCard = document.querySelector('.event-details-card');
    if (eventDetailsCard) {
      eventDetailsCard.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-var(--header-height))] bg-background">
      {/* Left Side - Preview */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Preview Content */}
        <div className="flex-1 p-2 sm:p-4 md:p-6 overflow-y-auto overflow-x-hidden">
          <div className="max-w-5xl mx-auto">
            {/* Template Preview */}
            <div className="mb-8">
              <div className="relative">
                {thumbnailData?.objectUrl || eventData.s3ImageUrl ? (
                  <div className="flex justify-center items-center bg-background">
                    <div className="max-w-lg w-full">
                      <img
                        src={thumbnailData?.objectUrl || eventData.s3ImageUrl}
                        alt="Event Design Preview"
                        className="w-full h-auto object-contain shadow-lg rounded-lg max-h-[80vh]"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div
                        className="hidden bg-muted rounded-lg p-8 text-center"
                        style={{ display: 'none' }}
                      >
                        <div className="w-16 h-16 bg-muted-foreground/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg
                            className="w-8 h-8 text-muted-foreground"
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
                        <span className="text-muted-foreground text-sm font-medium">
                          Event Design Preview
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-[400px] bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl border-2 border-dashed border-border flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-10 h-10 text-blue-500 dark:text-blue-400"
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
                      <h4 className="text-lg font-medium text-foreground mb-2">
                        No Preview Available
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Your event design will appear here
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Event Preview Card */}
            <div className="event-details-card bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
              {/* Event Banner */}
              <div className="relative h-56 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-background/95 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-border/50">
                    <h2 className="text-2xl font-bold text-foreground dark:text-white mb-2">
                      {eventData.title || 'Your Event Title'}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {eventData.description ||
                        'Event description will appear here'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                  {/* Date & Time */}
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl shadow-sm">
                      <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        WHEN
                      </p>
                      {eventData.startDateTime ? (
                        <div className="space-y-1">
                          <p className="text-base text-foreground font-medium">
                            {format(
                              new Date(eventData.startDateTime),
                              'EEEE, MMMM d, yyyy',
                            )}
                            <span className="text-gray-600">
                              ,{' '}
                              {formatTimeForDisplay(
                                format(
                                  new Date(eventData.startDateTime),
                                  'HH:mm',
                                ),
                              )}
                            </span>
                          </p>
                          {eventData.endDateTime && (
                            <p className="text-base text-foreground font-medium">
                              to{' '}
                              {format(
                                new Date(eventData.endDateTime),
                                'EEEE, MMMM d, yyyy',
                              )}
                              <span className="text-gray-600">
                                ,{' '}
                                {formatTimeForDisplay(
                                  format(
                                    new Date(eventData.endDateTime),
                                    'HH:mm',
                                  ),
                                )}
                              </span>
                            </p>
                          )}
                          {/* Timezone Information */}
                          {eventData.timezone && (
                            <div className="flex items-center gap-2 mt-2">
                              <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                                {getTimezoneAbbreviation(eventData.timezone)} •{' '}
                                {eventData.timezone.replace(/_/g, ' ')}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-base text-foreground font-medium">
                          Pick a date & time
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-xl shadow-sm">
                      <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        Location
                      </p>
                      <p className="text-base text-foreground font-medium">
                        {eventData.locationAddress
                          ? `${eventData.locationAddress}${eventData.locationUnit ? `, ${eventData.locationUnit}` : ''}`
                          : 'Add a location'}
                      </p>

                      {/* Map Preview in Event Details */}
                      {eventData.showMap && eventData.locationAddress && (
                        <div className="mt-3 h-48 w-full rounded-lg border border-gray-300">
                          <GoogleMap
                            center={getMapCenter()}
                            className="h-full w-full rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Host Details */}
                <div className="mt-8 pt-6 border-t border-border">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl shadow-sm">
                      <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        Host Details
                      </p>
                      <p className="text-base text-purple-600 dark:text-purple-400 font-semibold">
                        {session?.user?.name || session?.user?.email || 'Host'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Who's Coming */}
                {/* <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        Who's coming
                      </span>
                    </div>
                    <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors">
                      See all guests
                    </button>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Divider Line for Mobile */}
      <div className="w-full lg:hidden">
        <div className="h-px bg-border mx-4"></div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-96 xl:w-[420px] bg-card border-t lg:border-t-0 lg:border-l border-border flex flex-col overflow-hidden lg:mt-0 mt-4">
        {/* Form Header */}
        <div className="p-4 sm:p-6 border-b border-border bg-gradient-to-r from-muted/50 to-background flex-shrink-0">
          <h3 className="text-xl font-bold text-foreground dark:text-white mb-2">
            Edit Invitation Details
          </h3>
          <p className="text-sm text-muted-foreground">
            Fill in your event information
          </p>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6">
            {/* Event Title */}
            <div>
              <Label
                htmlFor="title"
                className="text-sm font-semibold text-foreground mb-3 block"
              >
                Event Title *
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="Enter your event title"
                value={eventData.title || ''}
                onChange={(e) => {
                  updateEventData({ title: e.target.value });
                  // Scroll to show event details card after a short delay
                  setTimeout(() => scrollToEventDetails(), 100);
                }}
                className="w-full h-12 px-4 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
              />
            </div>

            {/* Date & Time */}
            <div>
              <SeparateDateTimeFields
                startValue={eventData.startDateTime}
                endValue={eventData.endDateTime}
                onStartChange={handleStartDateTimeChange}
                onEndChange={handleEndDateTimeChange}
                className="border-gray-300 hover:border-blue-500 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
              />
            </div>

            {/* Location */}
            <div>
              <Label
                htmlFor="location"
                className="text-sm font-semibold text-foreground mb-3 block"
              >
                Location <span className="text-red-500">*</span>
              </Label>
              <LocationDrawer
                locationAddress={eventData.locationAddress || ''}
                locationUnit={eventData.locationUnit || ''}
                onChange={(locationData) => {
                  // If the address changed, clear the mapCenter to trigger geocoding
                  const shouldClearMapCenter =
                    locationData.address !== eventData.locationAddress;

                  updateEventData({
                    locationAddress: locationData.address,
                    locationUnit: locationData.unit,
                    showMap: locationData.showMap,
                    mapCenter: shouldClearMapCenter
                      ? null
                      : locationData.mapCenter,
                  });
                  setTimeout(() => scrollToEventDetails(), 100);
                }}
                placeholder="Add event location"
                className="w-full"
                initialShowMap={eventData.showMap || false}
                initialMapCenter={getMapCenter()}
              />
            </div>

            {/* Host Note */}
            <div>
              <Label
                htmlFor="description"
                className="text-sm font-semibold text-foreground mb-3 block"
              >
                Host Note
              </Label>
              <Textarea
                id="description"
                placeholder="Add additional details like parking info, contact number, venue requirements, dress code, entertainment schedule, etc."
                value={eventData.description || ''}
                onChange={(e) => {
                  updateEventData({ description: e.target.value });
                  // Scroll to show event details card after description change
                  setTimeout(() => scrollToEventDetails(), 100);
                }}
                className="w-full min-h-[120px] resize-none text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg p-4"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Step2;
