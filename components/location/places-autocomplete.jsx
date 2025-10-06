import React, { useEffect, useRef, useState } from 'react';
import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps';

function PlacesAutocomplete({ value, onChange, onPlaceSelect }) {
  const places = useMapsLibrary('places');
  const [service, setService] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    if (places) {
      setService(new places.AutocompleteService());
    }
  }, [places]);

  const fetchPredictions = (input) => {
    if (!service || !input) {
      setPredictions([]);
      return;
    }

    service.getPlacePredictions({ input }, (results) => {
      setPredictions(results || []);
    });
  };

  const handleSelect = (prediction) => {
    if (!prediction) return;

    // Load full place details
    const detailsService = new places.PlacesService(
      document.createElement('div'),
    );
    detailsService.getDetails(
      { placeId: prediction.place_id },
      (place, status) => {
        if (status === 'OK') {
          onPlaceSelect?.(place);
          onChange(place.formatted_address || prediction.description);
        }
      },
    );
    setPredictions([]);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        placeholder="Search places..."
        onChange={(e) => {
          onChange(e.target.value);
          fetchPredictions(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown')
            setActiveIndex((i) => Math.min(i + 1, predictions.length - 1));
          if (e.key === 'ArrowUp') setActiveIndex((i) => Math.max(i - 1, 0));
          if (e.key === 'Enter' && predictions[activeIndex]) {
            handleSelect(predictions[activeIndex]);
          }
        }}
        className="w-full h-12 border p-2 rounded-lg"
      />

      {predictions.length > 0 && (
        <ul className="absolute bg-white border w-full rounded-lg shadow-lg mt-1 z-50">
          {predictions.map((p, i) => (
            <li
              key={p.place_id}
              className={`px-4 py-2 cursor-pointer ${
                i === activeIndex ? 'bg-gray-200' : ''
              }`}
              onMouseDown={() => handleSelect(p)} // use mousedown so input blur doesn't cancel
            >
              {p.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function PlacesAutocompleteWrapper(props) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  return (
    <APIProvider apiKey={apiKey}>
      <PlacesAutocomplete {...props} />
    </APIProvider>
  );
}
