# Route Protection System

This document explains how to implement role-based route access control in the application using the provided utilities.

## Overview

The route protection system provides multiple layers of security:

1. **Middleware-level protection** - Server-side route blocking
2. **Component-level protection** - Client-side route guards
3. **Higher-order component protection** - Wrapper functions for pages

## Components

### 1. RouteGuard Component

The `RouteGuard` component is a wrapper that checks user permissions before rendering content.

```jsx
import { RouteGuard } from '@/components/common/route-guard';

export default function ProtectedPage() {
  return (
    <RouteGuard 
      requiredRoles={['super-admin', 'application-admin']}
      requiredPermissions={['canManageUsers']}
      redirectTo="/unauthorized"
      fallback={<div>Loading...</div>}
    >
      <div>Protected content here</div>
    </RouteGuard>
  );
}
```

**Props:**
- `requiredRoles` - Array of required roles (optional)
- `requiredPermissions` - Array of required permissions (optional)
- `redirectTo` - Where to redirect unauthorized users (default: '/unauthorized')
- `fallback` - What to show while checking permissions (optional)

### 2. Convenience Components

Pre-built components for common role checks:

```jsx
import { 
  SuperAdminOnly, 
  HostOnly, 
  AdminOnly,
  EventManagerOnly,
  UserManagerOnly 
} from '@/components/common/route-guard';

// Super Admin only
<SuperAdminOnly>
  <div>Super admin content</div>
</SuperAdminOnly>

// Host only
<HostOnly>
  <div>Host content</div>
</HostOnly>

// Admin (Super Admin or Application Admin)
<AdminOnly>
  <div>Admin content</div>
</AdminOnly>
```

### 3. Higher-Order Components

Wrap entire pages with protection:

```jsx
import { withRouteProtection } from '@/components/common/with-route-protection';

function MyPage() {
  return <div>Protected page content</div>;
}

// Export with protection
export default withRouteProtection(MyPage, {
  requiredRoles: ['host', 'super-admin'],
  requiredPermissions: ['canManageEvents'],
  redirectTo: '/unauthorized'
});
```

**Convenience HOCs:**
```jsx
import { 
  withSuperAdminProtection,
  withHostProtection,
  withAdminProtection,
  withEventManagerProtection,
  withUserManagerProtection
} from '@/components/common/with-route-protection';

// Super Admin only
export default withSuperAdminProtection(MyPage);

// Host only
export default withHostProtection(MyPage);

// Admin only
export default withAdminProtection(MyPage);
```

## Usage Examples

### Protecting a User Management Page

```jsx
'use client';

import { RouteGuard } from '@/components/common/route-guard';
import { Container } from '@/components/common/container';

export default function UserManagementPage() {
  return (
    <RouteGuard 
      requiredRoles={['super-admin', 'application-admin']}
      redirectTo="/unauthorized"
    >
      <Container>
        <h1>User Management</h1>
        {/* Page content */}
      </Container>
    </RouteGuard>
  );
}
```

### Protecting with Permissions

```jsx
'use client';

import { RouteGuard } from '@/components/common/route-guard';

export default function EventManagementPage() {
  return (
    <RouteGuard 
      requiredPermissions={['canManageEvents']}
      redirectTo="/unauthorized"
    >
      <div>Event management content</div>
    </RouteGuard>
  );
}
```

### Using Higher-Order Components

```jsx
import { withHostProtection } from '@/components/common/with-route-protection';

function TemplatePage() {
  return (
    <div>
      <h1>Templates</h1>
      {/* Template management content */}
    </div>
  );
}

// Export with host-only protection
export default withHostProtection(TemplatePage);
```

## Available Roles

- `super-admin` - Full system access
- `application-admin` - Application-level administration
- `host` - Event creation and management
- `attendee` - Basic user access

## Available Permissions

- `canManageEvents` - Can create/edit/delete events
- `canManageUsers` - Can manage user accounts
- `canManageRoles` - Can manage user roles
- `canViewReports` - Can access reporting features
- `canAccessSettings` - Can access system settings
- `canAccessTemplates` - Can access template management
- `canAccessImageEditor` - Can access image editor
- `canAccessMessaging` - Can access messaging features
- `canAccessStoreAdmin` - Can access store administration

## Route Access Matrix

| Route | Super Admin | Application Admin | Host | Attendee |
|-------|-------------|-------------------|------|----------|
| `/user-management` | ✅ | ✅ | ❌ | ❌ |
| `/settings` | ✅ | ✅ | ❌ | ❌ |
| `/reportings` | ✅ | ✅ | ❌ | ❌ |
| `/templates` | ✅ | ✅ | ✅ | ❌ |
| `/image-editor` | ✅ | ✅ | ✅ | ❌ |
| `/messaging` | ✅ | ✅ | ✅ | ❌ |
| `/store-admin` | ✅ | ✅ | ❌ | ❌ |
| `/network` | ✅ | ✅ | ✅ | ✅ |
| `/public-profile` | ✅ | ✅ | ✅ | ✅ |
| `/account` | ✅ | ✅ | ✅ | ✅ |
| `/my-profile` | ✅ | ✅ | ✅ | ✅ |
| `/events` | ✅ | ✅ | ✅ | ✅ |
| `/` (Dashboard) | ✅ | ✅ | ✅ | ✅ |

## Best Practices

1. **Use middleware for server-side protection** - Always implement middleware-level protection for sensitive routes
2. **Combine with client-side protection** - Use RouteGuard components for better UX
3. **Provide clear feedback** - Redirect to unauthorized page with helpful information
4. **Check permissions early** - Verify access as soon as possible in the component lifecycle
5. **Use appropriate fallbacks** - Show loading states or alternative content while checking permissions

## Error Handling

When a user doesn't have access:

1. **Middleware** - Redirects to `/unauthorized` page
2. **RouteGuard** - Shows fallback content or redirects
3. **HOCs** - Prevents page rendering and redirects

## Unauthorized Page

The `/unauthorized` page provides:
- Clear explanation of access denial
- Navigation options (Go Back, Go Home)
- Professional appearance
- Helpful guidance for users

## Troubleshooting

### Common Issues

1. **Infinite redirects** - Ensure redirectTo is not the same as current route
2. **Permission not working** - Check role names match exactly (case-sensitive)
3. **Component not rendering** - Verify fallback prop is set correctly
4. **Middleware conflicts** - Check matcher patterns in middleware.js

### Debug Mode

Enable debug logging by checking the browser console for permission checks and redirects.

## Security Notes

- **Client-side protection is for UX only** - Always implement server-side validation
- **Middleware runs first** - Server-side checks happen before client-side
- **Role names are case-sensitive** - Use exact role names from the database
- **Permissions are additive** - Users can have multiple roles and permissions
