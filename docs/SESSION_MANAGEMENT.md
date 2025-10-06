# Session Management & User Validation System

This document explains the simplified session management system that automatically handles user validation, role updates, and redirects when users are deleted or their roles change.

## 🎯 **Features**

- ✅ **Automatic Role Updates**: Session automatically reflects role changes from database
- ✅ **User Existence Validation**: Checks if user still exists on every session access
- ✅ **Soft Delete Support**: Respects `isTrashed` flag for deleted users
- ✅ **Status Validation**: Ensures user status is `ACTIVE`
- ✅ **Automatic Redirects**: Redirects to login when session is invalid
- ✅ **Role-based Access Control**: Validates user permissions
- ✅ **Simple & Efficient**: Clean, maintainable code without over-engineering

## 🔧 **How It Works**

### 1. **NextAuth JWT Callback Enhancement**

The JWT callback now:

- Fetches fresh user data from database on every session access
- Validates user exists and is active (`status: 'ACTIVE'`, `isTrashed: false`)
- Returns `null` to invalidate token if user is not found
- Updates token with latest role information
- Simple, straightforward implementation without complex caching

```javascript
// In auth-options.js
async jwt({ token, user, session, trigger }) {
  if (token.id) {
    const currentUser = await prisma.user.findUnique({
      where: {
        id: token.id,
        isTrashed: false, // Exclude deleted users
        status: 'ACTIVE'  // Only active users
      },
      include: { role: true }
    });

    if (!currentUser) {
      return null; // Invalidates JWT token
    }

    // Update with fresh data
    token.roleName = currentUser.role?.slug;
    // ... other fields
  }
}
```

### 2. **Session Validation API**

The `/api/auth/refresh-session` endpoint:

- Validates current session
- Checks user existence and status
- Returns fresh user data or redirect instructions

### 3. **Client-side Session Guard**

The `SessionGuard` component:

- Automatically validates sessions on page load
- Handles redirects when sessions are invalid
- Refreshes session data when page becomes visible
- Provides loading states during validation

## 📋 **Usage Examples**

### Basic Session Guard

```jsx
import { SessionGuard } from '@/components/common/session-guard';

function MyProtectedPage() {
  return (
    <SessionGuard requireAuth={true}>
      <div>This content is protected</div>
    </SessionGuard>
  );
}
```

### Role-based Protection

```jsx
import { SessionGuard } from '@/components/common/session-guard';

function AdminPage() {
  return (
    <SessionGuard requireAuth={true} allowedRoles={['super-admin', 'admin']}>
      <div>Admin only content</div>
    </SessionGuard>
  );
}
```

### Using the Hook

```jsx
import { useSessionGuard } from '@/hooks/use-session-guard';

function MyComponent() {
  const { session, isLoading, isAuthenticated, hasValidRole } = useSessionGuard(
    {
      requireAuth: true,
      allowedRoles: ['host', 'admin'],
    },
  );

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return null; // Will redirect

  return <div>Protected content</div>;
}
```

### Manual Session Refresh

```jsx
import { refreshSession } from '@/lib/session-utils';

async function handleRefreshSession() {
  const result = await refreshSession();

  if (!result.success) {
    if (result.shouldRedirect) {
      // User will be redirected automatically
      console.log('Session invalid, redirecting...');
    }
  } else {
    console.log('Session refreshed:', result.user);
  }
}
```

## 🔄 **Automatic Behaviors**

### When User Role Changes in Database:

1. ✅ Next request automatically fetches new role
2. ✅ Session updates with fresh role data
3. ✅ UI immediately reflects new permissions

### When User is Deleted (`isTrashed: true`):

1. ✅ Session becomes invalid
2. ✅ User automatically redirected to `/signin`
3. ✅ All protected content becomes inaccessible

### When User Status Changes to Inactive:

1. ✅ Session becomes invalid
2. ✅ User automatically redirected to `/signin`
3. ✅ Prevents access until account is reactivated

### When Page Becomes Visible:

1. ✅ Session automatically refreshes
2. ✅ Validates user still exists
3. ✅ Updates with latest role/permissions

## 🛡️ **Security Benefits**

- **Immediate Role Updates**: No need to log out/in when roles change
- **Soft Delete Protection**: Deleted users lose access immediately
- **Status Validation**: Inactive users are blocked automatically
- **Session Invalidation**: Compromised sessions are cleared
- **Database Consistency**: Always uses fresh data from database

## 🚀 **Implementation in Your App**

The system is already integrated into your protected layout. Every protected route now:

1. **Validates session** on page load
2. **Checks user existence** in database
3. **Verifies role permissions** if specified
4. **Redirects automatically** if validation fails
5. **Refreshes data** when page becomes visible

## 📊 **Performance Considerations**

- **Database Queries**: One additional query per session access (~5-10ms)
- **Caching**: JWT tokens still cached for 24 hours
- **Auto-refresh**: Only when page becomes visible
- **Efficient**: Uses Prisma's `include` for single query with role data

## 🔧 **Configuration Options**

### SessionGuard Props:

- `requireAuth`: Whether authentication is required (default: true)
- `allowedRoles`: Array of allowed role slugs
- `onSessionInvalid`: Callback when session is invalid

### useSessionGuard Options:

- `redirectTo`: Custom redirect path (default: '/signin')
- `requireAuth`: Whether to require authentication
- `allowedRoles`: Array of allowed roles

## 🐛 **Troubleshooting**

### Session Not Updating:

- Check database connection
- Verify user exists and is active
- Check browser console for errors

### Redirects Not Working:

- Ensure `SessionGuard` wraps protected content
- Check redirect paths are correct
- Verify NextAuth configuration

### Role Changes Not Reflecting:

- Clear browser cache/cookies
- Check database role assignment
- Verify role slug matches exactly

This system provides robust, automatic session management that keeps your application secure while providing a seamless user experience! 🎉
