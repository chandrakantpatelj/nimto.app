'use client';

import React from 'react';
import { ExternalLink, MapPin } from 'lucide-react';

export function FallbackMap({ center, className = '' }) {
  if (!center) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-500 ${className}`}
      >
        <div className="text-center p-4">
          <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No location selected</p>
        </div>
      </div>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps?q=${center.lat},${center.lng}`;
  const openStreetMapUrl = `https://www.openstreetmap.org/?mlat=${center.lat}&mlon=${center.lng}&zoom=15`;

  return (
    <div
      className={`flex items-center justify-center bg-gray-100 text-gray-500 ${className}`}
    >
      <div className="text-center p-4">
        <MapPin className="h-8 w-8 mx-auto mb-2 text-blue-500" />
        <p className="text-sm font-medium mb-2">
          Location: {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
        </p>
        <p className="text-xs text-gray-400 mb-3">
          Google Maps is blocked by ad blocker
        </p>
        <div className="flex space-x-2 justify-center">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Google Maps
          </a>
          <a
            href={openStreetMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            OpenStreetMap
          </a>
        </div>
      </div>
    </div>
  );
}
