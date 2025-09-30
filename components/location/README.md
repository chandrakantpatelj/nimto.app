# Location Components

This directory contains Google Places API integration components for location search and map functionality.

## Components

### LocationDrawer

A comprehensive location selection component with autocomplete and map preview.

**Features:**

- Google Places autocomplete
- Interactive map preview
- Address and unit input
- Show/hide map toggle

**Usage:**

```jsx
import LocationDrawer from '@/components/location/location-drawer';

<LocationDrawer
  locationAddress={address}
  locationUnit={unit}
  onChange={(locationData) => {
    console.log(locationData);
  }}
  placeholder="Enter a location"
/>;
```

### GoogleMap

A Google Maps component for displaying locations with full interaction support.

**Props:**

- `center` (object): Map center coordinates {lat, lng}
- `className` (string): Additional CSS classes

**Usage:**

```jsx
import { GoogleMap } from '@/components/location/google-map';

<GoogleMap center={{ lat: 19.076, lng: 72.8777 }} className="h-64 w-full" />;
```

### PlacesAutocomplete

A Google Places autocomplete component for location search.

**Props:**

- `value` (string): Current location value
- `onChange` (function): Callback when location changes
- `onPlaceSelect` (function): Callback with detailed place data
- `placeholder` (string): Input placeholder text

**Usage:**

```jsx
import { PlacesAutocompleteWrapper } from '@/components/location/places-autocomplete';

<PlacesAutocompleteWrapper
  value={location}
  onChange={setLocation}
  onPlaceSelect={(place) => console.log(place)}
  placeholder="Search for a location..."
/>;
```

## Environment Setup

Make sure to set your Google Maps API key in your environment variables:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

## Features

- ✅ Google Places Autocomplete
- ✅ Real-time location suggestions
- ✅ Detailed place information
- ✅ Map preview (Advanced version)
- ✅ Responsive design
- ✅ Dark mode support
- ✅ TypeScript support
- ✅ Accessibility features

## Future Enhancements

- [ ] Custom map markers
- [ ] Distance calculation
- [ ] Multiple location selection
- [ ] Location history
- [ ] Custom styling options
- [ ] Geolocation detection
