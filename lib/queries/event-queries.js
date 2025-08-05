import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../api';

// Query Keys
export const eventQueryKeys = {
  all: ['events'],
  lists: () => [...eventQueryKeys.all, 'list'],
  list: (filters) => [...eventQueryKeys.lists(), filters],
  details: () => [...eventQueryKeys.all, 'detail'],
  detail: (id) => [...eventQueryKeys.details(), id],
  categories: () => [...eventQueryKeys.all, 'categories'],
  types: () => [...eventQueryKeys.all, 'types'],
};

// API Functions
export const eventApi = {
  // Get events with filters
  getEvents: async ({ pageIndex = 0, pageSize = 10, sorting = [], searchQuery = '', selectedCategory = 'all', selectedType = 'all' }) => {
    const params = new URLSearchParams({
      page: (pageIndex + 1).toString(),
      limit: pageSize.toString(),
      search: searchQuery,
      category: selectedCategory,
      type: selectedType,
    });

    if (sorting.length > 0) {
      params.append('sortBy', sorting[0].id);
      params.append('sortOrder', sorting[0].desc ? 'desc' : 'asc');
    }

    const response = await apiFetch(`/api/events?${params}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch events');
    }

    return response.json();
  },

  // Get single event
  getEvent: async (id) => {
    const response = await apiFetch(`/api/events/${id}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch event');
    }

    return response.json();
  },

  // Create event
  createEvent: async (eventData) => {
    const response = await apiFetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create event');
    }

    return response.json();
  },

  // Update event
  updateEvent: async ({ id, eventData }) => {
    const response = await apiFetch(`/api/events/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update event');
    }

    return response.json();
  },

  // Delete event
  deleteEvent: async (id) => {
    const response = await apiFetch(`/api/events/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete event');
    }

    return response.json();
  },

  // Get event categories
  getEventCategories: async () => {
    const response = await apiFetch('/api/events/categories');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch event categories');
    }

    return response.json();
  },

  // Get event types
  getEventTypes: async () => {
    const response = await apiFetch('/api/events/types');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch event types');
    }

    return response.json();
  },
};

// Custom Hooks
export const useEvents = (filters = {}) => {
  return useQuery({
    queryKey: eventQueryKeys.list(filters),
    queryFn: () => eventApi.getEvents(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useEvent = (id) => {
  return useQuery({
    queryKey: eventQueryKeys.detail(id),
    queryFn: () => eventApi.getEvent(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useEventCategories = () => {
  return useQuery({
    queryKey: eventQueryKeys.categories(),
    queryFn: eventApi.getEventCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useEventTypes = () => {
  return useQuery({
    queryKey: eventQueryKeys.types(),
    queryFn: eventApi.getEventTypes,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Mutation Hooks
export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: eventApi.createEvent,
    onSuccess: () => {
      // Invalidate and refetch events list
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.lists() });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: eventApi.updateEvent,
    onSuccess: (data, variables) => {
      // Update the specific event in cache
      queryClient.setQueryData(eventQueryKeys.detail(variables.id), data);
      // Invalidate events list
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.lists() });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: eventApi.deleteEvent,
    onSuccess: (_, deletedId) => {
      // Remove the event from cache
      queryClient.removeQueries({ queryKey: eventQueryKeys.detail(deletedId) });
      // Invalidate events list
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.lists() });
    },
  });
}; 