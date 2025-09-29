'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Autocomplete, GoogleMap, LoadScript } from '@react-google-maps/api';
import { Edit3, Map, MapPin, Save, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { markGoogleMapsAsLoaded, useGoogleMaps } from '@/hooks/use-google-maps';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const libraries = ['places'];

// Global script loading state to prevent duplicate loads
let googleMapsLoadPromise = null;

export default function LocationDrawer({
  locationAddress = '',
  locationUnit = '',
  onChange,
  placeholder = 'Enter a location',
  className = '',
  disabled = false,
  showBorder = true,
  initialShowMap = true,
  initialMapCenter = { lat: 19.076, lng: 72.8777 },
  ...props
}) {
  const [autocomplete, setAutocomplete] = useState(null);
  const isGoogleMapsLoaded = useGoogleMaps();
  const [isLoaded, setIsLoaded] = useState(isGoogleMapsLoaded);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [locationDetails, setLocationDetails] = useState({
    address: locationAddress,
    unit: locationUnit,
    showMap: initialShowMap,
  });
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [mapCenter, setMapCenter] = useState(initialMapCenter);

  // Create display value from address and unit
  const value = locationDetails.address
    ? `${locationDetails.address}${locationDetails.unit ? `, ${locationDetails.unit}` : ''}`
    : '';

  // Update local state when global Google Maps state changes
  useEffect(() => {
    setIsLoaded(isGoogleMapsLoaded);
    if (isGoogleMapsLoaded) {
      setHasError(false);
    }
  }, [isGoogleMapsLoaded]);

  // Update location details when props change
  useEffect(() => {
    setLocationDetails((prev) => ({
      ...prev,
      address: locationAddress,
      unit: locationUnit,
    }));

    // Geocode the address to get coordinates
    if (
      locationAddress &&
      typeof window !== 'undefined' &&
      window.google &&
      window.google.maps
    ) {
      try {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: locationAddress }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;
            setMapCenter({
              lat: location.lat(),
              lng: location.lng(),
            });
          }
        });
      } catch (error) {
        console.warn('Geocoding failed:', error);
      }
    }
  }, [locationAddress, locationUnit, initialShowMap, initialMapCenter]);

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

        // Update map center with selected place coordinates
        if (place.geometry && place.geometry.location) {
          setMapCenter({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          });
        }
      }
    }
  }, [autocomplete]);

  const onLoad = useCallback((ac) => {
    setAutocomplete(ac);
    setIsLoaded(true);
  }, []);

  const onScriptLoad = useCallback(() => {
    // Add a small delay to ensure Map constructor is fully initialized
    setTimeout(() => {
      setIsLoaded(true);
      setHasError(false);
      googleMapsLoadPromise = null;
      markGoogleMapsAsLoaded(); // Mark as loaded globally
    }, 100);
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

    // Geocode the address to get coordinates
    if (
      newValue &&
      typeof window !== 'undefined' &&
      window.google &&
      window.google.maps
    ) {
      try {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: newValue }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;
            setMapCenter({
              lat: location.lat(),
              lng: location.lng(),
            });
          }
        });
      } catch (error) {
        console.warn('Geocoding failed:', error);
      }
    }
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
    // Pass separate fields to parent
    onChange({
      locationAddress: locationDetails.address,
      locationUnit: locationDetails.unit,
      showMap: locationDetails.showMap,
      mapCenter: mapCenter,
    });
    setIsDrawerOpen(false);
  };

  const handleClear = () => {
    setLocationDetails({
      address: '',
      unit: '',
      showMap: true,
    });
    setSelectedPlace(null);
    onChange({
      locationAddress: '',
      locationUnit: '',
      showMap: true,
      mapCenter: initialMapCenter,
    });
    // Don't close the drawer - let user continue editing
  };

  const handleFieldClick = () => {
    if (!disabled) {
      setIsDrawerOpen(true);
    }
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  // Fallback to regular input if no API key
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className={cn('relative', className)}>
        <div
          className={cn(
            'relative cursor-pointer',
            showBorder && 'border border-gray-300 rounded-lg',
            disabled && 'cursor-not-allowed opacity-50',
          )}
          onClick={handleFieldClick}
        >
          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder={placeholder}
            value={value}
            readOnly
            disabled={disabled}
            className="w-full h-12 pl-12 pr-4 text-base border-0 focus:outline-none rounded-lg bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            {...props}
          />
        </div>
      </div>
    );
  }

  // If Google Maps is already loaded, render without LoadScript
  if (
    isGoogleMapsLoaded &&
    typeof window !== 'undefined' &&
    window.google &&
    window.google.maps
  ) {
    return (
      <div className={cn('relative', className)}>
        {/* Location Input Field */}
        <div
          className={cn(
            'relative cursor-pointer',
            showBorder && 'border border-gray-300 rounded-lg',
            disabled && 'cursor-not-allowed opacity-50',
          )}
          onClick={handleFieldClick}
        >
          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder={placeholder}
            value={locationDetails.address}
            readOnly
            disabled={disabled}
            className="w-full h-12 pl-12 pr-12 text-base border-0 focus:outline-none rounded-lg bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            {...props}
          />
          <Edit3 className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>

        {/* Drawer Overlay */}
        {isDrawerOpen && (
          <div
            className="fixed inset-0 backdrop-blur-sm bg-black/20 z-50"
            onClick={handleCloseDrawer}
          />
        )}

        {/* Drawer Content */}
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Location Details
                </h3>
                <button
                  onClick={handleCloseDrawer}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-6 space-y-6">
                {/* Address Field */}
                <div>
                  <Label className="text-sm font-medium mb-3 block text-gray-700 dark:text-gray-300">
                    Address *
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                      <Input
                        value={locationDetails.address}
                        onChange={handleInputChange}
                        placeholder="Enter address"
                        className="pl-10 h-12 text-base"
                      />
                    </Autocomplete>
                  </div>
                </div>

                {/* Unit Field */}
                <div>
                  <Label className="text-sm font-medium mb-3 block text-gray-700 dark:text-gray-300">
                    APT / UNIT
                  </Label>
                  <div className="relative">
                    <Input
                      value={locationDetails.unit}
                      onChange={handleUnitChange}
                      placeholder="Enter unit number (optional)"
                      className="pr-10 h-12 text-base"
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
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Show Map
                  </Label>
                  <Switch
                    checked={locationDetails.showMap}
                    onCheckedChange={handleShowMapChange}
                  />
                </div>

                {/* Map Preview */}
                {locationDetails.showMap && locationDetails.address && (
                  <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-300">
                    <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '100%' }}
                      center={mapCenter}
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

                {/* Error Message */}
                {hasError && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errorMessage}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSave}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Location
                  </Button>
                  <Button
                    onClick={handleClear}
                    variant="outline"
                    className="flex-1 text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </div>
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
      <div className={cn('relative', className)}>
        {/* Location Input Field */}
        <div
          className={cn(
            'relative cursor-pointer',
            showBorder && 'border border-gray-300 rounded-lg',
            disabled && 'cursor-not-allowed opacity-50',
          )}
          onClick={handleFieldClick}
        >
          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder={placeholder}
            value={locationDetails.address}
            readOnly
            disabled={disabled}
            className="w-full h-12 pl-12 pr-12 text-base border-0 focus:outline-none rounded-lg bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            {...props}
          />
          <Edit3 className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>

        {/* Drawer Overlay */}
        {isDrawerOpen && (
          <div
            className="fixed inset-0 backdrop-blur-sm bg-black/20 z-50"
            onClick={handleCloseDrawer}
          />
        )}

        {/* Drawer Content */}
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Location Details
                </h3>
                <button
                  onClick={handleCloseDrawer}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-6 space-y-6">
                {/* Address Field */}
                <div>
                  <Label className="text-sm font-medium mb-3 block text-gray-700 dark:text-gray-300">
                    Address *
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                        <Input
                          value={locationDetails.address}
                          onChange={handleInputChange}
                          placeholder="Enter address"
                          className="pl-10"
                        />
                      </Autocomplete>
                    ) : (
                      <Input
                        value={locationDetails.address}
                        onChange={handleInputChange}
                        placeholder="Loading Google Maps..."
                        className="pl-10"
                        disabled
                      />
                    )}
                  </div>
                </div>

                {/* Unit Field */}
                <div>
                  <Label className="text-sm font-medium mb-3 block text-gray-700 dark:text-gray-300">
                    APT / UNIT
                  </Label>
                  <div className="relative">
                    <Input
                      value={locationDetails.unit}
                      onChange={handleUnitChange}
                      placeholder="Enter unit number (optional)"
                      className="pr-10 h-12 text-base"
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
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Show Map
                  </Label>
                  <Switch
                    checked={locationDetails.showMap}
                    onCheckedChange={handleShowMapChange}
                  />
                </div>

                {/* Map Preview */}
                {locationDetails.showMap && locationDetails.address && (
                  <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-300">
                    <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '100%' }}
                      center={mapCenter}
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

                {/* Error Message */}
                {hasError && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errorMessage}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSave}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Location
                  </Button>
                  <Button
                    onClick={handleClear}
                    variant="outline"
                    className="flex-1 text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </LoadScript>
  );
}
