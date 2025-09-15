'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAllEvents, useEventActions, useEvents } from '@/store/hooks';
import {
  CalendarCheck,
  Earth,
  Pencil,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
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
      ((event.guests || []) || []).filter((guest) => guest.status === 'CONFIRMED')
        .length
    );
  }, 0);

  const filteredEvents = (events || []).filter((event) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      event.title?.toLowerCase().includes(query) ||
      event.description?.toLowerCase().includes(query) ||
      event.location?.toLowerCase().includes(query)
    );
  });

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
    fetchAllEvents();
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

  // Events are now filtered by Redux useFilteredEvents hook

  const renderData = (event, index) => {
    // Show skeleton loader if this event is being deleted
    if (deletingEventId === event.id) {
      return (
        <Card key={event.id || index} className="rounded-xl relative">
          <div className="animate-pulse">
            <div className="min-h-32 h-100 bg-gray-200 rounded-tr-xl rounded-tl-xl"></div>
            <div className="p-4">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="flex gap-2 mt-3">
                <div className="h-8 bg-gray-200 rounded flex-1"></div>
                <div className="h-8 bg-gray-200 rounded flex-1"></div>
              </div>
            </div>
          </div>
        </Card>
      );
    }

    return (
      <Card
        key={event.id || index}
        className="rounded-xl relative group hover:shadow-lg transition-all duration-200"
      >
        <div className="flex flex-col gap-2 justify-between h-100">
          <div className="relative min-h-32 h-100 overflow-hidden rounded-tr-xl rounded-tl-xl">
            {event.s3ImageUrl ? (
              <img
                src={event.s3ImageUrl}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                alt={event.title}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">
                  No Image
                </span>
              </div>
            )}
            {/* Action Buttons Overlay */}
            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push(`/events/${event.id}`)}
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
          <div className="p-4 relative">
            <span className="text-lg text-dark font-media/brand text-mono hover:text-primary-active mb-px block pr-16">
              {event.title}
            </span>
            {/* Fallback action buttons if no image */}
            {!event.s3ImageUrl && (
              <div className="absolute top-4 right-4 flex gap-1">
                <Button
                  variant="softPrimary"
                  mode="icon"
                  onClick={() => router.push(`/events/${event.id}`)}
                >
                  <Pencil className="text-primary" />
                </Button>
                <Button
                  variant="softDanger"
                  mode="icon"
                  onClick={() => handleDeleteClick(event)}
                >
                  <Trash2 className="text-red-500" />
                </Button>
              </div>
            )}

            <div className="flex items-center  mt-3">
              <CalendarCheck className="w-5 h-5 mr-2 " />
              <span className="text-sm font-medium text-secondary-foreground">
                {formatDate(event.date)}
              </span>
            </div>

            <div className="flex items-center  mt-1">
              <Users className="w-5 h-5  mr-2 " />
              <span className="text-sm font-medium text-secondary-foreground">
                {totalConfirmedGuests} Accepted / {(event.guests || []).length}{' '}
                Invited
              </span>
            </div>
            <div className="flex gap-2 items-center justify-between mt-3">
              <Button
                variant="secondary"
                mode="default"
                size="md"
                onClick={() => router.push(`/events/${event.id}/guest`)}
                className="mx-auto w-full max-w-50"
              >
                <Users />
                Manage Guests
              </Button>

              <Button
                variant="outline"
                mode="primary"
                size="md"
                onClick={() => router.push(`/events/${event.id}`)}
                className="mx-auto w-full max-w-50"
              >
                <Earth />
                Public Page
              </Button>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 lg:gap-4.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-xl bg-gray-100 h-64 animate-pulse"
                ></div>
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
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-8">
              {searchQuery ? (
                <>
                  {' '}
                  <p className="text-gray-600">
                    You haven't created any events yet
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Create your first event to get started
                  </p>
                </>
              ) : (
                <p className="text-gray-600">No events found </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 lg:gap-4.5">
              {filteredEvents.map((event, index) => renderData(event, index))}
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
