'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Autocomplete, GoogleMap, LoadScript } from '@react-google-maps/api';
import { Edit3, Map, MapPin, Save, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

const libraries = ['places'];

// Global script loading state to prevent duplicate loads
let isGoogleMapsLoaded = false;

export default function LocationManager({
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [locationDetails, setLocationDetails] = useState({
    address: value,
    unit: '',
    showMap: true,
  });
  const [selectedPlace, setSelectedPlace] = useState(null);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        setLocationDetails((prev) => ({
          ...prev,
          address: place.formatted_address,
        }));
        onChange(place.formatted_address);
      }
    }
  }, [autocomplete, onChange]);

  const onLoad = useCallback((ac) => {
    setAutocomplete(ac);
    setIsLoaded(true);
  }, []);

  const onScriptLoad = useCallback(() => {
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
    const newValue = e.target.value;
    setLocationDetails((prev) => ({
      ...prev,
      address: newValue,
    }));
    onChange(newValue);
  };

  const handleUnitChange = (e) => {
    setLocationDetails((prev) => ({
      ...prev,
      unit: e.target.value,
    }));
  };

  const handleShowMapChange = (checked) => {
    setLocationDetails((prev) => ({
      ...prev,
      showMap: checked,
    }));
  };

  const handleSave = () => {
    // Save the location details
    const fullLocation = locationDetails.unit
      ? `${locationDetails.address}, ${locationDetails.unit}`
      : locationDetails.address;

    onChange(fullLocation);
    setIsExpanded(false);
  };

  const handleClear = () => {
    setLocationDetails({
      address: '',
      unit: '',
      showMap: true,
    });
    setSelectedPlace(null);
    onChange('');
    setIsExpanded(false);
  };

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
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
      <div className={cn('space-y-4', className)}>
        {/* Location Input Field */}
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
              value={locationDetails.address}
              onChange={handleInputChange}
              disabled={disabled}
              className="w-full h-12 pl-12 pr-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              {...props}
            />
          </Autocomplete>
          <button
            type="button"
            onClick={handleToggleExpanded}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <Edit3 className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        {/* Expanded Location Details */}
        {isExpanded && (
          <div
            className={cn(
              'border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800',
              isMobile ? 'fixed inset-4 z-50 overflow-y-auto' : 'relative',
            )}
          >
            {isMobile && (
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Location</h3>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            <div className="space-y-4">
              {/* Address Field */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Address
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={locationDetails.address}
                    onChange={handleInputChange}
                    placeholder="Enter address"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Unit Field */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  APT / UNIT
                </Label>
                <div className="relative">
                  <Input
                    value={locationDetails.unit}
                    onChange={handleUnitChange}
                    placeholder="Enter unit number"
                    className="pr-10"
                  />
                  {locationDetails.unit && (
                    <button
                      type="button"
                      onClick={() =>
                        setLocationDetails((prev) => ({ ...prev, unit: '' }))
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* Show Map Toggle */}
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">SHOW MAP</Label>
                <Switch
                  checked={locationDetails.showMap}
                  onCheckedChange={handleShowMapChange}
                />
              </div>

              {/* Map Preview */}
              {locationDetails.showMap &&
                selectedPlace &&
                selectedPlace.geometry && (
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

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button
                  onClick={handleClear}
                  variant="outline"
                  className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear location
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Overlay */}
        {isMobile && isExpanded && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsExpanded(false)}
          />
        )}
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
      <div className={cn('space-y-4', className)}>
        {/* Location Input Field */}
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
              value={locationDetails.address}
              onChange={handleInputChange}
              disabled={disabled}
              className="w-full h-12 pl-12 pr-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              {...props}
            />
          </Autocomplete>
          <button
            type="button"
            onClick={handleToggleExpanded}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <Edit3 className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        {/* Expanded Location Details */}
        {isExpanded && (
          <div
            className={cn(
              'border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800',
              isMobile ? 'fixed inset-4 z-50 overflow-y-auto' : 'relative',
            )}
          >
            {isMobile && (
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Location</h3>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            <div className="space-y-4">
              {/* Address Field */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Address
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={locationDetails.address}
                    onChange={handleInputChange}
                    placeholder="Enter address"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Unit Field */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  APT / UNIT
                </Label>
                <div className="relative">
                  <Input
                    value={locationDetails.unit}
                    onChange={handleUnitChange}
                    placeholder="Enter unit number"
                    className="pr-10"
                  />
                  {locationDetails.unit && (
                    <button
                      type="button"
                      onClick={() =>
                        setLocationDetails((prev) => ({ ...prev, unit: '' }))
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* Show Map Toggle */}
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">SHOW MAP</Label>
                <Switch
                  checked={locationDetails.showMap}
                  onCheckedChange={handleShowMapChange}
                />
              </div>

              {/* Map Preview */}
              {locationDetails.showMap &&
                selectedPlace &&
                selectedPlace.geometry && (
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

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button
                  onClick={handleClear}
                  variant="outline"
                  className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear location
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Overlay */}
        {isMobile && isExpanded && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </div>
    </LoadScript>
  );
}
