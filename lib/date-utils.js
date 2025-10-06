/**
 * Date and Time Utility Functions
 * Common functions for formatting dates and times across the application
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
