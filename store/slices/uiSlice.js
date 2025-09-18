import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  // Theme and appearance
  theme: 'light',
  sidebarCollapsed: false,
  sidebarOpen: false,

  // Loading states
  globalLoading: false,
  loadingMessage: '',

  // Modals and dialogs
  modals: {
    createEvent: false,
    editEvent: false,
    deleteEvent: false,
    inviteGuests: false,
    templatePreview: false,
    imageUpload: false,
    settings: false,
  },

  // Notifications
  notifications: [],

  // UI preferences
  preferences: {
    animations: true,
    soundEffects: false,
    compactMode: false,
    showTooltips: true,
  },

  // Navigation
  currentPage: '',
  breadcrumbs: [],

  // Mobile
  isMobile: false,
  mobileMenuOpen: false,

  // Search
  searchOpen: false,
  searchQuery: '',

  // Error states
  error: null,
  errorMessage: '',
};

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme actions
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },

    // Sidebar actions
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },

    // Loading actions
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload;
    },
    setLoadingMessage: (state, action) => {
      state.loadingMessage = action.payload;
    },

    // Modal actions
    openModal: (state, action) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach((key) => {
        state.modals[key] = false;
      });
    },

    // Notification actions
    addNotification: (state, action) => {
      const notification = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...action.payload,
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload,
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Preferences actions
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    setPreference: (state, action) => {
      const { key, value } = action.payload;
      state.preferences[key] = value;
    },

    // Navigation actions
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setBreadcrumbs: (state, action) => {
      state.breadcrumbs = action.payload;
    },

    // Mobile actions
    setIsMobile: (state, action) => {
      state.isMobile = action.payload;
    },
    setMobileMenuOpen: (state, action) => {
      state.mobileMenuOpen = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },

    // Search actions
    setSearchOpen: (state, action) => {
      state.searchOpen = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    toggleSearch: (state) => {
      state.searchOpen = !state.searchOpen;
    },

    // Error actions
    setError: (state, action) => {
      state.error = action.payload;
      state.errorMessage = action.payload?.message || '';
    },
    clearError: (state) => {
      state.error = null;
      state.errorMessage = '';
    },

    // Reset UI state
    resetUI: (state) => {
      return {
        ...initialState,
        theme: state.theme,
        preferences: state.preferences,
      };
    },
  },
});

export const {
  // Theme
  setTheme,
  toggleTheme,

  // Sidebar
  setSidebarCollapsed,
  toggleSidebar,
  setSidebarOpen,

  // Loading
  setGlobalLoading,
  setLoadingMessage,

  // Modals
  openModal,
  closeModal,
  closeAllModals,

  // Notifications
  addNotification,
  removeNotification,
  clearNotifications,

  // Preferences
  updatePreferences,
  setPreference,

  // Navigation
  setCurrentPage,
  setBreadcrumbs,

  // Mobile
  setIsMobile,
  setMobileMenuOpen,
  toggleMobileMenu,

  // Search
  setSearchOpen,
  setSearchQuery,
  toggleSearch,

  // Error
  setError,
  clearError,

  // Reset
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;
