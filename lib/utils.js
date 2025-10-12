import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind class names, resolving any conflicts.
 *
 * @param inputs - An array of class names to merge.
 * @returns A string of merged and optimized class names.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Ensures eventObj has a valid mapCoordinate using Google Maps Geocoder if available.
 * Falls back to DEFAULT_MAP_CENTER if geocoding fails or is unavailable.
 *
 * @param {Object} eventObj - The event object to process.
 * @returns {Promise<Object>} - The event object with mapCoordinate set.
 */
export async function geocodeAddressIfNeeded(eventObj) {
  if (
    eventObj.showMap &&
    eventObj.locationAddress &&
    !eventObj.mapCoordinate &&
    typeof window !== 'undefined' &&
    window.google &&
    window.google.maps
  ) {
    return new Promise((resolve) => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode(
        { address: eventObj.locationAddress },
        (results, status) => {
          if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;
            resolve({
              ...eventObj,
              mapCoordinate: {
                lat: location.lat(),
                lng: location.lng(),
              },
            });
          } else {
            resolve({
              ...eventObj,
              mapCoordinate: DEFAULT_MAP_CENTER,
            });
          }
        },
      );
    });
  }
  if (eventObj.showMap && eventObj.locationAddress && !eventObj.mapCoordinate) {
    return {
      ...eventObj,
      mapCoordinate: DEFAULT_MAP_CENTER,
    };
  }
  return eventObj;
}
