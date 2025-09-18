/**
 * Get the base URL for the application
 * This function ensures we always have a proper base URL for generating invitation links
 */
export function getBaseUrl() {
  // First try NEXTAUTH_URL (most reliable for production)
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  
  // Try VERCEL_URL for Vercel deployments
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Try custom domain environment variables
  if (process.env.DOMAIN) {
    return `https://${process.env.DOMAIN}`;
  }
  
  // Fallback to localhost for development
  return 'http://localhost:3000';
}

/**
 * Generate a complete invitation URL
 * @param {string} eventId - The event ID
 * @param {string} guestId - The guest ID
 * @returns {string} - Complete invitation URL
 */
export function generateInvitationUrl(eventId, guestId) {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/invitation/${eventId}/${guestId}`;
}

/**
 * Validate that a URL has a proper protocol and domain
 * @param {string} url - URL to validate
 * @returns {boolean} - Whether the URL is valid
 */
export function isValidUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}
