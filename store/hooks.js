import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createEvent,
  deleteEvent,
  fetchAllEvents,
  fetchEventById,
  fetchEvents,
  updateEvent,
} from './slices/eventsSlice';
import {
  clearActiveFilters,
  clearAllTemplates,
  createCustomTemplate,
  deleteTemplate,
  fetchTemplateById,
  fetchTemplateCategories,
  fetchTemplates,
  setActiveFilters,
  updateTemplate,
} from './slices/templatesSlice';

// Typed hooks for better development experience
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Custom hooks for each slice
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  return {
    ...auth,
    dispatch,
  };
};

export const useEvents = () => {
  const dispatch = useAppDispatch();
  const events = useAppSelector((state) => state.events);
  return {
    ...events,
    dispatch,
  };
};

export const useTemplates = () => {
  const dispatch = useAppDispatch();
  const templates = useAppSelector((state) => state.templates);

  return {
    ...templates,
    dispatch,
  };
};

export const useUI = () => {
  const dispatch = useAppDispatch();
  const ui = useAppSelector((state) => state.ui);

  return {
    ...ui,
    dispatch,
  };
};

export const useGuests = () => {
  const dispatch = useAppDispatch();
  const guests = useAppSelector((state) => state.guests);

  return {
    ...guests,
    dispatch,
  };
};

export const useStoreClient = () => {
  const dispatch = useAppDispatch();
  const storeClient = useAppSelector((state) => state.storeClient);

  return {
    ...storeClient,
    dispatch,
  };
};

// Selector hooks for specific data
export const useCurrentUser = () => useAppSelector((state) => state.auth.user);
export const useIsAuthenticated = () =>
  useAppSelector((state) => state.auth.isAuthenticated);

export const useEventCreationStep = () =>
  useAppSelector((state) => state.events.creationStep);
export const useSelectedTemplate = () =>
  useAppSelector((state) => state.templates.selectedTemplate);

// Template selector hooks
export const useAllTemplates = () =>
  useAppSelector((state) => state.templates.templates || []);
export const useTemplateCategories = () =>
  useAppSelector((state) => state.templates.categories || []);
export const useCustomTemplates = () =>
  useAppSelector((state) => state.templates.customTemplates || []);
export const useTemplateSearchQuery = () =>
  useAppSelector((state) => state.templates.searchQuery || '');
export const useSelectedCategory = () =>
  useAppSelector((state) => state.templates.selectedCategory);
export const useTemplateLoading = () =>
  useAppSelector((state) => state.templates.isLoading);
export const useTemplateError = () =>
  useAppSelector((state) => state.templates.error);
export const useActiveFilters = () =>
  useAppSelector((state) => state.templates.activeFilters);
export const useTheme = () => useAppSelector((state) => state.ui.theme);
export const useModals = () => useAppSelector((state) => state.ui.modals);
export const useNotifications = () =>
  useAppSelector((state) => state.ui.notifications);

// Store client selector hooks
export const useCart = () => useAppSelector((state) => state.storeClient.cart);
export const useWishlist = () =>
  useAppSelector((state) => state.storeClient.wishlist);
export const useCartItemCount = () =>
  useAppSelector((state) => state.storeClient.cart.itemCount);
export const useWishlistItemCount = () =>
  useAppSelector((state) => state.storeClient.wishlist.itemCount);
export const useIsCartSheetOpen = () =>
  useAppSelector((state) => state.storeClient.isCartSheetOpen);
export const useIsWishlistSheetOpen = () =>
  useAppSelector((state) => state.storeClient.isWishlistSheetOpen);
export const useIsProductDetailsSheetOpen = () =>
  useAppSelector((state) => state.storeClient.isProductDetailsSheetOpen);
export const useProductDetailsId = () =>
  useAppSelector((state) => state.storeClient.productDetailsId);

// Event selector hooks
export const useAllEvents = () =>
  useAppSelector((state) => state.events?.events || []);
export const useEventsById = () =>
  useAppSelector((state) => state.events?.eventsById || {});

export const useSelectedEvent = () =>
  useAppSelector((state) => state.events?.selectedEvent || null);

// Computed selectors
export const useEventById = (eventId) =>
  useAppSelector((state) => state.events?.eventsById?.[eventId] || null);

// Simplified - just return all events, let components handle filtering
export const useFilteredEvents = () => useAllEvents();

