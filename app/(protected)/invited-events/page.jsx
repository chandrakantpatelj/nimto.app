'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CalendarDays, Search } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/api';
import { formatEventDate, formatTime } from '@/lib/date-utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

function dedupeEvents(events) {
  const seen = new Set();
  return events.filter((event) => {
    if (seen.has(event.id)) return false;
    seen.add(event.id);
    return true;
  });
}

function splitEvents(events) {
  const now = new Date();
  const upcoming = [];
  const past = [];
  events.forEach((event) => {
    const eventDate = new Date(event.startDateTime);
    if (eventDate >= now) {
      upcoming.push(event);
    } else {
      past.push(event);
    }
  });
  upcoming.sort(
    (a, b) => new Date(a.startDateTime) - new Date(b.startDateTime),
  );
  past.sort((a, b) => new Date(b.startDateTime) - new Date(a.startDateTime));
  return { upcoming, past };
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past/Canceled' },
];

export default function InvitedEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(5);
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  const email = searchParams.get('email');
  const userId = searchParams.get('userId');

  useEffect(() => {
    fetchInvitedEvents();
  }, [session?.user?.email, email, userId]);

  const fetchInvitedEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (session?.user?.email) {
        params.append('email', session.user.email);
      } else if (email) {
        params.append('email', email);
      } else if (userId) {
        params.append('userId', userId);
      }
      const queryString = params.toString();
      const url = queryString
        ? `/api/attendee/events?${queryString}`
        : '/api/attendee/events';
      const response = await apiFetch(url);
      if (!response.ok)
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`,
        );
      const data = await response.json();
      setEvents(data?.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Deduplicate events before splitting
  const dedupedEvents = useMemo(() => dedupeEvents(events), [events]);
  const { upcoming, past } = useMemo(
    () => splitEvents(dedupedEvents),
    [dedupedEvents],
  );

  // Filter and search logic
  const filteredEvents = useMemo(() => {
    let list = [];
    if (filter === 'upcoming') list = upcoming;
    else if (filter === 'past') list = past;
    else list = [...upcoming, ...past];

    if (search.trim()) {
      const lower = search.toLowerCase();
      list = list.filter(
        (event) =>
          event.title?.toLowerCase().includes(lower) ||
          event.User?.name?.toLowerCase().includes(lower) ||
          event.User?.email?.toLowerCase().includes(lower),
      );
    }
    return list;
  }, [upcoming, past, filter, search]);

  // Pagination logic
  const visibleEvents = filteredEvents.slice(0, visibleCount);
  const canLoadMore = visibleCount < filteredEvents.length;

  const renderEventCard = (event, isPast) => {
    const userGuest = event.guests?.[0];
    return (
      <div
        key={event.id}
        className="flex bg-gray-50 rounded-lg p-6 mb-6 shadow-sm items-center"
      >
        <div className="w-40 h-56 flex-shrink-0 relative">
          <img
            src={event.eventThumbnailUrl || event.s3ImageUrl}
            alt={event.title}
            className="w-full h-full object-cover rounded-md border"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          {isPast && (
            <Badge className="absolute bottom-2 left-2 bg-indigo-600 text-white px-3 py-1 rounded">
              PAST
            </Badge>
          )}
        </div>
        <div className="flex-1 ml-8">
          <div className="text-xl font-semibold mb-1">{event.title}</div>
          <div className="text-gray-700 mb-1">
            {formatEventDate(event.startDateTime)}
            {event.startDateTime && <> {formatTime(event.startDateTime)} ET</>}
          </div>
          <div className="text-gray-500 mb-2">
            Hosted by {event.User?.name || event.User?.email}
          </div>
          {isPast && userGuest?.status && (
            <div
              className={`font-medium mb-2 ${
                userGuest.status === 'CONFIRMED'
                  ? 'text-green-600'
                  : userGuest.status === 'DECLINED'
                    ? 'text-red-600'
                    : userGuest.status === 'MAYBE'
                      ? 'text-yellow-600'
                      : 'text-gray-600'
              }`}
            >
              {userGuest.status === 'CONFIRMED'
                ? 'You attended'
                : userGuest.status === 'DECLINED'
                  ? 'You declined'
                  : userGuest.status === 'MAYBE'
                    ? 'Maybe'
                    : 'No Response from you'}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const guestId = userGuest?.id;
              if (guestId) {
                router.push(`/invitation/${event.id}/${guestId}`);
              }
            }}
          >
            View invitation
          </Button>
          <Button variant="ghost" className="px-2">
            ...
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button
            onClick={fetchInvitedEvents}
            className="mt-4"
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-8">Invited Events</h1>
        {/* Filter Bar */}
        <div className="mb-8">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <input
                type="text"
                className="w-full rounded-lg border px-4 py-2 pl-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Search invitations"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setVisibleCount(5);
                }}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-700">Status</span>
              {FILTERS.map((f) => (
                <Button
                  key={f.key}
                  variant={filter === f.key ? 'outline' : 'ghost'}
                  className={`rounded-full px-4 py-1 ${filter === f.key ? 'border-green-500 text-green-700 bg-green-50' : ''}`}
                  onClick={() => {
                    setFilter(f.key);
                    setVisibleCount(5);
                  }}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
        {/* Event List */}
        {visibleEvents.length > 0 ? (
          <div>
            {visibleEvents.map((event) => {
              const isPast = new Date(event.startDateTime) < new Date();
              return renderEventCard(event, isPast);
            })}
            {canLoadMore && (
              <div className="flex justify-center mt-4">
                <Button
                  variant="outline"
                  onClick={() => setVisibleCount((c) => c + 5)}
                >
                  Load More
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <CalendarDays className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No invitations found
            </h3>
            <p className="text-gray-500 text-center max-w-sm">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
