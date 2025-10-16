# Email Collection for Phone-Only Guests

## Overview
This feature enables collecting email addresses from guests who were initially added to an event with only a phone number. When such guests submit their RSVP, they are prompted to provide their email address via a popup dialog.

## Implementation Details

### Files Modified/Created

1. **components/rsvp/email-collection-dialog.jsx** (NEW)
   - Modal dialog component for collecting email addresses
   - Includes email validation
   - User-friendly interface with clear instructions

2. **components/rsvp/rsvp-form.jsx** (MODIFIED)
   - Added logic to detect guests without email addresses
   - Shows email collection dialog before RSVP submission
   - Updates form state with collected email
   - Improved email display section to handle phone-only guests

3. **app/api/attendee/guests/route.js** (MODIFIED)
   - Enhanced PUT endpoint to support guest lookup by `guestId` (in addition to email)
   - Added email update functionality when provided in request body
   - Validates and saves email to guest record

## User Flow

### For Hosts
1. Host creates an event
2. Host adds a guest with only phone number (no email) - this is already supported
3. No changes to host workflow

### For Guests (Phone-Only)
1. Guest receives invitation via SMS with link
2. Guest clicks invitation link and sees RSVP form
3. Guest fills out RSVP response (Accept/Decline/Maybe)
4. Guest clicks "Submit RSVP"
5. **NEW**: Email collection dialog appears
6. Guest enters their email address
7. Email is validated and saved to guest record
8. RSVP is submitted successfully
9. Guest receives confirmation

### For Guests (With Email)
- No changes to existing workflow
- Email field remains read-only as before

## Technical Details

### Email Collection Dialog
```jsx
<EmailCollectionDialog
  isOpen={showEmailDialog}
  onClose={() => setShowEmailDialog(false)}
  onSubmit={handleEmailProvided}
/>
```

**Features:**
- Email validation using regex
- Required field validation
- Accessible form with proper labels
- Cancel and submit actions
- Informative help text

### API Changes

**Request Parameters:**
- Added `guestId` query parameter to PUT `/api/attendee/guests`
- Body now includes `email` field for updates

**Guest Lookup Logic:**
```javascript
// Priority order:
1. If guestId provided -> lookup by guestId
2. Else if email provided -> lookup by email
```

**Email Update Logic:**
- Only updates email if:
  - Email is provided in request body
  - Email is valid (trimmed and not empty)
  - Guest doesn't already have an email

### Database Schema
No changes required. The `Guest` model already supports optional email:
```prisma
model Guest {
  id          String         @id @default(cuid())
  name        String
  email       String?        // Optional - can be null
  phone       String?        // Optional - can be null
  // ... other fields
}
```

## Benefits

1. **Flexibility**: Hosts can add guests with just phone numbers
2. **Data Completeness**: Email addresses are collected when guests engage
3. **Better Communication**: Enables email notifications to all guests
4. **User Experience**: Seamless popup workflow, non-intrusive
5. **Data Integrity**: Email validation ensures quality data

## Testing Scenarios

### Scenario 1: Guest with Phone Only
1. Host adds guest with name + phone (no email)
2. Guest accesses invitation link
3. Guest selects "Accept" for RSVP
4. Guest clicks "Submit RSVP"
5. Email dialog appears
6. Guest enters valid email
7. RSVP submitted successfully
8. Guest record updated with email

### Scenario 2: Guest with Email
1. Host adds guest with name + email
2. Guest accesses invitation link
3. Guest selects "Accept" for RSVP
4. Guest clicks "Submit RSVP"
5. No email dialog (already has email)
6. RSVP submitted successfully

### Scenario 3: Invalid Email Entry
1. Phone-only guest submits RSVP
2. Email dialog appears
3. Guest enters invalid email (e.g., "test")
4. Validation error shown
5. Guest corrects email
6. RSVP submitted successfully

### Scenario 4: Guest Cancels Email Entry
1. Phone-only guest submits RSVP
2. Email dialog appears
3. Guest clicks "Cancel"
4. Dialog closes
5. RSVP not submitted
6. Guest can try again

## Security Considerations

- Email validation prevents malformed emails
- Guest lookup by `guestId` prevents unauthorized access
- Email updates only allowed when guest doesn't have one (prevents overwriting)
- All existing authorization checks remain in place

## Future Enhancements

- Send confirmation email immediately after collection
- Allow hosts to configure whether email is required
- Support SMS verification for phone-only guests
- Add email collection analytics for hosts

