import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/api';

export function useAttendeeEvents(
  eventId = null,
  status = null,
  email = null,
  userId = null,
) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session } = useSession();

  const fetchEvents = async () => {
    // If no email/userId provided and no session, don't fetch
    if (!email && !userId && !session?.user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      if (eventId) params.append('eventId', eventId);
      if (status) params.append('status', status);
      if (email) params.append('email', email);
      if (userId) params.append('userId', userId);

      const queryString = params.toString();
      const url = `/api/attendee/events${queryString ? `?${queryString}` : ''}`;

      const response = await apiFetch(url);

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      setEvents(data?.data || []);
    } catch (err) {
      console.error('Error fetching attendee events:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [session?.user?.id, eventId, status, email, userId]);

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
  };
}
