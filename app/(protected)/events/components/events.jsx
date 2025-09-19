'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  CalendarCheck,
  CalendarDays,
  Clock,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { formatDate, formatTime } from '@/lib/date-utils';
import { toAbsoluteUrl } from '@/lib/helpers';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState(null);

  // Fetch events from API
  const fetchEvents = async (search = '') => {
    try {
      setLoading(true);
      setError(null);

      const url = search
        ? `/api/events?search=${encodeURIComponent(search)}`
        : '/api/events';

      const response = await apiFetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const result = await response.json();

      if (result.success) {
        setEvents(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch events');
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete event function
  const deleteEvent = async (eventId) => {
    try {
      setDeletingEventId(eventId);
      setDeleteLoading(true);

      const response = await apiFetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      const result = await response.json();

      if (result.success) {
        // Remove the deleted event from the list
        setEvents(events.filter((event) => event.id !== eventId));
        setShowDeleteDialog(false);
        setEventToDelete(null);
      } else {
        throw new Error(result.error || 'Failed to delete event');
      }
    } catch (err) {
      console.error('Error deleting event:', err);
      setError(err.message);
    } finally {
      setDeleteLoading(false);
      setDeletingEventId(null);
    }
  };

  // Handle delete button click
  const handleDeleteClick = (event) => {
    setEventToDelete(event);
    setShowDeleteDialog(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (eventToDelete) {
      deleteEvent(eventToDelete.id);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchEvents(query);
  };

  // Initial fetch
  useEffect(() => {
    fetchEvents();
  }, []);

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
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
          <Button onClick={() => fetchEvents()} variant="outline">
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
            <h3 className="text-2xl font-bold text-gray-900">
              No Events Found
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {searchQuery
                ? `No events match your search for "${searchQuery}". Try adjusting your search terms.`
                : 'There are no events in the system yet. Create the first event to get started.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  fetchEvents();
                }}
              >
                <Search className="w-4 h-4 mr-2" />
                Clear Search
              </Button>
            )}
            <Button variant="primary" asChild>
              <Link href="/events/select-template">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Link>
            </Button>
          </div>

          {/* Additional Info */}
          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              As an admin, you can view and manage all events in the system.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-stretch gap-4 lg:gap-6.5">
        {/* Search Bar */}
        <div className="relative">
          <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search by title, location, or organizer..."
            value={searchQuery}
            onChange={handleSearch}
            className="ps-9 w-95"
          />
        </div>

        {/* Events Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              All Events ({events.length})
            </h2>
            <p className="text-sm text-gray-600">
              Manage and monitor all events in the system
            </p>
          </div>
          <Button variant="primary" asChild>
            <Link href="/events/select-template">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Link>
          </Button>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 lg:gap-4.5">
          {events.map((event) => {
            const isDeleting = deletingEventId === event.id;

            return (
              <Card
                key={event.id}
                className={`rounded-xl relative overflow-hidden hover:shadow-lg transition-shadow duration-200 ${
                  isDeleting ? 'opacity-50' : ''
                }`}
              >
                {isDeleting && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-xl">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">
                        Deleting...
                      </p>
                    </div>
                  </div>
                )}

                {/* Event Image */}
                {event.s3ImageUrl && (
                  <div className="aspect-video bg-gray-100 overflow-hidden">
                    <img
                      src={event.s3ImageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-semibold line-clamp-2">
                      {event.title}
                    </CardTitle>
                    <Badge className={getStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                  </div>
                  {event.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Event Details */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarDays className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>
                        {formatDate(event.startDateTime, {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    {event.startDateTime && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{formatTime(event.startDateTime)}</span>
                      </div>
                    )}

                    {event.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    )}

                    {event.guests && event.guests.length > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{event.guests.length} guests</span>
                      </div>
                    )}
                  </div>

                  {/* Event Organizer */}
                  {event.User && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Organized by {event.User.name}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Pencil className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteClick(event)}
                      disabled={deleteLoading || isDeleting}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{eventToDelete?.title}"? This
              action cannot be undone and will permanently remove the event and
              all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Events;
