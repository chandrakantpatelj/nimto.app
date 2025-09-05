# Redux Implementation Guide

## Overview

This project uses Redux Toolkit for state management, providing a centralized store for managing application state across components.

## Store Structure

### Main Store Configuration

- **File**: `store/index.js`
- **Features**: Redux Toolkit, Redux Persist, DevTools integration
- **Persistence**: Auth and UI state persisted to localStorage

### Slices

#### 1. Events Slice (`store/slices/eventsSlice.js`)

**Purpose**: Manages all event-related state and operations

**State Structure**:

```javascript
{
  // Event selection and editing
  selectedEvent: null,    // Event selected for viewing/editing
  creationStep: 0,        // Event creation step

  // Events storage
  events: [],             // All events from API
  eventsById: {},         // Normalized events by ID

  // Loading and error states
  isLoading: false,
  error: null
}
```

**Async Thunks**:

- `createEvent(eventData)` - Create new event
- `fetchAllEvents()` - Fetch all events
- `fetchEventById(eventId)` - Fetch single event
- `updateEvent({eventId, eventData})` - Update event
- `deleteEvent(eventId)` - Delete event (with optimistic updates)

**Actions**:

- `setCreationStep(step)` - Set event creation step
- `setSelectedEvent(event)` - Set selected event for viewing/editing
- `updateSelectedEvent(data)` - Update selected event data
- `resetEventCreation()` - Reset event creation state
- `clearError()` - Clear error state

#### 2. Auth Slice (`store/slices/authSlice.js`)

**Purpose**: Manages user authentication state

#### 3. Templates Slice (`store/slices/templatesSlice.js`)

**Purpose**: Manages event templates

#### 4. UI Slice (`store/slices/uiSlice.js`)

**Purpose**: Manages UI state (modals, loading states, etc.)

#### 5. Store Client Slice (`store/slices/storeClientSlice.js`)

**Purpose**: Manages store client state

#### 6. Guests Slice (`store/slices/guestsSlice.js`)

**Purpose**: Manages guest-related state

#### 7. Design Slice (Removed - Not Used)

**Purpose**: Was intended to manage design-related state but was never actually used in the application. Removed to reduce complexity.

## Custom Hooks

### Event Hooks (`store/hooks.js`)

#### Selectors

```javascript
// Get all events
const events = useAllEvents();

// Get events by ID lookup
const eventsById = useEventsById();

// Get specific event by ID
const event = useEventById(eventId);

// Get selected event
const selectedEvent = useSelectedEvent();

// Get filtered events (returns all events)
const filteredEvents = useFilteredEvents();
```

#### Actions

```javascript
const {
  // Event creation
  setCreationStep,
  setCurrentEvent,
  updateCurrentEvent,
  resetEventCreation,

  // Event selection
  setSelectedEvent,

  // Event management
  addEventToStore,
  updateEventInStore,

  // API calls
  createEvent,
  fetchAllEvents,
  fetchEventById,
  updateEvent,
  deleteEvent,

  // Error handling
  clearError,
} = useEventActions();
```

#### Complete Events State

```javascript
const {
  events, // All events array
  eventsById, // Events by ID lookup
  selectedEvent, // Selected event for viewing/editing
  creationStep, // Creation step
  isLoading, // Loading state
  error, // Error state
} = useEvents();
```

## Usage Examples

### Basic Event Operations

#### Fetch All Events

```javascript
import { useEventActions, useEvents } from '@/store/hooks';

const EventsPage = () => {
  const { fetchAllEvents } = useEventActions();
  const { events, isLoading, error } = useEvents();

  useEffect(() => {
    fetchAllEvents();
  }, [fetchAllEvents]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {events.map((event) => (
        <div key={event.id}>{event.title}</div>
      ))}
    </div>
  );
};
```

#### Create Event

```javascript
const CreateEventForm = () => {
  const { createEvent } = useEventActions();

  const handleSubmit = (eventData) => {
    createEvent(eventData);
  };

  // Form JSX...
};
```

#### Delete Event

```javascript
const EventCard = ({ event }) => {
  const { deleteEvent } = useEventActions();

  const handleDelete = () => {
    deleteEvent(event.id); // Includes optimistic update
  };

  return (
    <div>
      <h3>{event.title}</h3>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
};
```

### Event Creation Flow

```javascript
const EventCreation = () => {
  const {
    selectedEvent,
    creationStep,
    setSelectedEvent,
    updateSelectedEvent,
    setCreationStep,
  } = useEvents();

  const handleNext = () => {
    setCreationStep(creationStep + 1);
  };

  const handleUpdateEvent = (data) => {
    updateCurrentEvent(data);
  };

  // Creation flow JSX...
};
```

## Key Features

### 1. Optimistic Updates

- Delete operations update UI immediately
- API calls happen in background
- Error handling for failed operations

### 2. Data Normalization

- Events stored in both array and object formats
- `eventsById` provides O(1) lookup by ID
- Efficient updates and deletions

### 3. Local Filtering

- Components handle their own filtering logic
- No Redux overhead for simple search/filter operations
- Better performance for UI interactions

### 4. Error Handling

- Centralized error state
- Easy error clearing
- Consistent error handling across components

### 5. Loading States

- Global loading state for API operations
- Component-level loading management
- Better user experience

## Best Practices

### 1. Use Custom Hooks

Always use the custom hooks instead of direct Redux hooks:

```javascript
// ✅ Good
const { events } = useEvents();

// ❌ Avoid
const events = useSelector((state) => state.events.events);
```

### 2. Local State for UI

Use local state for component-specific UI logic:

```javascript
// ✅ Good - Local filtering
const [searchQuery, setSearchQuery] = useState('');

// ❌ Avoid - Redux for simple UI state
const { setSearchQuery } = useEventActions();
```

### 3. Error Handling

Always handle loading and error states:

```javascript
const { events, isLoading, error } = useEvents();

if (isLoading) return <Loading />;
if (error) return <Error message={error} />;
```

### 4. Optimistic Updates

Trust the optimistic updates for better UX:

```javascript
// ✅ Good - Optimistic delete
deleteEvent(eventId); // UI updates immediately

// ❌ Avoid - Wait for API response
const result = await deleteEvent(eventId);
if (result.success) {
  // Update UI
}
```

## File Structure

```
store/
├── index.js                 # Store configuration
├── hooks.js                 # Custom hooks
└── slices/
    ├── eventsSlice.js       # Events management
    ├── authSlice.js         # Authentication
    ├── templatesSlice.js    # Templates
    ├── uiSlice.js           # UI state
    ├── storeClientSlice.js  # Store client
    ├── guestsSlice.js       # Guests
    └── (designSlice.js removed - not used)
```

## Dependencies

- `@reduxjs/toolkit` - Redux Toolkit
- `react-redux` - React Redux bindings
- `redux-persist` - State persistence
- `redux-devtools-extension` - DevTools integration
