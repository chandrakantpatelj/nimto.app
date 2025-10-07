/**
 * Date and Time Utility Functions
 * Common functions for formatting dates and times across the application
 * Includes timezone-aware conversion and display functions
 */

/**
 * Format a date string to a readable date format
 * @param {string} dateString - ISO date string
 * @param {object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
  try {
    if (!dateString) return 'N/A';

    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    return new Date(dateString).toLocaleDateString('en-US', {
      ...defaultOptions,
      ...options,
    });
  } catch {
    console.warn('Invalid date format:', dateString);
    return 'Invalid Date';
  }
};

/**
 * Format a date string to a long date format (e.g., "September 26, 2025")
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted long date string
 */
export const formatEventDate = (dateString) => {
  try {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    console.warn('Invalid date format:', dateString);
    return 'Invalid Date';
  }
};

/**
 * Format a date string to a readable time format (e.g., "8:00 PM")
 * @param {string} dateString - ISO date string
 * @param {object} options - Formatting options
 * @returns {string} Formatted time string
 */
export const formatTime = (dateString, options = {}) => {
  try {
    if (!dateString) return 'N/A';

    const defaultOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };

    return new Date(dateString).toLocaleTimeString('en-US', {
      ...defaultOptions,
      ...options,
    });
  } catch {
    console.warn('Invalid date format:', dateString);
    return 'Invalid Date';
  }
};

/**
 * Format a date string to a full date and time format
 * @param {string} dateString - ISO date string
 * @param {object} dateOptions - Date formatting options
 * @param {object} timeOptions - Time formatting options
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (
  dateString,
  dateOptions = {},
  timeOptions = {},
) => {
  try {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...dateOptions,
    });

    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      ...timeOptions,
    });

    return `${formattedDate} at ${formattedTime}`;
  } catch {
    console.warn('Invalid date format:', dateString);
    return 'Invalid Date';
  }
};

/**
 * Check if a date is in the future
 * @param {string} dateString - ISO date string
 * @returns {boolean} True if date is in the future
 */
export const isFutureDate = (dateString) => {
  try {
    if (!dateString) return false;
    return new Date(dateString) > new Date();
  } catch {
    console.warn('Invalid date format:', dateString);
    return false;
  }
};

/**
 * Get relative time string (e.g., "2 days ago", "in 3 hours")
 * @param {string} dateString - ISO date string
 * @returns {string} Relative time string
 */
export const getRelativeTime = (dateString) => {
  try {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((date - now) / 1000);

    if (diffInSeconds < 0) {
      // Past date
      const absDiff = Math.abs(diffInSeconds);
      if (absDiff < 60) return 'just now';
      if (absDiff < 3600) return `${Math.floor(absDiff / 60)} minutes ago`;
      if (absDiff < 86400) return `${Math.floor(absDiff / 3600)} hours ago`;
      return `${Math.floor(absDiff / 86400)} days ago`;
    } else {
      // Future date
      if (diffInSeconds < 60) return 'in a moment';
      if (diffInSeconds < 3600)
        return `in ${Math.floor(diffInSeconds / 60)} minutes`;
      if (diffInSeconds < 86400)
        return `in ${Math.floor(diffInSeconds / 3600)} hours`;
      return `in ${Math.floor(diffInSeconds / 86400)} days`;
    }
  } catch {
    console.warn('Invalid date format:', dateString);
    return 'Invalid Date';
  }
};

// ===========================
// TIMEZONE-AWARE UTILITIES
// ===========================

/**
 * Get timezone abbreviation (e.g., "EST", "PST", "GMT+5:30")
 * @param {string} timezone - IANA timezone identifier (e.g., "America/New_York")
 * @param {Date} date - Date object to get abbreviation for (defaults to now)
 * @returns {string} Timezone abbreviation
 */
export const getTimezoneAbbreviation = (timezone, date = new Date()) => {
  try {
    if (!timezone) return 'UTC';

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short',
    });

    const parts = formatter.formatToParts(date);
    const timeZonePart = parts.find((part) => part.type === 'timeZoneName');

    return timeZonePart?.value || timezone;
  } catch (error) {
    console.warn('Error getting timezone abbreviation:', error);
    return timezone || 'UTC';
  }
};

/**
 * Format date and time in a specific timezone
 * @param {string|Date} dateString - Date string or Date object
 * @param {string} timezone - IANA timezone identifier (e.g., "America/New_York")
 * @param {object} options - Formatting options
 * @returns {string} Formatted date and time string
 */
export const formatDateInTimezone = (
  dateString,
  timezone = 'UTC',
  options = {},
) => {
  try {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: timezone,
    };

    return date.toLocaleDateString('en-US', {
      ...defaultOptions,
      ...options,
    });
  } catch (error) {
    console.warn('Invalid date or timezone:', error);
    return 'Invalid Date';
  }
};

