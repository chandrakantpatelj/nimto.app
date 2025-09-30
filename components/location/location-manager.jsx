'use client';

import React, { useState } from 'react';
import { Edit3, Map, MapPin, Save, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { SimpleAutocomplete } from './simple-autocomplete';
import { SimpleGoogleMap } from './simple-google-map';

export default function LocationManager({
  value = '',
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
    address: value,
    unit: '',
    showMap: initialShowMap,
  });
  const [mapCenter, setMapCenter] = useState(initialMapCenter);

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

      if (onChange) {
        onChange(newAddress);
      }
    }
  };

  const handleAddressChange = (address) => {
    setLocationDetails((prev) => ({
      ...prev,
      address,
    }));

    if (onChange) {
      onChange(address);
    }
  };

  const handleUnitChange = (unit) => {
    setLocationDetails((prev) => ({
      ...prev,
      unit,
    }));
  };

  const handleShowMapToggle = (showMap) => {
    setLocationDetails((prev) => ({
      ...prev,
      showMap,
    }));
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
      onChange('');
    }
  };

  return (
    <div className={cn('relative', className)} {...props}>
      {/* Main Input Field */}
      <div
        className={cn(
          'relative cursor-pointer',
          showBorder && 'border border-gray-300 rounded-lg',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
        onClick={() => !disabled && setIsDrawerOpen(true)}
      >
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={value}
            placeholder={placeholder}
            readOnly
            disabled={disabled}
            className="pl-10 h-12 text-base cursor-pointer"
          />
          <Edit3 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Map className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Location Manager
                </h2>
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
              <div className="space-y-2">
                <Label
                  htmlFor="address"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Address *
                </Label>
                <SimpleAutocomplete
                  value={locationDetails.address || ''}
                  onChange={handleAddressChange}
                  onPlaceSelect={handlePlaceSelect}
                  placeholder="Enter a location"
                  className="w-full"
                />
              </div>

              {/* Unit Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="unit"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Unit/Apartment (Optional)
                </Label>
                <Input
                  id="unit"
                  value={locationDetails.unit || ''}
                  onChange={(e) => handleUnitChange(e.target.value)}
                  placeholder="e.g., Apt 2B, Suite 100"
                  className="h-12 text-base"
                />
              </div>

              {/* Show Map Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Show Map
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Display a map preview for this location
                  </p>
                </div>
                <Switch
                  checked={locationDetails.showMap}
                  onCheckedChange={handleShowMapToggle}
                />
              </div>

              {/* Map Preview */}
              {locationDetails.showMap && locationDetails.address && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Map Preview
                  </Label>
                  <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-300">
                    <SimpleGoogleMap
                      center={mapCenter}
                      zoom={15}
                      className="h-full w-full"
                    />
                  </div>
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