// Action hooks for common operations
export const useEventActions = () => {
  const dispatch = useAppDispatch();

  return {
    // Event creation
    setCreationStep: useCallback(
      (step) => {
        dispatch({ type: 'events/setCreationStep', payload: step });
      },
      [dispatch],
    ),

    setSelectedEvent: useCallback(
      (event) => {
        dispatch({ type: 'events/setSelectedEvent', payload: event });
      },
      [dispatch],
    ),

    updateSelectedEvent: useCallback(
      (data) => {
        dispatch({ type: 'events/updateSelectedEvent', payload: data });
      },
      [dispatch],
    ),

    setSelectedTemplate: useCallback(
      (template) => {
        dispatch({ type: 'events/setSelectedTemplate', payload: template });
      },
      [dispatch],
    ),

    clearSelectedTemplate: useCallback(() => {
      dispatch({ type: 'events/clearSelectedTemplate' });
    }, [dispatch]),

    resetEventCreation: useCallback(() => {
      dispatch({ type: 'events/resetEventCreation' });
    }, [dispatch]),

    // Event management
    addEventToStore: useCallback(
      (event) => {
        dispatch({ type: 'events/addEventToStore', payload: event });
      },
      [dispatch],
    ),

    updateEventInStore: useCallback(
      (event) => {
        dispatch({ type: 'events/updateEventInStore', payload: event });
      },
      [dispatch],
    ),

    // Async thunks - API calls
    createEvent: useCallback(
      (eventData) => {
        return dispatch(createEvent(eventData));
      },
      [dispatch],
    ),

    fetchEvents: useCallback(
      (params) => {
        return dispatch(fetchEvents(params));
      },
      [dispatch],
    ),

    fetchAllEvents: useCallback(() => {
      return dispatch(fetchAllEvents());
    }, [dispatch]),

    fetchEventById: useCallback(
      (eventId) => {
        return dispatch(fetchEventById(eventId));
      },
      [dispatch],
    ),

    updateEvent: useCallback(
      (eventData) => {
        return dispatch(updateEvent(eventData));
      },
      [dispatch],
    ),

    deleteEvent: useCallback(
      (eventId) => {
        return dispatch(deleteEvent(eventId));
      },
      [dispatch],
    ),

    // Error handling
    clearError: useCallback(() => {
      dispatch({ type: 'events/clearError' });
    }, [dispatch]),
  };
};

export const useUIActions = () => {
  const dispatch = useAppDispatch();

  return {
    openModal: useCallback(
      (modalName) => {
        dispatch({ type: 'ui/openModal', payload: modalName });
      },
      [dispatch],
    ),

    closeModal: useCallback(
      (modalName) => {
        dispatch({ type: 'ui/closeModal', payload: modalName });
      },
      [dispatch],
    ),

    addNotification: useCallback(
      (notification) => {
        dispatch({ type: 'ui/addNotification', payload: notification });
      },
      [dispatch],
    ),

    setTheme: useCallback(
      (theme) => {
        dispatch({ type: 'ui/setTheme', payload: theme });
      },
      [dispatch],
    ),
  };
};

export const useTemplateActions = () => {
  const dispatch = useAppDispatch();

  return {
    // Template state actions
    setSelectedTemplate: useCallback(
      (template) => {
        dispatch({ type: 'templates/setSelectedTemplate', payload: template });
      },
      [dispatch],
    ),

    setSearchQuery: useCallback(
      (query) => {
        dispatch({ type: 'templates/setSearchQuery', payload: query });
      },
      [dispatch],
    ),

    setSelectedCategory: useCallback(
      (category) => {
        dispatch({ type: 'templates/setSelectedCategory', payload: category });
      },
      [dispatch],
    ),

    clearSelectedTemplate: useCallback(() => {
      dispatch({ type: 'templates/clearSelectedTemplate' });
    }, [dispatch]),

    clearError: useCallback(() => {
      dispatch({ type: 'templates/clearError' });
    }, [dispatch]),

    // Async thunks - API calls
    fetchTemplates: useCallback(
      (queryParams) => {
        return dispatch(fetchTemplates(queryParams));
      },
      [dispatch],
    ),

    fetchTemplateById: useCallback(
      (templateId) => {
        return dispatch(fetchTemplateById(templateId));
      },
      [dispatch],
    ),

    fetchTemplateCategories: useCallback(() => {
      return dispatch(fetchTemplateCategories());
    }, [dispatch]),

    createCustomTemplate: useCallback(
      (templateData) => {
        return dispatch(createCustomTemplate(templateData));
      },
      [dispatch],
    ),

    updateTemplate: useCallback(
      (templateId, templateData) => {
        return dispatch(updateTemplate({ templateId, templateData }));
      },
      [dispatch],
    ),

    deleteTemplate: useCallback(
      (templateId) => {
        return dispatch(deleteTemplate(templateId));
      },
      [dispatch],
    ),

    // New filter management actions
    setActiveFilters: useCallback(
      (filters) => {
        dispatch(setActiveFilters(filters));
      },
      [dispatch],
    ),

    clearActiveFilters: useCallback(() => {
      dispatch(clearActiveFilters());
    }, [dispatch]),

    clearAllTemplates: useCallback(() => {
      dispatch(clearAllTemplates());
    }, [dispatch]),
  };
};

