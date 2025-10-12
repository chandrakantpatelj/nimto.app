# Twilio SMS/WhatsApp Integration - Simple Setup

## 🌍 International Phone Number Support

**✅ Now supports automatic country code detection!**

- **Indian numbers** (starting with 6, 7, 8, 9): Automatically adds `+91`
  - Example: `7798325001` → `+917798325001`
  - Example: `8080941296` → `+918080941296`
- **US/Canada numbers**: Automatically adds `+1`
  - Example: `4155238886` → `+14155238886`

- **Other countries**: Enter full number with country code
  - Example: `+447700900000` (UK)
  - Example: `+61412345678` (Australia)

---

# Twilio SMS/WhatsApp Integration - Simple Setup

## Overview

Your event invitation system now supports sending invitations via SMS and WhatsApp alongside email. When you send event invitations, the system will:

1. ✅ **Send email** (if guest has email)
2. ✅ **Send SMS/WhatsApp** (if guest has phone number)

It's that simple! Both channels work automatically.

## Setup (3 Steps)

### Step 1: Get Twilio Credentials

1. Sign up at https://www.twilio.com/console
2. Get your **Account SID** and **Auth Token** from the dashboard
3. Buy a phone number with SMS capabilities

**For WhatsApp (Optional):**

- Go to Messaging → WhatsApp in Twilio Console
- Set up the sandbox (for testing)
- For production, apply for WhatsApp Business API

### Step 2: Add Environment Variables

Add to your `.env.local`:

```bash
# Required for SMS
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token_here"
TWILIO_PHONE_NUMBER="+1234567890"

# Optional for WhatsApp
TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"
```

### Step 3: Restart Your Server

```bash
npm run dev
```

That's it! Your event invitations will now be sent via both email and SMS/WhatsApp.

## How It Works

The existing `sendEventInvitation()` function now:

- **Sends email** if guest has email address
- **Sends SMS/WhatsApp** if guest has phone number
- **Tries both** if guest has both email and phone
- **Automatically falls back** from WhatsApp → SMS if WhatsApp fails

### Example:

```javascript
import { sendEventInvitation } from '@/services/send-event-invitation';

// This will send both email and SMS automatically
await sendEventInvitation({
  guest: {
    name: 'John Doe',
    email: 'john@example.com', // Will send email
    phone: '+1234567890', // Will send SMS/WhatsApp
  },
  event: {
    title: 'Birthday Party',
    startDateTime: new Date(),
    locationAddress: '123 Main St',
  },
  invitationUrl: 'https://yourapp.com/events/123/invitation/456',
});
```

## What Was Added

### Files Added:

- `lib/twilio.js` - Twilio configuration and utilities
- `services/send-sms.js` - SMS/WhatsApp sending logic

### Files Modified:

- `services/send-event-invitation.js` - Enhanced to send SMS alongside email

### No Database Changes

- No migrations needed
- No schema changes
- Works with your existing event and guest tables

## Testing

### Test with a Guest Who Has Email Only:

- Invitation sent via **email** ✅

### Test with a Guest Who Has Phone Only:

- Invitation sent via **SMS/WhatsApp** ✅

### Test with a Guest Who Has Both:

- Invitation sent via **email + SMS/WhatsApp** ✅✅

## Phone Number Format

Guests' phone numbers should be in E.164 format:

- ✅ `+1234567890`
- ✅ `+12345678900`

The system will automatically format common formats:

- `(123) 456-7890` → `+11234567890`
- `123-456-7890` → `+11234567890`

## Cost Information

- **Email**: Free (via your SMTP)
- **SMS**: ~$0.0075 per message (US)
- **WhatsApp**: ~$0.005 per message

Trial accounts get $15.50 in free credit.

## Trial Account Limitations

If using a Twilio trial account:

- You can only send to **verified phone numbers**
- Messages include "Sent from your Twilio trial account" prefix
- To verify a number: Twilio Console → Phone Numbers → Verified Caller IDs

**Upgrade to paid account for production use.**

## Integration Points

The SMS/WhatsApp feature integrates automatically wherever you use:

1. **`sendEventInvitation()`** - Single guest invitation
2. **`sendBulkEventInvitations()`** - Multiple guests

No code changes needed in your event creation/update flows!

## Troubleshooting

### SMS not sending?

Check:

1. Are environment variables set correctly?
2. Is the phone number in E.164 format?
3. For trial accounts: Is the number verified in Twilio Console?
4. Check server logs for error messages

### WhatsApp not working?

- Ensure `TWILIO_WHATSAPP_NUMBER` is set
- For testing: Join the Twilio sandbox first
- For production: Get WhatsApp Business API approved

### Messages still sending only via email?

- The system gracefully handles Twilio being unavailable
- Check server logs - you'll see "Twilio is not configured" if credentials are missing
- Email will continue working even if SMS fails

## That's All!

You now have SMS and WhatsApp messaging integrated into your event invitations. Just add your Twilio credentials and it works automatically alongside your existing email system.

No complex APIs, no database changes, just simple messaging that works! 🎉
