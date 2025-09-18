/**
 * Utility functions for generating attendee event URLs
 */

/**
 * Generate an attendee event URL with email parameter
 * @param {string} eventId - The event ID
 * @param {string} email - The attendee's email
 * @param {string} baseUrl - The base URL (optional, defaults to current domain)
 * @returns {string} - The complete URL
 */
export function generateAttendeeEventUrl(eventId, email, baseUrl = null) {
  const base =
    baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const params = new URLSearchParams();
  params.append('eventId', eventId);
  params.append('email', email);

  return `${base}/invited-events?${params.toString()}`;
}

/**
 * Generate an attendee event URL with userId parameter
 * @param {string} eventId - The event ID
 * @param {string} userId - The attendee's user ID
 * @param {string} baseUrl - The base URL (optional, defaults to current domain)
 * @returns {string} - The complete URL
 */
export function generateAttendeeEventUrlByUserId(
  eventId,
  userId,
  baseUrl = null,
) {
  const base =
    baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const params = new URLSearchParams();
  params.append('eventId', eventId);
  params.append('userId', userId);

  return `${base}/invited-events?${params.toString()}`;
}

/**
 * Generate a general invited events URL (all events for the user)
 * @param {string} email - The attendee's email
 * @param {string} baseUrl - The base URL (optional, defaults to current domain)
 * @returns {string} - The complete URL
 */
export function generateInvitedEventsUrl(email, baseUrl = null) {
  const base =
    baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const params = new URLSearchParams();
  params.append('email', email);

  return `${base}/invited-events?${params.toString()}`;
}

/**
 * Generate a general invited events URL by userId
 * @param {string} userId - The attendee's user ID
 * @param {string} baseUrl - The base URL (optional, defaults to current domain)
 * @returns {string} - The complete URL
 */
export function generateInvitedEventsUrlByUserId(userId, baseUrl = null) {
  const base =
    baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const params = new URLSearchParams();
  params.append('userId', userId);

  return `${base}/invited-events?${params.toString()}`;
}