export const useGuestActions = () => {
  const dispatch = useAppDispatch();

  return {
    selectGuest: useCallback(
      (guestId) => {
        dispatch({ type: 'guests/selectGuest', payload: guestId });
      },
      [dispatch],
    ),

    addGuest: useCallback(
      (guest) => {
        dispatch({ type: 'guests/addGuest', payload: guest });
      },
      [dispatch],
    ),

    removeGuest: useCallback(
      (guestId) => {
        dispatch({ type: 'guests/removeGuest', payload: guestId });
      },
      [dispatch],
    ),
  };
};

export const useStoreClientActions = () => {
  const dispatch = useAppDispatch();

  return {
    // Sheet management
    showWishlistSheet: useCallback(() => {
      dispatch({ type: 'storeClient/showWishlistSheet' });
    }, [dispatch]),

    closeWishlistSheet: useCallback(() => {
      dispatch({ type: 'storeClient/closeWishlistSheet' });
    }, [dispatch]),

    showCartSheet: useCallback(() => {
      dispatch({ type: 'storeClient/showCartSheet' });
    }, [dispatch]),

    closeCartSheet: useCallback(() => {
      dispatch({ type: 'storeClient/closeCartSheet' });
    }, [dispatch]),

    showProductDetailsSheet: useCallback(
      (productId) => {
        dispatch({
          type: 'storeClient/showProductDetailsSheet',
          payload: productId,
        });
      },
      [dispatch],
    ),

    closeProductDetailsSheet: useCallback(() => {
      dispatch({ type: 'storeClient/closeProductDetailsSheet' });
    }, [dispatch]),

    // Cart management
    addToCart: useCallback(
      (payload) => {
        dispatch({ type: 'storeClient/addToCart', payload });
      },
      [dispatch],
    ),

    removeFromCart: useCallback(
      (productId) => {
        dispatch({ type: 'storeClient/removeFromCart', payload: productId });
      },
      [dispatch],
    ),

    updateCartItemQuantity: useCallback(
      (payload) => {
        dispatch({ type: 'storeClient/updateCartItemQuantity', payload });
      },
      [dispatch],
    ),

    clearCart: useCallback(() => {
      dispatch({ type: 'storeClient/clearCart' });
    }, [dispatch]),

    // Wishlist management
    addToWishlist: useCallback(
      (payload) => {
        dispatch({ type: 'storeClient/addToWishlist', payload });
      },
      [dispatch],
    ),

    removeFromWishlist: useCallback(
      (productId) => {
        dispatch({
          type: 'storeClient/removeFromWishlist',
          payload: productId,
        });
      },
      [dispatch],
    ),

    clearWishlist: useCallback(() => {
      dispatch({ type: 'storeClient/clearWishlist' });
    }, [dispatch]),

    // Product management
    setProducts: useCallback(
      (products) => {
        dispatch({ type: 'storeClient/setProducts', payload: products });
      },
      [dispatch],
    ),

    setSelectedProduct: useCallback(
      (product) => {
        dispatch({ type: 'storeClient/setSelectedProduct', payload: product });
      },
      [dispatch],
    ),

    // Reset
    resetStoreClient: useCallback(() => {
      dispatch({ type: 'storeClient/resetStoreClient' });
    }, [dispatch]),
  };
};
