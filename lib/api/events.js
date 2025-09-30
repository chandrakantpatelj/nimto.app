export async function updateEventFeatures(eventId, features) {
  const response = await fetch(`/api/events/${eventId}/features`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ features }),
  });

  if (!response.ok) {
    throw new Error('Failed to update event features');
  }

  return response.json();
}
