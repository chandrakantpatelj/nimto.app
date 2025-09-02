# reCAPTCHA Setup Guide

## Overview
The application uses Google reCAPTCHA v2 for form protection on authentication pages (signin, signup, reset-password).

## Environment Variables Required

Create a `.env.local` file in the project root with the following variables:

```env
# reCAPTCHA Configuration
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here
```

## Getting reCAPTCHA Keys

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Create a new site or use an existing one
3. Select reCAPTCHA v2 ("I'm not a robot" Checkbox)
4. Add your domain(s) to the site list
5. Copy the Site Key and Secret Key

## Development Testing

For development purposes, you can use Google's test keys:

```env
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

**Note**: These test keys will always pass verification and should only be used for development.

## Implementation Details

The reCAPTCHA is implemented using:
- `RecaptchaPopover` component for the UI
- `useRecaptchaV2` hook for reCAPTCHA logic
- Server-side verification in `lib/recaptcha.js`

## Pages Using reCAPTCHA

- `/signin` - Sign in form
- `/signup` - Registration form  
- `/reset-password` - Password reset form

## Troubleshooting

1. **reCAPTCHA not appearing**: Check that `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set
2. **Verification failing**: Check that `RECAPTCHA_SECRET_KEY` is set and matches your site key
3. **Console errors**: Check browser console for reCAPTCHA loading errors
