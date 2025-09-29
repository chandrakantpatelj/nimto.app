'use client';

import React, { useEffect, useRef, useState } from 'react';
import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps';
import { MapPin } from 'lucide-react';

function AutocompleteInput({ value, onChange, onPlaceSelect, placeholder }) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const places = useMapsLibrary('places');
  const [isGoogleMapsBlocked, setIsGoogleMapsBlocked] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    if (!places || !inputRef.current) return;

    // Set a timeout to detect if Google Maps is taking too long to load
    const timeoutId = setTimeout(() => {
      if (!autocompleteRef.current) {
        console.warn(
          'Google Maps autocomplete taking too long to load, falling back to simple input',
        );
        setIsGoogleMapsBlocked(true);
      }
    }, 5000);

    try {
      if (!places || !places.Autocomplete) {
        console.warn('Google Places API not available, using simple input');
        setIsGoogleMapsBlocked(true);
        return;
      }

      const options = {
        types: ['geocode'],
        fields: [
          'formatted_address',
          'name',
          'place_id',
          'geometry',
          'address_components',
          'types',
          'url',
          'vicinity',
          'formatted_phone_number',
          'website',
        ],
        componentRestrictions: { country: 'in' }, // Restrict to India for better results
      };

      autocompleteRef.current = new places.Autocomplete(
        inputRef.current,
        options,
      );

      const listener = autocompleteRef.current.addListener(
        'place_changed',
        () => {
          try {
            setIsSelecting(true);
            const place = autocompleteRef.current.getPlace();
            // Handle different types of place selections
            if (place) {
              let selectedAddress = '';

              // Try to get the best address format
              if (place.formatted_address) {
                selectedAddress = place.formatted_address;
              } else if (place.name && place.vicinity) {
                selectedAddress = `${place.name}, ${place.vicinity}`;
              } else if (place.name) {
                selectedAddress = place.name;
              } else if (place.vicinity) {
                selectedAddress = place.vicinity;
              }

              if (selectedAddress) {
                onChange(selectedAddress);

                if (onPlaceSelect) {
                  onPlaceSelect(place);
                }
              } else {
                // Still call onPlaceSelect even if no address, in case the place has geometry
                if (onPlaceSelect) {
                  onPlaceSelect(place);
                }
              }
            }

            // Reset selecting state after a short delay
            setTimeout(() => setIsSelecting(false), 500);
          } catch (error) {
            console.warn('Error handling place selection:', error);
            setIsSelecting(false);
          }
        },
      );

      return () => {
        clearTimeout(timeoutId);
        try {
          if (listener && places && places.event) {
            places.event.removeListener(listener);
          }
        } catch (error) {
          console.warn('Error removing autocomplete listener:', error);
        }
      };
    } catch (error) {
      console.warn('Error initializing autocomplete:', error);
      setIsGoogleMapsBlocked(true);
    }
  }, [places, onChange, onPlaceSelect]);

  // If Google Maps is blocked, show a simple input
  if (isGoogleMapsBlocked) {
    return (
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 pl-12 pr-4 text-base border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
      />
    );
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-12 pl-12 pr-4 text-base border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ${isSelecting ? 'border-blue-400 bg-blue-50' : ''}`}
      />
      {isSelecting && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
        </div>
      )}
    </div>
  );
}

export function SimpleAutocomplete({
  value = '',
  onChange,
  onPlaceSelect,
  placeholder = 'Enter a location',
  className = '',
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className={`relative ${className}`}>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-12 pl-12 pr-4 text-base border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <APIProvider apiKey={apiKey}>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
          <AutocompleteInput
            value={value}
            onChange={onChange}
            onPlaceSelect={onPlaceSelect}
            placeholder={placeholder}
          />
        </div>
      </APIProvider>
    </div>
  );
}
