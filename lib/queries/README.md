# Centralized Query System

This directory contains a centralized query system that provides reusable hooks and API functions for common data operations across the application.

## Structure

```
lib/queries/
├── index.js              # Main export file
├── user-queries.js       # User management queries
├── event-queries.js      # Event management queries
└── README.md            # This documentation
```

## Benefits

1. **Code Reusability**: Common query logic is centralized and can be reused across components
2. **Consistency**: Standardized error handling, caching, and data fetching patterns
3. **Maintainability**: Changes to API logic only need to be made in one place
4. **Type Safety**: Consistent query keys and return types
5. **Performance**: Optimized caching and invalidation strategies

## Usage

### Basic Usage

Instead of writing `useQuery` in every component:

```jsx
// ❌ Before - Inline useQuery
const { data, isLoading } = useQuery({
  queryKey: ['users', filters],
  queryFn: () => fetchUsers(filters),
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
});

// ✅ After - Using centralized hook
import { useUsers } from '@/lib/queries';

const { data, isLoading } = useUsers(filters);
```

### Available Hooks

#### User Management
```jsx
import { 
  useUsers, 
  useUser, 
  useRoles, 
  usePermissions,
  useCreateUser,
  useUpdateUser,
  useDeleteUser 
} from '@/lib/queries';

// Get users with filters
const { data, isLoading } = useUsers({
  pageIndex: 0,
  pageSize: 10,
  sorting: [{ id: 'name', desc: false }],
  searchQuery: 'john',
  selectedRole: 'admin',
  selectedStatus: 'active'
});

// Get single user
const { data: user, isLoading } = useUser(userId);

// Get roles
const { data: roles } = useRoles();

// Mutations
const createUserMutation = useCreateUser();
const updateUserMutation = useUpdateUser();
const deleteUserMutation = useDeleteUser();
```

#### Event Management
```jsx
import { 
  useEvents, 
  useEvent, 
  useEventCategories, 
  useEventTypes,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent 
} from '@/lib/queries';

// Get events with filters
const { data, isLoading } = useEvents({
  pageIndex: 0,
  pageSize: 10,
  sorting: [{ id: 'date', desc: true }],
  searchQuery: 'conference',
  selectedCategory: 'business',
  selectedType: 'online'
});

// Get single event
const { data: event, isLoading } = useEvent(eventId);

// Get categories and types
const { data: categories } = useEventCategories();
const { data: types } = useEventTypes();

// Mutations
const createEventMutation = useCreateEvent();
const updateEventMutation = useUpdateEvent();
const deleteEventMutation = useDeleteEvent();
```

### Query Keys

Each module has its own query key structure:

```jsx
// User query keys
userQueryKeys.all                    // ['users']
userQueryKeys.lists()               // ['users', 'list']
userQueryKeys.list(filters)         // ['users', 'list', filters]
userQueryKeys.details()             // ['users', 'detail']
userQueryKeys.detail(id)            // ['users', 'detail', id]
userQueryKeys.roles()               // ['users', 'roles']
userQueryKeys.permissions()         // ['users', 'permissions']

// Event query keys
eventQueryKeys.all                  // ['events']
eventQueryKeys.lists()             // ['events', 'list']
eventQueryKeys.list(filters)       // ['events', 'list', filters]
eventQueryKeys.details()           // ['events', 'detail']
eventQueryKeys.detail(id)          // ['events', 'detail', id']
eventQueryKeys.categories()        // ['events', 'categories']
eventQueryKeys.types()             // ['events', 'types']
```

### API Functions

Direct API functions are also available for custom use cases:

```jsx
import { userApi, eventApi } from '@/lib/queries';

// Direct API calls
const users = await userApi.getUsers(filters);
const user = await userApi.getUser(id);
const newUser = await userApi.createUser(userData);
const updatedUser = await userApi.updateUser({ id, userData });
await userApi.deleteUser(id);

const events = await eventApi.getEvents(filters);
const event = await eventApi.getEvent(id);
const newEvent = await eventApi.createEvent(eventData);
const updatedEvent = await eventApi.updateEvent({ id, eventData });
await eventApi.deleteEvent(id);
```

## Adding New Modules

To add a new module (e.g., `template-queries.js`):

1. **Create the query file**:
```jsx
// lib/queries/template-queries.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../api';

// Query Keys
export const templateQueryKeys = {
  all: ['templates'],
  lists: () => [...templateQueryKeys.all, 'list'],
  list: (filters) => [...templateQueryKeys.lists(), filters],
  details: () => [...templateQueryKeys.all, 'detail'],
  detail: (id) => [...templateQueryKeys.details(), id],
};

// API Functions
export const templateApi = {
  getTemplates: async (filters) => {
    // Implementation
  },
  getTemplate: async (id) => {
    // Implementation
  },
  // ... other API functions
};

// Custom Hooks
export const useTemplates = (filters = {}) => {
  return useQuery({
    queryKey: templateQueryKeys.list(filters),
    queryFn: () => templateApi.getTemplates(filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// ... other hooks
```

2. **Export from index.js**:
```jsx
// lib/queries/index.js
export * from './template-queries';
```

3. **Use in components**:
```jsx
import { useTemplates } from '@/lib/queries';

const { data, isLoading } = useTemplates(filters);
```

## Best Practices

1. **Consistent Naming**: Use descriptive names for hooks and API functions
2. **Error Handling**: All API functions include proper error handling
3. **Caching**: Set appropriate `staleTime` and `gcTime` for different data types
4. **Invalidation**: Use proper cache invalidation in mutations
5. **Type Safety**: Consider adding TypeScript types for better development experience
6. **Testing**: Test hooks and API functions independently

## Migration Guide

To migrate existing components:

1. **Replace inline useQuery with centralized hooks**
2. **Remove duplicate API fetch logic**
3. **Update imports to use the new query system**
4. **Test the component to ensure functionality remains the same**

## Example Migration

```jsx
// Before
const { data, isLoading } = useQuery({
  queryKey: ['users', pagination, sorting, searchQuery],
  queryFn: () => fetchUsers({ pagination, sorting, searchQuery }),
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
});

// After
import { useUsers } from '@/lib/queries';

const filters = { pageIndex: pagination.pageIndex, pageSize: pagination.pageSize, sorting, searchQuery };
const { data, isLoading } = useUsers(filters);
```

This centralized approach makes the codebase more maintainable, consistent, and easier to test. 