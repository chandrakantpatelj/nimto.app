# Location Components

This directory contains Google Places API integration components for location search and autocomplete functionality.

## Components

### GooglePlacesAutocomplete

A simple Google Places autocomplete component for location search.

**Props:**

- `value` (string): Current location value
- `onChange` (function): Callback when location changes
- `placeholder` (string): Input placeholder text
- `className` (string): Additional CSS classes
- `disabled` (boolean): Whether input is disabled

**Usage:**

```jsx
import { GooglePlacesAutocomplete } from '@/components/location';

<GooglePlacesAutocomplete
  value={location}
  onChange={setLocation}
  placeholder="Enter a location"
/>;
```

### AdvancedGooglePlacesAutocomplete

An enhanced version with additional features like map preview and place details.

**Props:**

- All props from `GooglePlacesAutocomplete`
- `onPlaceSelect` (function): Callback with detailed place data
- `showMap` (boolean): Show map preview of selected location
- `mapCenter` (object): Default map center coordinates

**Usage:**

```jsx
import { AdvancedGooglePlacesAutocomplete } from '@/components/location';

<AdvancedGooglePlacesAutocomplete
  value={location}
  onChange={setLocation}
  onPlaceSelect={(place) => console.log(place)}
  showMap={true}
  placeholder="Enter a location"
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
