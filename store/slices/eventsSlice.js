import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Initial state - SIMPLIFIED
const initialState = {
  // Event selection and editing state
  selectedEvent: null, // Event selected for viewing/editing (mutable)
  selectedTemplate: null, // Template selected for creating new event
  creationStep: 0,

  // Events storage
  events: [], // All events from API
  eventsById: {}, // Normalized events by ID for faster lookup

  // Loading and error states
  isLoading: false,
  error: null,
};

// Async thunks
export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (eventData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - Please log in');
        }
        if (response.status === 403) {
          throw new Error(
            'Forbidden - Only hosts and administrators can create events',
          );
        }
        throw new Error('Failed to create event');
      }

      const result = await response.json();
      return result.data; // Extract the event from the API response
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`/api/events?${queryParams}`);

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const result = await response.json();
      return result.data; // Extract the events from the API response
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchAllEvents = createAsyncThunk(
  'events/fetchAllEvents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/events');

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - Please log in');
        }
        throw new Error('Failed to fetch all events');
      }

      const result = await response.json();
      return result.data; // Extract the events array from the API response
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchEventById = createAsyncThunk(
  'events/fetchEventById',
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/events/${eventId}`);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - Please log in');
        }
        if (response.status === 403) {
          throw new Error('Forbidden - Access denied');
        }
        throw new Error('Failed to fetch event');
      }

      const result = await response.json();
      return result.data; // Extract the event from the API response
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ eventId, eventData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - Please log in');
        }
        if (response.status === 403) {
          throw new Error(
            'Forbidden - Only hosts and administrators can update events',
          );
        }
        throw new Error('Failed to update event');
      }

      const result = await response.json();
      return result.data; // Extract the event from the API response
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - Please log in');
        }
        if (response.status === 403) {
          throw new Error(
            'Forbidden - Only hosts and administrators can delete events',
          );
        }
        throw new Error('Failed to delete event');
      }

      return eventId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Events slice
const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    // Event creation actions
    setCreationStep: (state, action) => {
      state.creationStep = action.payload;
    },
    setSelectedEvent: (state, action) => {
      state.selectedEvent = action.payload;
    },
    updateSelectedEvent: (state, action) => {
      state.selectedEvent = { ...state.selectedEvent, ...action.payload };
    },
    setSelectedTemplate: (state, action) => {
      state.selectedTemplate = action.payload;
    },
    clearSelectedTemplate: (state) => {
      state.selectedTemplate = null;
    },
    resetEventCreation: (state) => {
      state.creationStep = 0;
      state.selectedEvent = null;
      state.selectedTemplate = null;
    },

    // Event management actions
    addEventToStore: (state, action) => {
      const event = action.payload;
      state.events.push(event);
      state.eventsById[event.id] = event;
    },
    updateEventInStore: (state, action) => {
      const updatedEvent = action.payload;

      // Update in eventsById
      state.eventsById[updatedEvent.id] = updatedEvent;

      // Update in events array
      const eventIndex = state.events.findIndex(
        (event) => event.id === updatedEvent.id,
      );
      if (eventIndex !== -1) {
        state.events[eventIndex] = updatedEvent;
      }
    },
    removeEventFromStore: (state, action) => {
      const eventId = action.payload;

      // Remove from events array
      state.events = state.events.filter((event) => event.id !== eventId);

      // Remove from normalized data
      delete state.eventsById[eventId];
    },

    // Error handling
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create event
      .addCase(createEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        const event = action.payload;
        state.events.push(event);
        state.eventsById[event.id] = event;
        state.error = null;
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch all events
      .addCase(fetchAllEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        const events = action.payload;

        // Update events
        state.events = events;

        // Normalize events for faster lookups
        const eventsById = {};
        events.forEach((event) => {
          eventsById[event.id] = event;
        });
        state.eventsById = eventsById;

        state.error = null;
      })
      .addCase(fetchAllEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch event by ID
      .addCase(fetchEventById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.isLoading = false;
        const event = action.payload;

        // Add to eventsById if not already present
        if (!state.eventsById[event.id]) {
          state.events.push(event);
        }
        state.eventsById[event.id] = event;

        state.error = null;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update event
      .addCase(updateEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedEvent = action.payload;

        // Update in eventsById
        state.eventsById[updatedEvent.id] = updatedEvent;

        // Update in events array
        const eventIndex = state.events.findIndex(
          (event) => event.id === updatedEvent.id,
        );
        if (eventIndex !== -1) {
          state.events[eventIndex] = updatedEvent;
        }

        // Update selectedEvent if it's the same event
        if (state.selectedEvent?.id === updatedEvent.id) {
          state.selectedEvent = updatedEvent;
        }

        state.error = null;
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Delete event
      .addCase(deleteEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        const eventId = action.payload;

        // Remove from events array
        state.events = state.events.filter((event) => event.id !== eventId);

        // Remove from normalized data
        delete state.eventsById[eventId];

        state.error = null;
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  // Event creation
  setCreationStep,
  setSelectedEvent,
  updateSelectedEvent,
  setSelectedTemplate,
  clearSelectedTemplate,
  resetEventCreation,

  // Event management
  addEventToStore,
  updateEventInStore,
  removeEventFromStore,

  // Error handling
  clearError,
} = eventsSlice.actions;

export default eventsSlice.reducer;
