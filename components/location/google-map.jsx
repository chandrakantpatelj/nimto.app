'use client';

import React, { useEffect, useState } from 'react';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { AlertTriangle, MapPin } from 'lucide-react';
import { FallbackMap } from './fallback-map';

export function GoogleMap({ center, className = '' }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [isBlocked, setIsBlocked] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if Google Maps is blocked by ad blockers
    const checkGoogleMaps = () => {
      if (typeof window !== 'undefined' && !window.google) {
        setTimeout(() => {
          if (!window.google) {
            setIsBlocked(true);
            setError('Google Maps is blocked by ad blocker or network issues');
          }
        }, 3000);
      }
    };

    checkGoogleMaps();
  }, []);

  if (!apiKey) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-500 ${className}`}
      >
        <div className="text-center p-4">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
          <p className="text-sm">Google Maps API key not configured</p>
        </div>
      </div>
    );
  }

  if (isBlocked || error) {
    return <FallbackMap center={center} className={className} />;
  }

  return (
    <div className={className}>
      <APIProvider apiKey={apiKey}>
        <Map
          style={{ width: '100%', height: '100%' }}
          center={center}
          defaultZoom={15}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapTypeControl={false}
          scaleControl={false}
          streetViewControl={true}
          rotateControl={false}
          fullscreenControl={false}
          zoomControl={false}
        >
          <Marker position={center} />
        </Map>
      </APIProvider>
    </div>
  );
}
