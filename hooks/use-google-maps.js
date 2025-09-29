'use client';

import { useEffect, useState } from 'react';

// Global state to track if Google Maps is loaded
let isGoogleMapsLoaded = false;

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(isGoogleMapsLoaded);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Check if Google Maps API key is available
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      setHasError(true);
      setErrorMessage('Google Maps API key is not configured');
      return;
    }

    // Check if Google Maps is already loaded and Map constructor is ready
    const checkGoogleMaps = () => {
      try {
        if (
          typeof window !== 'undefined' &&
          window.google &&
          window.google.maps &&
          window.google.maps.Map &&
          typeof window.google.maps.Map === 'function' &&
          window.google.maps.places &&
          window.google.maps.places.Autocomplete
        ) {
          isGoogleMapsLoaded = true;
          setIsLoaded(true);
          setHasError(false);
          setErrorMessage('');
        }
      } catch (error) {
        console.warn('Google Maps check error:', error);
        setHasError(true);
        setErrorMessage(`Google Maps check failed: ${error.message}`);
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

      // Cleanup interval after 8 seconds
      const timeout = setTimeout(() => {
        clearInterval(interval);
        if (!isGoogleMapsLoaded) {
          setHasError(true);
          setErrorMessage(
            'Google Maps failed to load. This might be due to an ad blocker or network restrictions.',
          );
        }
      }, 8000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, []);

  return { isLoaded, hasError, errorMessage };
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
