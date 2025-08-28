'use client';

import { useEffect, useState } from 'react';
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
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events');
      const data = await response.json();

      if (data.success) {
        setEvents(data.data);
      } else {
        setError('Failed to fetch events');
      }
    } catch (err) {
      setError('Error loading events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <Button onClick={fetchEvents} variant="outline">
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
          <h2 className="text-lg font-semibold text-gray-900">My Event</h2>
          <p className="text-sm text-gray-600">
            Events you've been invited to or are participating in
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-blue-100 hover:bg-blue-200"
                    onClick={() => window.open(`/events/${event.id}`, '_blank')}
                  >
                    <Pencil className="h-4 w-4 text-blue-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-red-100 hover:bg-red-200"
                    onClick={() => {
                      // Handle delete
                      if (
                        confirm('Are you sure you want to delete this event?')
                      ) {
                        // Delete logic here
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
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
                  variant="secondary"
                  size="sm"
                  className="flex-1 bg-gray-700 hover:bg-gray-800 text-white"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Manage Guests
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  <Earth className="w-4 h-4 mr-2" />
                  Public Page
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
