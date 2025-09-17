'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEventActions, useEvents } from '@/store/hooks';
import {
  Calendar,
  CalendarDays,
  Clock,
  Earth,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function AttendeeEventContent() {
  const router = useRouter();

  // Redux state and actions
  const { events: allEvents, isLoading: loading, error } = useEvents();
  const { fetchAllEvents, setSelectedEvent } = useEventActions();

  // Filter events to only show published ones for attendees
  const events = allEvents.filter((event) => event.status === 'PUBLISHED');

  useEffect(() => {
    // Fetch all events using Redux action (attendees see only published events)
    fetchAllEvents().catch((err) => {
      console.error('Failed to fetch events:', err);
    });
  }, [fetchAllEvents]);

  const handleTemplateSelect = (event) => {
    // Initialize selectedEvent with template data
    setSelectedEvent({
      templateId: event.id,
      jsonContent: event.jsonContent || '',
      backgroundStyle: event.backgroundStyle || '',
      htmlContent: event.htmlContent || '',
      background: event.background || '',
      pageBackground: event.pageBackground || '',
      imagePath: event.imagePath || '',
      s3ImageUrl: event.s3ImageUrl || '',
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      status: event.status,
      guests: event.guests,
    });

    // Navigate to design page
    router.push(`/events/${event.id}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <Calendar className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Error Loading Events
          </h3>
          <p className="text-gray-600 max-w-md">{error}</p>
          <Button onClick={fetchAllEvents} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-center space-y-6 max-w-md">
          {/* Empty State Icon */}
          <div className="relative">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center">
              <Calendar className="w-12 h-12 text-blue-600" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Plus className="w-4 h-4 text-blue-600" />
            </div>
          </div>

          {/* Empty State Content */}
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-gray-900">No Events Yet</h3>
            <p className="text-gray-600 leading-relaxed">
              You haven't been invited to any events yet. When you receive
              invitations, they'll appear here for you to view and respond to.
            </p>
          </div>

          {/* Additional Info */}
          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help? Contact your event organizer or administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Events Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Public Events</h2>
          <p className="text-sm text-gray-600">
            Browse published events in the system
          </p>
        </div>
      </div>

      {/* Search Bar */}
      {/* <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name, email, or role..."
          className="pl-10"
        />
      </div> */}

      {/* Events Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
        {events.map((event) => (
          <Card
            key={event.id}
            className="overflow-hidden hover:shadow-lg transition-shadow duration-200"
          >
            {/* Event Banner */}
            <div className="h-32 relative overflow-hidden">
              {event.s3ImageUrl ? (
                <img
                  src={event.s3ImageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center">
                  <div className="text-center">
                    <h3
                      className="text-white text-lg font-semibold"
                      style={{ fontFamily: 'cursive' }}
                    >
                      {event.title}
                    </h3>
                    <p className="text-blue-200 text-sm mt-1">Event Details</p>
                  </div>
                </div>
              )}
              {/* Banner Text Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <h3
                    className="text-white text-lg font-semibold"
                    style={{ fontFamily: 'cursive' }}
                  >
                    {event.title}
                  </h3>
                  {event.description &&
                    event.description.trim() &&
                    event.description !== 'iiioioooo' && (
                      <p className="text-blue-200 text-sm mt-1">
                        {event.description}
                      </p>
                    )}
                </div>
              </div>
            </div>

            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base font-semibold text-gray-900">
                  {event.category || 'Event'}
                </CardTitle>
                <Badge className="bg-green-100 text-green-800">
                  {event.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Event Details */}
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <CalendarDays className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{formatDate(event.date)}</span>
                </div>

                {event.time && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{formatTime(event.time)}</span>
                  </div>
                )}

                {event.location &&
                  event.location.trim() &&
                  event.location !== 'llll' && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  )}

                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>0 Accepted / {event.guests?.length || 0} Invited</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-blue-500 text-blue-600 hover:bg-blue-50"
                  onClick={() => handleTemplateSelect(event)}
                >
                  <Earth className="w-4 h-4 mr-2" />
                  View Event
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
