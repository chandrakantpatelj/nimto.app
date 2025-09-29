'use client';

import React, { useState } from 'react';
import { Edit3, Map, MapPin, Save, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SimpleAutocomplete } from './simple-autocomplete';
import { SimpleGoogleMap } from './simple-google-map';

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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [locationDetails, setLocationDetails] = useState({
    address: locationAddress,
    unit: locationUnit,
    showMap: initialShowMap,
  });
  const [mapCenter, setMapCenter] = useState(initialMapCenter);

  // Create display value from address and unit
  const value = locationDetails.address
    ? `${locationDetails.address}${locationDetails.unit ? `, ${locationDetails.unit}` : ''}`
    : '';

  // Update location details when props change
  React.useEffect(() => {
    setLocationDetails({
      address: locationAddress,
      unit: locationUnit,
      showMap: initialShowMap,
    });
  }, [locationAddress, locationUnit, initialShowMap]);

  const handlePlaceSelect = (place) => {
    if (place && place.geometry && place.geometry.location) {
      const newAddress = place.formatted_address || place.name || '';
      const newMapCenter = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };

      setLocationDetails((prev) => ({
        ...prev,
        address: newAddress,
      }));
      setMapCenter(newMapCenter);

      // Call the parent onChange with the new values
      if (onChange) {
        onChange({
          address: newAddress,
          unit: locationDetails.unit,
          showMap: locationDetails.showMap,
          mapCenter: newMapCenter,
        });
      }
    }
  };

  const handleAddressChange = (address) => {
    setLocationDetails((prev) => ({
      ...prev,
      address,
    }));

    // Call the parent onChange with the new values
    if (onChange) {
      onChange({
        address,
        unit: locationDetails.unit,
        showMap: locationDetails.showMap,
        mapCenter,
      });
    }
  };

  const handleUnitChange = (unit) => {
    setLocationDetails((prev) => ({
      ...prev,
      unit,
    }));

    // Call the parent onChange with the new values
    if (onChange) {
      onChange({
        address: locationDetails.address,
        unit,
        showMap: locationDetails.showMap,
        mapCenter,
      });
    }
  };

  const handleShowMapToggle = (showMap) => {
    setLocationDetails((prev) => ({
      ...prev,
      showMap,
    }));

    // Call the parent onChange with the new values
    if (onChange) {
      onChange({
        address: locationDetails.address,
        unit: locationDetails.unit,
        showMap,
        mapCenter,
      });
    }
  };

  const handleSave = () => {
    setIsDrawerOpen(false);
  };

  const handleClear = () => {
    setLocationDetails({
      address: '',
      unit: '',
      showMap: initialShowMap,
    });
    setMapCenter(initialMapCenter);

    if (onChange) {
      onChange({
        address: '',
        unit: '',
        showMap: initialShowMap,
        mapCenter: initialMapCenter,
      });
    }
  };

  return (
    <div className={cn('relative', className)} {...props}>
      {/* Main Input Field */}
      <div
        className={cn(
          'relative cursor-pointer transition-all duration-200 hover:shadow-sm',
          showBorder &&
            'border-2 border-gray-300 rounded-lg hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20',
        )}
        onClick={() => setIsDrawerOpen(true)}
      >
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={value}
            placeholder={placeholder}
            readOnly
            className="w-full h-12 pl-10 pr-10 text-base cursor-pointer border-0 focus:ring-0 focus:outline-none bg-white text-gray-900 placeholder-gray-500 hover:bg-gray-50 transition-colors rounded-md"
          />
          <Edit3 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/20 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <Map className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Location Details
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Search and select your event location
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDrawerOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Address Input */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <Label
                    htmlFor="address"
                    className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    Event Address *
                  </Label>
                </div>
                <SimpleAutocomplete
                  value={locationDetails.address || ''}
                  onChange={handleAddressChange}
                  onPlaceSelect={handlePlaceSelect}
                  placeholder="Search for a location..."
                  className="w-full"
                />
              </div>

              {/* Unit Input */}
              <div className="space-y-3">
                <Label
                  htmlFor="unit"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Additional Details (Optional)
                </Label>
                <Input
                  id="unit"
                  value={locationDetails.unit || ''}
                  onChange={(e) => handleUnitChange(e.target.value)}
                  placeholder="e.g., Apt 2B, Suite 100, Floor 3, Room 301"
                  className="h-12 text-base border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>

              {/* Show Map Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Map className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Show Map Preview
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Display interactive map for this location
                    </p>
                  </div>
                </div>
                <Switch
                  checked={locationDetails.showMap}
                  onCheckedChange={handleShowMapToggle}
                />
              </div>

              {/* Map Preview */}
              {locationDetails.showMap && locationDetails.address && (
                <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-300 shadow-sm">
                  <SimpleGoogleMap
                    key={`${mapCenter.lat}-${mapCenter.lng}`}
                    center={mapCenter}
                    zoom={15}
                    className="h-full w-full"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={handleClear}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
