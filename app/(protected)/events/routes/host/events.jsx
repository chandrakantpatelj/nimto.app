'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAllEvents, useEventActions, useEvents } from '@/store/hooks';
import {
  CalendarCheck,
  CalendarDays,
  Clock,
  Earth,
  MapPin,
  Pencil,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { formatDate, formatTime } from '@/lib/date-utils';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import DeleteEvent from '../../components/delete-event';

const Events = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deletingEventId, setDeletingEventId] = useState(null);

  // Redux state and actions - SIMPLIFIED
  const { events, isLoading: loading, error } = useEvents(); // All events data from Redux
  const { fetchAllEvents } = useEventActions(); // Redux actions

  // Simple local search state

  useEffect(() => {
    if (session?.user?.id) {
      // Host users don't need admin parameter - they see only their own events
      fetchAllEvents().catch((err) => {
        console.error('Failed to fetch events:', err);
        // Handle 401 errors by redirecting to home page
        if (err.message?.includes('Unauthorized')) {
          router.push('/');
        }
      });
    }
  }, [session?.user?.id, fetchAllEvents, router]);

  const totalConfirmedGuests = (events || []).reduce((acc, event) => {
    return (
      acc +
      (event.guests || [] || []).filter((guest) => guest.status === 'CONFIRMED')
        .length
    );
  }, 0);

  const filteredEvents = (events || []).filter((event) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      event.title?.toLowerCase().includes(query) ||
      event.description?.toLowerCase().includes(query) ||
      event.locationAddress?.toLowerCase().includes(query) ||
      event.locationUnit?.toLowerCase().includes(query)
    );
  });

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
    // Just refresh the events list (host users see only their own events)
    fetchAllEvents();
    setShowDeleteDialog(false);
    setSelectedEvent(null);
    setDeletingEventId(null);
  };

  const handleDeleteFailed = (eventId) => {
    // Stop the loading state for the failed event
    setDeletingEventId(null);
  };

  // Events are now filtered by Redux useFilteredEvents hook

  const renderData = (event, index) => {
    // Show skeleton loader if this event is being deleted
    if (deletingEventId === event.id) {
      return (
        <Card
          key={event.id || index}
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
        key={event.id || index}
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
                <p className="text-sm font-medium text-gray-600">No Image</p>
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
                console.log(
                  'Edit button clicked for event:',
                  event.title,
                  event.id,
                );
                // Set the event data in Redux before navigating
                setSelectedEvent(event);
                router.push(`/events/${event.id}`);
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
                      {event.locationUnit ? `, ${event.locationUnit}` : ''}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-white/90 text-sm">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">
                    {
                      (event.guests || []).filter(
                        (guest) => guest.status === 'CONFIRMED',
                      ).length
                    }{' '}
                    / {(event.guests || []).length} guests
                  </span>
                </div>

                {/* Action Buttons - Bottom */}
                <div className="flex gap-2 pt-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => router.push(`/events/${event.id}/guest`)}
                    className="flex-1 h-8 bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm text-xs font-medium"
                  >
                    <Users className="w-3 h-3 mr-1" />
                    Manage Guests
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => router.push(`/events/${event.id}`)}
                    className="flex-1 h-8 bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm text-xs font-medium"
                  >
                    <Earth className="w-3 h-3 mr-1" />
                    Public Page
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <>
      <div className="flex flex-col items-stretch gap-4 lg:gap-6.5">
        <div className="relative">
          <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search your events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-9 w-95"
          />
        </div>

        <div id="projects_cards">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="overflow-hidden border-0 shadow-lg">
                  <div className="animate-pulse">
                    <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 relative">
                      {/* Skeleton overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent">
                        <div className="absolute bottom-4 left-4 right-4 space-y-2">
                          <div className="h-5 bg-white/20 rounded w-3/4"></div>
                          <div className="h-4 bg-white/20 rounded w-1/2"></div>
                          <div className="h-4 bg-white/20 rounded w-2/3"></div>
                          <div className="flex gap-2 pt-2">
                            <div className="h-6 bg-white/20 rounded flex-1"></div>
                            <div className="h-6 bg-white/20 rounded flex-1"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
              <Button
                onClick={fetchAllEvents}
                variant="outline"
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {filteredEvents.map((event, index) => renderData(event, index))}
            </div>
          )}

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
                    : "You haven't created any events yet. Create your first event to get started."}
                </p>
                {searchQuery && (
                  <p className="text-sm text-gray-500">
                    Clear your search to see all events
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex grow justify-center pt-5 lg:pt-7.5">
            <Button mode="link" underlined="dashed" asChild>
              <Link href="#">Show more events</Link>
            </Button>
          </div>
        </div>
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
    </>
  );
};

export default Events;
