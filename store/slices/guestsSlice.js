import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  guests: [],
  selectedGuests: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  filterStatus: 'all', // all, invited, confirmed, declined, pending
  sortBy: 'name', // name, email, status, date
  sortOrder: 'asc', // asc, desc
  bulkActions: {
    selectedIds: [],
    isSelecting: false,
  },
};

// Async thunks
export const fetchGuests = createAsyncThunk(
  'guests/fetchGuests',
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/events/${eventId}/guests`);

      if (!response.ok) {
        throw new Error('Failed to fetch guests');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const addGuest = createAsyncThunk(
  'guests/addGuest',
  async ({ eventId, guestData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/events/${eventId}/guests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(guestData),
      });

      if (!response.ok) {
        throw new Error('Failed to add guest');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateGuest = createAsyncThunk(
  'guests/updateGuest',
  async ({ eventId, guestId, guestData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/events/${eventId}/guests/${guestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(guestData),
      });

      if (!response.ok) {
        throw new Error('Failed to update guest');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteGuest = createAsyncThunk(
  'guests/deleteGuest',
  async ({ eventId, guestId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/events/${eventId}/guests/${guestId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete guest');
      }

      return guestId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const bulkUpdateGuests = createAsyncThunk(
  'guests/bulkUpdateGuests',
  async ({ eventId, guestIds, updates }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/events/${eventId}/guests/bulk`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guestIds, updates }),
      });

      if (!response.ok) {
        throw new Error('Failed to bulk update guests');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const sendInvitations = createAsyncThunk(
  'guests/sendInvitations',
  async ({ eventId, guestIds, message }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/events/${eventId}/invitations/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guestIds, message }),
      });

      if (!response.ok) {
        throw new Error('Failed to send invitations');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Guests slice
const guestsSlice = createSlice({
  name: 'guests',
  initialState,
  reducers: {
    // Guest selection
    selectGuest: (state, action) => {
      const guestId = action.payload;
      if (!state.selectedGuests.includes(guestId)) {
        state.selectedGuests.push(guestId);
      }
    },
    deselectGuest: (state, action) => {
      const guestId = action.payload;
      state.selectedGuests = state.selectedGuests.filter(
        (id) => id !== guestId,
      );
    },
    selectAllGuests: (state) => {
      state.selectedGuests = state.guests.map((guest) => guest.id);
    },
    clearSelection: (state) => {
      state.selectedGuests = [];
    },

    // Search and filter
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload;
    },

    // Bulk actions
    setBulkSelecting: (state, action) => {
      state.bulkActions.isSelecting = action.payload;
    },
    setBulkSelectedIds: (state, action) => {
      state.bulkActions.selectedIds = action.payload;
    },

    // Local guest updates (for optimistic updates)
    updateGuestStatus: (state, action) => {
      const { guestId, status } = action.payload;
      const guest = state.guests.find((g) => g.id === guestId);
      if (guest) {
        guest.status = status;
        guest.updatedAt = new Date().toISOString();
      }
    },

    // Clear state
    clearGuests: (state) => {
      state.guests = [];
      state.selectedGuests = [];
      state.searchQuery = '';
      state.filterStatus = 'all';
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch guests
      .addCase(fetchGuests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGuests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.guests = action.payload;
        state.error = null;
      })
      .addCase(fetchGuests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add guest
      .addCase(addGuest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addGuest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.guests.push(action.payload);
        state.error = null;
      })
      .addCase(addGuest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update guest
      .addCase(updateGuest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateGuest.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.guests.findIndex(
          (guest) => guest.id === action.payload.id,
        );
        if (index !== -1) {
          state.guests[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateGuest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete guest
      .addCase(deleteGuest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteGuest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.guests = state.guests.filter(
          (guest) => guest.id !== action.payload,
        );
        state.selectedGuests = state.selectedGuests.filter(
          (id) => id !== action.payload,
        );
        state.error = null;
      })
      .addCase(deleteGuest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Bulk update guests
      .addCase(bulkUpdateGuests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(bulkUpdateGuests.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update guests with new data
        action.payload.forEach((updatedGuest) => {
          const index = state.guests.findIndex(
            (guest) => guest.id === updatedGuest.id,
          );
          if (index !== -1) {
            state.guests[index] = updatedGuest;
          }
        });
        state.error = null;
      })
      .addCase(bulkUpdateGuests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Send invitations
      .addCase(sendInvitations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendInvitations.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update guest invitation status
        action.payload.forEach((guest) => {
          const index = state.guests.findIndex((g) => g.id === guest.id);
          if (index !== -1) {
            state.guests[index].invitationSent = true;
            state.guests[index].invitationSentAt = new Date().toISOString();
          }
        });
        state.error = null;
      })
      .addCase(sendInvitations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  // Selection
  selectGuest,
  deselectGuest,
  selectAllGuests,
  clearSelection,

  // Search and filter
  setSearchQuery,
  setFilterStatus,
  setSortBy,
  setSortOrder,

  // Bulk actions
  setBulkSelecting,
  setBulkSelectedIds,

  // Local updates
  updateGuestStatus,

  // Clear state
  clearGuests,
  clearError,
  setLoading,
} = guestsSlice.actions;

export default guestsSlice.reducer;
