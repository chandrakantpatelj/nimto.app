# Role-Based Design System

This document outlines the role-based design system implemented for the events module, which provides different user experiences based on user roles while maintaining a single, clean URL structure.

## Supported Roles

The system currently supports **four specific roles**:

1. **Super Admin** - Full system administration capabilities
2. **Host** - Event creation and management capabilities
3. **Attendee** - Event discovery and participation capabilities
4. **Application Admin** - Application-level administrative capabilities

## Architecture Overview

### File Structure

```
app/(protected)/events/
├── page.jsx                           # Main entry point
├── components/
│   └── role-based-content.jsx        # Central router component
└── routes/                           # Role-specific content components
    ├── admin/
    │   └── admin-content.jsx         # Super Admin content
    ├── host/
    │   └── host-content.jsx          # Host content
    ├── attendee/
    │   └── attendee-content.jsx      # Attendee content
    └── application-admin/
        └── application-admin-content.jsx  # Application Admin content
```

### Dynamic Content Loading

The system uses a central router component (`RoleBasedEventContent`) that dynamically loads the appropriate content based on the user's role:

```jsx
export function RoleBasedEventContent() {
  const { roles } = useRoleBasedAccess();

  const getRoleComponent = () => {
    if (roles.isSuperAdmin) {
      return <AdminEventContent />;
    }
    if (roles.isApplicationAdmin) {
      return <ApplicationAdminEventContent />;
    }
    if (roles.isHost) {
      return <HostEventContent />;
    }
    return <AttendeeEventContent />; // Default fallback
  };

  return getRoleComponent();
}
```

### Router Logic

The role mapping follows this priority order:

1. **Super Admin** → `AdminEventContent` (System-wide administration)
2. **Application Admin** → `ApplicationAdminEventContent` (Application-level administration)
3. **Host** → `HostEventContent` (Event management)
4. **Attendee** → `AttendeeEventContent` (Event discovery - default)

## Role-Specific Features

### Super Admin

- **Content**: `AdminEventContent`
- **Features**:
  - View all events in the system
  - System-wide analytics and reporting
  - User management capabilities
  - Revenue tracking across all events
  - Full administrative controls

### Application Admin

- **Content**: `ApplicationAdminEventContent`
- **Features**:
  - Application-level event management
  - System maintenance events
  - Deployment and migration tracking
  - Security audit management
  - System health monitoring

### Host

- **Content**: `HostEventContent`
- **Features**:
  - Create and manage own events
  - Event analytics and reporting
  - Guest management
  - Revenue tracking for own events
  - Event editing and deletion

### Attendee

- **Content**: `AttendeeEventContent`
- **Features**:
  - Discover and browse events
  - Register for events
  - View event details
  - Manage personal event preferences
  - Event recommendations

## Implementation Details

### Role Detection

Roles are detected using the `useRoleBasedAccess` hook:

```jsx
const { roles, permissions, designVariants } = useRoleBasedAccess();
```

The hook provides:

- `roles` object with boolean flags for each role
- `permissions` object for feature-level access control
- `designVariants` for role-specific UI customization

### URL Structure

All users access the same URL (`/events`) regardless of their role. The system automatically loads the appropriate content based on their role, ensuring a clean URL structure without exposing role information in the URL.

### Middleware Protection

Server-side route protection is implemented in `middleware.js` to ensure users can only access appropriate routes based on their role.

## Benefits

1. **Clean URLs**: No role-specific URLs exposed to users
2. **Scalable**: Easy to add new roles by creating new content components
3. **Maintainable**: Centralized role logic in the hook
4. **Secure**: Server-side role validation
5. **Consistent**: Unified design system across all role variants

## Best Practices

1. **Role Priority**: Always check roles in the correct priority order
2. **Fallback**: Always provide a default fallback (Attendee content)
3. **Permissions**: Use the permissions object for feature-level access control
4. **Design Variants**: Use designVariants for role-specific UI customization
5. **Testing**: Test all role combinations to ensure proper content loading

## Future Considerations

- Add role-specific navigation items
- Implement role-based feature flags
- Add role transition capabilities
- Consider role inheritance for complex permission scenarios
