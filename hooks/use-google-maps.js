'use client';

import { useEffect, useState } from 'react';

// Global state to track if Google Maps is loaded
let isGoogleMapsLoaded = false;

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(isGoogleMapsLoaded);

  useEffect(() => {
    // Check if Google Maps is already loaded and Map constructor is ready
    const checkGoogleMaps = () => {
      if (
        typeof window !== 'undefined' &&
        window.google &&
        window.google.maps &&
        window.google.maps.Map &&
        typeof window.google.maps.Map === 'function'
      ) {
        isGoogleMapsLoaded = true;
        setIsLoaded(true);
      }
    };

    checkGoogleMaps();

    // If not loaded, check periodically
    if (!isGoogleMapsLoaded) {
      const interval = setInterval(() => {
        checkGoogleMaps();
        if (isGoogleMapsLoaded) {
          clearInterval(interval);
        }
      }, 100);

      // Cleanup interval after 10 seconds
      const timeout = setTimeout(() => {
        clearInterval(interval);
      }, 10000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, []);

  return isLoaded;
}

// Function to mark Google Maps as loaded (called by LoadScript components)
export function markGoogleMapsAsLoaded() {
  // Only mark as loaded if Map constructor is actually ready
  if (
    typeof window !== 'undefined' &&
    window.google &&
    window.google.maps &&
    window.google.maps.Map &&
    typeof window.google.maps.Map === 'function'
  ) {
    isGoogleMapsLoaded = true;
  }
}
