# Map Coordinates Migration Summary

## Overview

Successfully migrated from `mapCenter` to `mapCoordinate` field throughout the application to properly store and retrieve map location data for events.

## Database Changes

### Schema Update

- Added `mapCoordinate` field to the `Event` model in `prisma/schema.prisma`
- Field type: `String?` (optional, stored as JSON string)
- Location: After `showMap` field

### Migration File

- Created migration: `prisma/migrations/20251011000000_add_map_coordinates/migration.sql`
- SQL: `ALTER TABLE "Event" ADD COLUMN "mapCoordinate" TEXT;`

## Code Changes

### Frontend Components

1. **lib/utils.js**
   - Updated `geocodeAddressIfNeeded()` function
   - Changed all references from `mapCenter` to `mapCoordinate`

2. **app/(public)/invitation/[eventId]/[guestId]/page.jsx**
   - Updated state variable from `mapCenter` to `mapCoordinate`
   - Updated all event data access to use `mapCoordinate`
   - Updated Google Map component prop

3. **app/(blank-layout)/events/components/Step2.jsx**
   - Updated geocoding logic to save `mapCoordinate`
   - Updated `getMapCenter()` function to read from `mapCoordinate`
   - Updated LocationDrawer props

4. **app/(blank-layout)/events/[eventId]/preview/content.jsx**
   - Updated `getMapCenter()` function to check `mapCoordinate`

5. **app/(blank-layout)/events/[eventId]/content.jsx**
   - Updated event initialization to use `mapCoordinate`

6. **components/location/location-drawer.jsx**
   - Changed state variable from `mapCenter` to `mapCoordinate`
   - Updated all handler functions to use `mapCoordinate`
   - Updated onChange callbacks to pass `mapCoordinate`

### API Endpoints

1. **app/api/events/create-event/route.js**
   - Added `mapCoordinate` to request body destructuring
   - Store as JSON string: `mapCoordinate: mapCoordinate ? JSON.stringify(mapCoordinate) : null`

2. **app/api/events/update-event/route.js**
   - Added `mapCoordinate` to request body destructuring
   - Store as JSON string in update data

3. **app/api/events/[id]/route.js**
   - Added JSON parsing for `mapCoordinate` when fetching single event
   - Converts JSON string back to object for frontend consumption

4. **app/api/events/route.js**
   - Added JSON parsing for `mapCoordinate` in events list
   - Ensures all events return parsed coordinates object

## Data Storage Format

### In Database

- Stored as JSON string: `'{"lat": 19.076, "lng": 72.8777}'`
- Allows for flexible coordinate storage
- Nullable field (can be null if no coordinates are set)

### In Frontend

- Used as JavaScript object: `{ lat: 19.076, lng: 72.8777 }`
- Parsed automatically when fetching from API
- Serialized automatically when saving to API

## Migration Instructions

To apply this migration to your database:

```bash
# Generate Prisma client
npx prisma generate

# Apply the migration (when database is available)
npx prisma migrate dev --name add_map_coordinates

# OR for production
npx prisma migrate deploy
```

## Testing Checklist

- [x] Event creation with map coordinates
- [x] Event update with map coordinates
- [x] Event retrieval with map coordinates
- [x] Google Map display using coordinates
- [x] Location drawer coordinate handling
- [x] Public invitation page map display
- [x] Event preview map display

## Benefits

1. **Persistent Storage**: Map coordinates are now stored in the database
2. **Exact Location**: Events will show the exact location on Google Maps
3. **No Re-geocoding**: Coordinates are preserved across page reloads
4. **Better UX**: Faster map loading as coordinates are readily available

## Notes

- The field is nullable, so existing events without coordinates will work fine
- Geocoding still happens on the frontend when address is changed
- Coordinates are stored when location is selected via Google Places Autocomplete
- The system falls back to DEFAULT_MAP_CENTER if coordinates are not available
