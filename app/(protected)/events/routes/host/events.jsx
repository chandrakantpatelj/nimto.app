'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAllEvents, useEventActions, useEvents } from '@/store/hooks';
import { useSession } from 'next-auth/react';
import {
  CalendarCheck,
  Earth,
  Pencil,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import DeleteEvent from '../../components/delete-event';

const Events = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Redux state and actions - SIMPLIFIED
  const { events, isLoading: loading, error } = useEvents(); // All events data from Redux
  const { fetchAllEvents, deleteEvent } = useEventActions(); // Redux actions

  // Simple local search state

  useEffect(() => {
    if (session?.user?.id) {
      fetchAllEvents();
    }
  }, [session?.user?.id]);

  const filteredEvents = events.filter((event) => {
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

  const handleEventDeleted = () => {
    // Delete event (includes optimistic update)
    if (selectedEvent?.id) {
      deleteEvent(selectedEvent.id);
    }
    setShowDeleteDialog(false);
    setSelectedEvent(null);
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
    return (
      <Card key={event.id || index} className={`rounded-xl relative `}>
        <div className="flex flex-col gap-2 justify-between h-100">
          <div className=" min-h-32 h-100 overflow-hidden rounded-tr-xl rounded-tl-xl">
            {event.s3ImageUrl ? (
              <img
                src={event.s3ImageUrl}
                className="w-full h-full object-cover"
                alt={event.title}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">
                  No Image
                </span>
              </div>
            )}
          </div>
          <div className="p-4 relative">
            <span className="text-lg text-dark font-media/brand text-mono hover:text-primary-active mb-px">
              {event.title}
            </span>
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

            <div className="flex items-center  mt-3">
              <CalendarCheck className="w-5 h-5 mr-2 " />
              <span className="text-sm font-medium text-secondary-foreground">
                {formatDate(event.date)}
              </span>
            </div>

            <div className="flex items-center  mt-1">
              <Users className="w-5 h-5  mr-2 " />
              <span className="text-sm font-medium text-secondary-foreground">
                0 Accepted / {event.guests?.length || 0} Invited
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
      />
    </>
  );
};

export default Events;
