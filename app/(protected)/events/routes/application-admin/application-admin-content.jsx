'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEventActions, useEvents } from '@/store/hooks';
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
import { formatDate, formatTime } from '@/lib/date-utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import DeleteEvent from '../../components/delete-event';

export function ApplicationAdminEventContent() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deletingEventId, setDeletingEventId] = useState(null);

  // Redux state and actions
  const { events, isLoading: loading, error } = useEvents();
  const { fetchAllEvents, setSelectedEvent: setEventForEdit } =
    useEventActions();

  useEffect(() => {
    // Fetch all events using Redux action with admin flag
    fetchAllEvents({ admin: 'true' }).catch((err) => {
      console.error('Failed to fetch events:', err);
    });
  }, [fetchAllEvents]);

  const handleTemplateSelect = (event) => {
    console.log('Edit button clicked for event:', event.title, event.id);
    // Initialize selectedEvent with template data
    setEventForEdit({
      templateId: event.id,
      jsonContent: event.jsonContent || '',
      imagePath: event.imagePath || '',
      s3ImageUrl: event.s3ImageUrl || '',
      title: event.title,
      description: event.description,
      startDateTime: event.startDateTime,
      endDateTime: event.endDateTime,
      locationAddress: event.locationAddress,
      locationUnit: event.locationUnit,
      showMap: event.showMap !== null ? event.showMap : true,
      status: event.status,
      guests: event.guests,
    });

    // Navigate to design page
    router.push(`/events/${event.id}`);
  };

  const handleDeleteClick = (event) => {
    console.log('Delete button clicked for event:', event.title, event.id);
    setSelectedEvent(event);
    setShowDeleteDialog(true);
  };

  const handleDeleteStart = (eventId) => {
    setDeletingEventId(eventId);
  };

  const handleEventDeleted = () => {
    // Event is already deleted by DeleteEvent component
    // Just refresh the events list using Redux action with admin flag
    fetchAllEvents({ admin: 'true' });
    setShowDeleteDialog(false);
    setSelectedEvent(null);
    setDeletingEventId(null);
  };

  const handleDeleteFailed = (eventId) => {
    // Stop the loading state for the failed event
    setDeletingEventId(null);
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
      event.locationAddress
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      event.locationUnit?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
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
          <Button
            onClick={() => fetchAllEvents({ admin: 'true' })}
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CalendarDays className="w-6 h-6 text-blue-600" />
            </div>
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 text-lg font-semibold px-4 py-2"
            >
              {filteredEvents.length} Events
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mt-2 ml-12">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {filteredEvents.map((event) => {
          // Show skeleton loader if this event is being deleted
          if (deletingEventId === event.id) {
            return (
              <Card
                key={event.id}
                className="overflow-hidden border-0 shadow-lg"
              >
                <div className="animate-pulse">
                  <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 relative">
                    {/* Skeleton overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent">
                      <div className="absolute bottom-4 left-4 right-4 space-y-2">
                        <div className="h-5 bg-white/20 rounded w-3/4"></div>
                        <div className="h-4 bg-white/20 rounded w-1/2"></div>
                        <div className="h-4 bg-white/20 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          }

          return (
            <Card
              key={event.id}
              className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-white"
            >
              {/* Event Image as Main Content */}
              <div className="relative aspect-[3/4] overflow-hidden">
                {event?.eventThumbnailUrl || event?.s3ImageUrl ? (
                  <>
                    <img
                      src={event?.eventThumbnailUrl || event?.s3ImageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    {/* Fallback for broken images */}
                    <div
                      className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 items-center justify-center"
                      style={{ display: 'none' }}
                    >
                      <div className="text-center p-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <CalendarDays className="w-8 h-8 text-blue-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-600">
                          Event Image
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  /* No image placeholder */
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="text-center p-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CalendarDays className="w-8 h-8 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-600">
                        No Image
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons Overlay */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-10">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleTemplateSelect(event);
                    }}
                    className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-lg border-0 backdrop-blur-sm cursor-pointer"
                  >
                    <Pencil className="h-3 w-3 text-gray-700" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteClick(event);
                    }}
                    className="h-8 w-8 p-0 bg-white/90 hover:bg-red-50 shadow-lg border-0 backdrop-blur-sm cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3 text-red-600" />
                  </Button>
                </div>

                {/* Status Badge Overlay */}
                <div className="absolute top-4 left-4">
                  <Badge
                    variant="secondary"
                    className={`${getStatusColor(event.status)} text-xs font-semibold px-3 py-1 shadow-lg border-0 backdrop-blur-sm`}
                  >
                    {event.status}
                  </Badge>
                </div>

                {/* Event Information Overlay - Bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="space-y-2">
                      <h3 className="text-white font-bold text-xl leading-tight mb-2 drop-shadow-lg">
                        {event.title}
                      </h3>

                      <div className="flex items-center gap-2 text-white/90 text-sm">
                        <CalendarDays className="w-4 h-4" />
                        <span className="font-medium">
                          {formatDate(event.startDateTime, {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </span>
                        {event.startDateTime && (
                          <>
                            <span className="text-white/60">•</span>
                            <span className="font-medium">
                              {formatTime(event.startDateTime)}
                            </span>
                          </>
                        )}
                      </div>

                      {(event.locationAddress || event.locationUnit) && (
                        <div className="flex items-center gap-2 text-white/90 text-sm">
                          <MapPin className="w-4 h-4" />
                          <span className="font-medium line-clamp-1">
                            {event.locationAddress}
                            {event.locationUnit
                              ? `, ${event.locationUnit}`
                              : ''}
                          </span>
                        </div>
                      )}

                      {event.guests && event.guests.length > 0 && (
                        <div className="flex items-center gap-2 text-white/90 text-sm">
                          <Users className="w-4 h-4" />
                          <span className="font-medium">
                            {event.guests.length} guest
                            {event.guests.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}

                      {event.User && (
                        <div className="flex items-center gap-2 text-white/80 text-xs pt-1">
                          <span>by {event.User.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <CalendarDays className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {searchQuery ? 'No Events Found' : 'No Events Yet'}
            </h3>
            <p className="text-gray-600 max-w-md">
              {searchQuery
                ? 'No events match your search criteria. Try adjusting your search terms.'
                : 'No events have been created yet. Create your first event to get started.'}
            </p>
            {searchQuery && (
              <p className="text-sm text-gray-500">
                Clear your search to see all events
              </p>
            )}
          </div>
        </div>
      )}

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
