'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Autocomplete, GoogleMap, LoadScript } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const libraries = ['places'];

// Global script loading state to prevent duplicate loads
let isGoogleMapsLoaded = false;
let googleMapsLoadPromise = null;

export default function GooglePlacesAutocomplete({
  value = '',
  onChange,
  placeholder = 'Enter a location',
  className = '',
  disabled = false,
  ...props
}) {
  const [autocomplete, setAutocomplete] = useState(null);
  const [isLoaded, setIsLoaded] = useState(isGoogleMapsLoaded);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Check if Google Maps is already loaded on mount
  useEffect(() => {
    if (isGoogleMapsLoaded) {
      setIsLoaded(true);
    }
  }, []);

  // Triggered when user selects a place
  const onPlaceChanged = useCallback(() => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();

      if (place && place.formatted_address) {
        onChange(place.formatted_address);

        // Additional place data that can be useful
        const placeData = {
          formatted_address: place.formatted_address,
          name: place.name,
          place_id: place.place_id,
          geometry: place.geometry,
          address_components: place.address_components,
          types: place.types,
          url: place.url,
          vicinity: place.vicinity,
        };

        // Log for debugging (can be removed in production)
        console.log('Selected place:', placeData);
      }
    }
  }, [autocomplete, onChange]);

  const onLoad = useCallback((ac) => {
    setAutocomplete(ac);
    setIsLoaded(true);
  }, []);

  const onScriptLoad = useCallback(() => {
    isGoogleMapsLoaded = true;
    setIsLoaded(true);
    setHasError(false);
  }, []);

  const onScriptError = useCallback((error) => {
    console.error('Google Maps API Error:', error);
    setHasError(true);
    setErrorMessage(
      'Failed to load Google Maps. Please check your API key configuration.',
    );
  }, []);

  const handleInputChange = (e) => {
    onChange(e.target.value);
  };

  // Fallback to regular input if no API key
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className={cn('relative', className)}>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={handleInputChange}
            disabled={disabled}
            className="w-full h-12 pl-12 pr-4 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            {...props}
          />
        </div>
      </div>
    );
  }

  // If Google Maps is already loaded, render the autocomplete directly
  if (isGoogleMapsLoaded) {
    return (
      <div className={cn('relative', className)}>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          <Autocomplete
            onLoad={onLoad}
            onPlaceChanged={onPlaceChanged}
            options={{
              types: ['establishment', 'geocode'],
              fields: [
                'formatted_address',
                'name',
                'place_id',
                'geometry',
                'address_components',
                'types',
                'url',
                'vicinity',
              ],
            }}
          >
            <input
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={handleInputChange}
              disabled={disabled}
              className="w-full h-12 pl-12 pr-4 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              {...props}
            />
          </Autocomplete>
        </div>
      </div>
    );
  }

  return (
    <LoadScript
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
      onLoad={onScriptLoad}
      onError={onScriptError}
      preventGoogleFontsLoading={true}
    >
      <div className={cn('relative', className)}>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />

          {hasError ? (
            <div className="w-full h-12 pl-12 pr-4 text-base border-red-300 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-center">
              <span className="text-sm">{errorMessage}</span>
            </div>
          ) : isLoaded ? (
            <Autocomplete
              onLoad={onLoad}
              onPlaceChanged={onPlaceChanged}
              options={{
                types: ['establishment', 'geocode'],
                fields: [
                  'formatted_address',
                  'name',
                  'place_id',
                  'geometry',
                  'address_components',
                  'types',
                  'url',
                  'vicinity',
                ],
              }}
            >
              <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={handleInputChange}
                disabled={disabled}
                className="w-full h-12 pl-12 pr-4 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                {...props}
              />
            </Autocomplete>
          ) : (
            <input
              type="text"
              placeholder="Loading Google Maps..."
              disabled
              className="w-full h-12 pl-12 pr-4 text-base border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
            />
          )}
        </div>
      </div>
    </LoadScript>
  );
}

// Enhanced version with more features for future use
export function AdvancedGooglePlacesAutocomplete({
  value = '',
  onChange,
  onPlaceSelect,
  placeholder = 'Enter a location',
  className = '',
  disabled = false,
  showMap = false,
  mapCenter = { lat: 40.7128, lng: -74.006 }, // Default to NYC
  ...props
}) {
  const [autocomplete, setAutocomplete] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const onPlaceChanged = useCallback(() => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();

      if (place && place.formatted_address) {
        const placeData = {
          formatted_address: place.formatted_address,
          name: place.name,
          place_id: place.place_id,
          geometry: place.geometry,
          address_components: place.address_components,
          types: place.types,
          url: place.url,
          vicinity: place.vicinity,
        };

        setSelectedPlace(placeData);
        onChange(place.formatted_address);

        // Call additional callback if provided
        if (onPlaceSelect) {
          onPlaceSelect(placeData);
        }
      }
    }
  }, [autocomplete, onChange, onPlaceSelect]);

  const onLoad = useCallback((ac) => {
    setAutocomplete(ac);
    setIsLoaded(true);
  }, []);

  const onScriptLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleInputChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <LoadScript
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
      onLoad={onScriptLoad}
    >
      <div className={cn('space-y-4', className)}>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />

          {isLoaded ? (
            <Autocomplete
              onLoad={onLoad}
              onPlaceChanged={onPlaceChanged}
              options={{
                types: ['establishment', 'geocode'],
                fields: [
                  'formatted_address',
                  'name',
                  'place_id',
                  'geometry',
                  'address_components',
                  'types',
                  'url',
                  'vicinity',
                ],
              }}
            >
              <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={handleInputChange}
                disabled={disabled}
                className="w-full h-12 pl-12 pr-4 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                {...props}
              />
            </Autocomplete>
          ) : (
            <input
              type="text"
              placeholder="Loading Google Maps..."
              disabled
              className="w-full h-12 pl-12 pr-4 text-base border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
            />
          )}
        </div>

        {/* Optional: Show map preview */}
        {showMap && selectedPlace && selectedPlace.geometry && (
          <div className="h-48 w-full rounded-lg overflow-hidden border border-gray-300">
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={selectedPlace.geometry.location}
              zoom={15}
              options={{
                disableDefaultUI: true,
                zoomControl: true,
              }}
            >
              {/* You can add markers here if needed */}
            </GoogleMap>
          </div>
        )}

        {/* Optional: Show selected place details */}
        {selectedPlace && (
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            {selectedPlace.name &&
              selectedPlace.name !== selectedPlace.formatted_address && (
                <p>
                  <strong>Name:</strong> {selectedPlace.name}
                </p>
              )}
            <p>
              <strong>Address:</strong> {selectedPlace.formatted_address}
            </p>
            {selectedPlace.vicinity && (
              <p>
                <strong>Vicinity:</strong> {selectedPlace.vicinity}
              </p>
            )}
            {selectedPlace.types && (
              <p>
                <strong>Type:</strong> {selectedPlace.types.join(', ')}
              </p>
            )}
          </div>
        )}
      </div>
    </LoadScript>
  );
}
