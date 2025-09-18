import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/api';

export function useAttendeeGuests(
  eventId = null,
  status = null,
  email = null,
  userId = null,
) {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session } = useSession();

  const fetchGuests = async () => {
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
      const url = `/api/attendee/guests${queryString ? `?${queryString}` : ''}`;

      const response = await apiFetch(url);

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      setGuests(data?.data || []);
    } catch (err) {
      console.error('Error fetching attendee guests:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateGuestResponse = async (eventId, newStatus, response = null) => {
    try {
      const params = new URLSearchParams();
      if (email) params.append('email', email);
      if (userId) params.append('userId', userId);
      params.append('eventId', eventId);

      const queryString = params.toString();
      const url = `/api/attendee/guests?${queryString}`;

      const apiResponse = await apiFetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          response: response,
        }),
      });

      if (!apiResponse.ok) {
        throw new Error(
          `API request failed: ${apiResponse.status} ${apiResponse.statusText}`,
        );
      }

      const data = await apiResponse.json();

      // Update the local state
      setGuests((prevGuests) =>
        prevGuests.map((guest) =>
          guest.id === data.data.id ? data.data : guest,
        ),
      );

      return data.data;
    } catch (err) {
      console.error('Error updating guest response:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [session?.user?.id, eventId, status, email, userId]);

  return {
    guests,
    loading,
    error,
    refetch: fetchGuests,
    updateResponse: updateGuestResponse,
  };
}