/**
 * Format time in a specific timezone
 * @param {string|Date} dateString - Date string or Date object
 * @param {string} timezone - IANA timezone identifier
 * @param {object} options - Formatting options
 * @returns {string} Formatted time string
 */
export const formatTimeInTimezone = (
  dateString,
  timezone = 'UTC',
  options = {},
) => {
  try {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    const defaultOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone,
    };

    return date.toLocaleTimeString('en-US', {
      ...defaultOptions,
      ...options,
    });
  } catch (error) {
    console.warn('Invalid date or timezone:', error);
    return 'Invalid Time';
  }
};

/**
 * Format event date with timezone (e.g., "September 26, 2025 at 5:00 PM EST")
 * @param {string|Date} dateString - Date string or Date object
 * @param {string} timezone - IANA timezone identifier
 * @param {boolean} showTimezoneAbbr - Whether to show timezone abbreviation
 * @returns {string} Formatted event date string
 */
export const formatEventDateWithTimezone = (
  dateString,
  timezone = 'UTC',
  showTimezoneAbbr = true,
) => {
  try {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);

    const dateStr = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: timezone,
    });

    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone,
    });

    const tzAbbr = showTimezoneAbbr
      ? ` ${getTimezoneAbbreviation(timezone, date)}`
      : '';

    return `${dateStr} at ${timeStr}${tzAbbr}`;
  } catch (error) {
    console.warn('Invalid date or timezone:', error);
    return 'Invalid Date';
  }
};

/**
 * Convert date from one timezone to another
 * @param {string|Date} dateString - Date string or Date object
 * @param {string} fromTimezone - Source IANA timezone identifier
 * @param {string} toTimezone - Target IANA timezone identifier
 * @returns {Date} Converted Date object
 */
export const convertTimezone = (dateString, fromTimezone, toTimezone) => {
  try {
    if (!dateString) return null;

    // Create date object
    const date = new Date(dateString);

    // Get time in from timezone
    const fromTime = date.toLocaleString('en-US', {
      timeZone: fromTimezone,
    });

    // Parse and return as Date
    return new Date(fromTime);
  } catch (error) {
    console.warn('Error converting timezone:', error);
    return new Date(dateString);
  }
};

/**
 * Get user's browser timezone
 * @returns {string} IANA timezone identifier
 */
export const getUserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch (error) {
    console.warn('Error getting user timezone:', error);
    return 'UTC';
  }
};

/**
 * Format date for user's timezone (browser timezone)
 * Convenience function that uses browser's timezone
 * @param {string|Date} dateString - Date string or Date object
 * @param {string} eventTimezone - Event's IANA timezone identifier
 * @param {boolean} showBothTimezones - Show both event and user timezone
 * @returns {string} Formatted date string
 */
export const formatDateForUser = (
  dateString,
  eventTimezone = 'UTC',
  showBothTimezones = false,
) => {
  try {
    if (!dateString) return 'N/A';

    const userTimezone = getUserTimezone();
    const date = new Date(dateString);

    // If user is in the same timezone as event, show normally
    if (userTimezone === eventTimezone || !showBothTimezones) {
      return formatEventDateWithTimezone(dateString, eventTimezone, true);
    }

    // Show both timezones
    const eventTime = formatEventDateWithTimezone(
      dateString,
      eventTimezone,
      true,
    );
    const userTime = formatTimeInTimezone(dateString, userTimezone);
    const userTzAbbr = getTimezoneAbbreviation(userTimezone, date);

    return `${eventTime} (${userTime} ${userTzAbbr} your time)`;
  } catch (error) {
    console.warn('Error formatting date for user:', error);
    return formatEventDateWithTimezone(dateString, eventTimezone, true);
  }
};

/**
 * Check if user is in the same timezone as event
 * @param {string} eventTimezone - Event's IANA timezone identifier
 * @returns {boolean} True if same timezone
 */
export const isUserInEventTimezone = (eventTimezone) => {
  try {
    const userTimezone = getUserTimezone();
    return userTimezone === eventTimezone;
  } catch (error) {
    return false;
  }
};

/**
 * Get timezone offset in hours
 * @param {string} timezone - IANA timezone identifier
 * @param {Date} date - Date to get offset for (defaults to now)
 * @returns {number} Offset in hours
 */
export const getTimezoneOffset = (timezone, date = new Date()) => {
  try {
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(
      date.toLocaleString('en-US', { timeZone: timezone }),
    );
    return (tzDate - utcDate) / (1000 * 60 * 60);
  } catch (error) {
    console.warn('Error getting timezone offset:', error);
    return 0;
  }
};
