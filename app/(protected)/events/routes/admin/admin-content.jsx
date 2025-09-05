'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEventActions } from '@/store/hooks';
import {
  CalendarDays,
  Clock,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import DeleteEvent from '../../components/delete-event';

export function AdminEventContent() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deletingEventId, setDeletingEventId] = useState(null);
  const { setSelectedEvent: setEventForEdit } = useEventActions();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Super Admin can see all events - no filtering needed
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
  const handleTemplateSelect = (event) => {
    // Initialize selectedEvent with template data
    setEventForEdit({
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

  const handleDeleteClick = (event) => {
    setSelectedEvent(event);
    setShowDeleteDialog(true);
  };

  const handleDeleteStart = (eventId) => {
    setDeletingEventId(eventId);
  };

  const handleEventDeleted = () => {
    // Event is already deleted by DeleteEvent component
    // Just refresh the events list
    fetchEvents();
    setShowDeleteDialog(false);
    setSelectedEvent(null);
    setDeletingEventId(null);
  };

  const handleDeleteFailed = (eventId) => {
    // Stop the loading state for the failed event
    setDeletingEventId(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
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

  const getCategoryColor = (category) => {
    switch (category?.toUpperCase()) {
      case 'CONFERENCE':
        return 'bg-blue-100 text-blue-800';
      case 'BIRTHDAY':
        return 'bg-pink-100 text-pink-800';
      case 'CHARITY GALA':
        return 'bg-purple-100 text-purple-800';
      case 'WORKSHOP':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEvents = events.filter(
    (event) =>
      event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
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
          <h3 className="text-lg font-semibold text-gray-900">
            Error Loading Events
          </h3>
          <p className="text-gray-600">{error}</p>
          <Button onClick={fetchEvents} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (filteredEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            No Events Found
          </h3>
          <p className="text-gray-600">
            {searchQuery
              ? 'No events match your search criteria.'
              : 'No events have been created yet.'}
          </p>
          {searchQuery && (
            <Button onClick={() => setSearchQuery('')} variant="outline">
              Clear Search
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            All Events ({filteredEvents.length})
          </h2>
          <p className="text-sm text-gray-600">
            Manage and monitor all events in the system
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search events by title, description, or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => {
          // Show skeleton loader if this event is being deleted
          if (deletingEventId === event.id) {
            return (
              <Card key={event.id} className="overflow-hidden">
                <div className="animate-pulse">
                  <div className="aspect-video bg-gray-200"></div>
                  <CardHeader className="pb-3">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="flex gap-2">
                      <div className="h-5 bg-gray-200 rounded w-20"></div>
                      <div className="h-5 bg-gray-200 rounded w-16"></div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </CardContent>
                </div>
              </Card>
            );
          }

          return (
            <Card
              key={event.id}
              className="overflow-hidden hover:shadow-lg transition-all duration-200 group"
            >
              {/* Event Image with Overlay Actions */}
              {event.s3ImageUrl && (
                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                  <img
                    src={event.s3ImageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                  {/* Action Buttons Overlay */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleTemplateSelect(event)}
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-md"
                    >
                      <Pencil className="h-4 w-4 text-gray-700" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDeleteClick(event)}
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-red-50 shadow-md"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-semibold line-clamp-2 flex-1 pr-2">
                    {event.title}
                  </CardTitle>
                  {/* Fallback action buttons if no image */}
                  {!event.s3ImageUrl && (
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTemplateSelect(event)}
                        className="h-8 w-8 p-0 hover:bg-gray-100"
                      >
                        <Pencil className="h-4 w-4 text-gray-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(event)}
                        className="h-8 w-8 p-0 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Category and Status Badges */}
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant="secondary"
                    className={`${getCategoryColor(event.category || 'EVENT')} text-xs font-medium`}
                  >
                    {event.category || 'EVENT'}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={`${getStatusColor(event.status)} text-xs font-medium`}
                  >
                    {event.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Event Details */}
                <div className="space-y-2.5">
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarDays className="w-4 h-4 mr-2 flex-shrink-0 text-gray-500" />
                    <span className="font-medium">
                      {formatDate(event.date)}
                    </span>
                  </div>

                  {event.time && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2 flex-shrink-0 text-gray-500" />
                      <span className="font-medium">
                        {formatTime(event.time)}
                      </span>
                    </div>
                  )}

                  {event.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0 text-gray-500" />
                      <span className="line-clamp-1 font-medium">
                        {event.location}
                      </span>
                    </div>
                  )}

                  {event.guests && event.guests.length > 0 && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2 flex-shrink-0 text-gray-500" />
                      <span className="font-medium">
                        {event.guests.length} guest
                        {event.guests.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* Event Organizer */}
                {event.User && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 font-medium">
                      Organized by {event.User.name}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <DeleteEvent
        show={showDeleteDialog}
        setShow={setShowDeleteDialog}
        eventId={selectedEvent?.id}
        eventTitle={selectedEvent?.title}
        onEventDeleted={handleEventDeleted}
        onDeleteStart={handleDeleteStart}
        onDeleteFailed={handleDeleteFailed}
      />
    </div>
  );
}
