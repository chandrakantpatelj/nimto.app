'use client';

import React, { useEffect, useState } from 'react';
import { LoadScript } from '@react-google-maps/api';

export function GoogleMapsDiagnostic() {
  const [diagnostics, setDiagnostics] = useState({
    apiKey: false,
    scriptLoading: false,
    googleObject: false,
    mapsObject: false,
    placesObject: false,
    errors: [],
  });

  useEffect(() => {
    const checkDiagnostics = () => {
      const newDiagnostics = {
        apiKey: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        scriptLoading: false,
        googleObject: false,
        mapsObject: false,
        placesObject: false,
        errors: [],
      };

      try {
        if (typeof window !== 'undefined') {
          newDiagnostics.googleObject = !!window.google;

          if (window.google) {
            newDiagnostics.mapsObject = !!window.google.maps;

            if (window.google.maps) {
              newDiagnostics.placesObject = !!window.google.maps.places;
            }
          }
        }
      } catch (error) {
        newDiagnostics.errors.push(
          `Error checking Google objects: ${error.message}`,
        );
      }

      setDiagnostics(newDiagnostics);
    };

    checkDiagnostics();
    const interval = setInterval(checkDiagnostics, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleScriptLoad = () => {
    setDiagnostics((prev) => ({
      ...prev,
      scriptLoading: true,
    }));
  };

  const handleScriptError = (error) => {
    setDiagnostics((prev) => ({
      ...prev,
      errors: [
        ...prev.errors,
        `Script Error: ${error.message || 'Unknown error'}`,
      ],
    }));
  };

  return (
    <div className="p-6 bg-white border rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Google Maps Diagnostic</h3>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <span
            className={`w-3 h-3 rounded-full ${diagnostics.apiKey ? 'bg-green-500' : 'bg-red-500'}`}
          ></span>
          <span>
            API Key: {diagnostics.apiKey ? '✅ Configured' : '❌ Missing'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`w-3 h-3 rounded-full ${diagnostics.scriptLoading ? 'bg-green-500' : 'bg-yellow-500'}`}
          ></span>
          <span>
            Script Loading:{' '}
            {diagnostics.scriptLoading ? '✅ Loaded' : '⏳ Loading...'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`w-3 h-3 rounded-full ${diagnostics.googleObject ? 'bg-green-500' : 'bg-red-500'}`}
          ></span>
          <span>
            window.google:{' '}
            {diagnostics.googleObject ? '✅ Available' : '❌ Not Available'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`w-3 h-3 rounded-full ${diagnostics.mapsObject ? 'bg-green-500' : 'bg-red-500'}`}
          ></span>
          <span>
            window.google.maps:{' '}
            {diagnostics.mapsObject ? '✅ Available' : '❌ Not Available'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`w-3 h-3 rounded-full ${diagnostics.placesObject ? 'bg-green-500' : 'bg-red-500'}`}
          ></span>
          <span>
            window.google.maps.places:{' '}
            {diagnostics.placesObject ? '✅ Available' : '❌ Not Available'}
          </span>
        </div>
      </div>

      {diagnostics.errors.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
          <h4 className="font-medium text-red-800 mb-2">Errors:</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {diagnostics.errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4">
        <LoadScript
          googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
          libraries={['places']}
          onLoad={handleScriptLoad}
          onError={handleScriptError}
          preventGoogleFontsLoading={true}
        >
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              LoadScript wrapper is active. Check the diagnostics above to see
              loading status.
            </p>
          </div>
        </LoadScript>
      </div>

      <div className="mt-4 p-3 bg-gray-50 border rounded">
        <h4 className="font-medium mb-2">Console Check:</h4>
        <p className="text-sm text-gray-600">
          Open browser console (F12) and look for:
        </p>
        <ul className="text-sm text-gray-600 mt-1 space-y-1">
          <li>
            • <code>net::ERR_BLOCKED_BY_CLIENT</code> - Ad blocker issue
          </li>
          <li>
            • <code>TypeError: Cannot read properties of undefined</code> -
            Google object not loaded
          </li>
          <li>
            • <code>Google Maps API Error</code> - API key or network issue
          </li>
        </ul>
      </div>
    </div>
  );
}
