import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../api';

// Query Keys
export const userQueryKeys = {
  all: ['users'],
  lists: () => [...userQueryKeys.all, 'list'],
  list: (filters) => [...userQueryKeys.lists(), filters],
  details: () => [...userQueryKeys.all, 'detail'],
  detail: (id) => [...userQueryKeys.details(), id],
  roles: () => [...userQueryKeys.all, 'roles'],
  permissions: () => [...userQueryKeys.all, 'permissions'],
};

// API Functions
export const userApi = {
  // Get users with filters
  getUsers: async ({ pageIndex = 0, pageSize = 10, sorting = [], searchQuery = '', selectedRole = 'all', selectedStatus = 'all' }) => {
    const params = new URLSearchParams({
      page: (pageIndex + 1).toString(),
      limit: pageSize.toString(),
      query: searchQuery,
      roleId: selectedRole,
      status: selectedStatus,
    });

    if (sorting.length > 0) {
      // Map column IDs to API sort fields
      const sortFieldMap = {
        role: 'role_name',
        lastSignIn: 'lastSignInAt',
      };
      
      const sortField = sortFieldMap[sorting[0].id] || sorting[0].id;
      params.append('sort', sortField);
      params.append('dir', sorting[0].desc ? 'desc' : 'asc');
    }

    const response = await apiFetch(`/api/user-management/users?${params}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch users');
    }

    return response.json();
  },

  // Get single user
  getUser: async (id) => {
    const response = await apiFetch(`/api/user-management/users/${id}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch user');
    }

    return response.json();
  },

  // Create user
  createUser: async (userData) => {
    const response = await apiFetch('/api/user-management/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create user');
    }

    return response.json();
  },

  // Update user
  updateUser: async ({ id, userData }) => {
    const response = await apiFetch(`/api/user-management/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update user');
    }

    return response.json();
  },

  // Delete user
  deleteUser: async (id) => {
    const response = await apiFetch(`/api/user-management/users/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete user');
    }

    return response.json();
  },

  // Get roles
  getRoles: async () => {
    const response = await apiFetch('/api/user-management/roles');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch roles');
    }

    return response.json();
  },

  // Get permissions
  getPermissions: async () => {
    const response = await apiFetch('/api/user-management/permissions');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch permissions');
    }

    return response.json();
  },
};

// Custom Hooks
export const useUsers = (filters = {}) => {
  return useQuery({
    queryKey: userQueryKeys.list(filters),
    queryFn: () => userApi.getUsers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUser = (id) => {
  return useQuery({
    queryKey: userQueryKeys.detail(id),
    queryFn: () => userApi.getUser(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useRoles = () => {
  return useQuery({
    queryKey: userQueryKeys.roles(),
    queryFn: userApi.getRoles,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    select: (data) => data?.data || [], // Extract the data array from the response
  });
};

export const usePermissions = () => {
  return useQuery({
    queryKey: userQueryKeys.permissions(),
    queryFn: userApi.getPermissions,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    select: (data) => data?.data || [], // Extract the data array from the response
  });
};

// Mutation Hooks
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.createUser,
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.updateUser,
    onSuccess: (data, variables) => {
      // Update the specific user in cache
      queryClient.setQueryData(userQueryKeys.detail(variables.id), data);
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: (_, deletedId) => {
      // Remove the user from cache
      queryClient.removeQueries({ queryKey: userQueryKeys.detail(deletedId) });
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() });
    },
  });
}; 