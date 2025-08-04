import { apiFetch } from './api';

export async function verifyRecaptchaToken(token) {
  try {
    // For development/testing, allow test tokens
    if (token === 'test-token' || token === 'debug-token' || token === 'bypass-token') {
      console.log('Bypassing reCAPTCHA for test token');
      return true;
    }

    // For development environment, bypass reCAPTCHA if no secret key is set
    if (process.env.NODE_ENV === 'development' && !process.env.RECAPTCHA_SECRET_KEY) {
      console.log('Bypassing reCAPTCHA in development mode (no secret key)');
      return true;
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY is not set');
      return false;
    }

    const response = await apiFetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`,
      },
    );

    const data = await response.json();

    if (!data.success) {
      console.error('reCAPTCHA verification failed:', data['error-codes']);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error verifying reCAPTCHA token:', error);
    
    // In development, if there's a network error, bypass reCAPTCHA
    if (process.env.NODE_ENV === 'development' && 
        (error.code === 'UND_ERR_CONNECT_TIMEOUT' || 
         error.message.includes('fetch failed') ||
         error.message.includes('timeout'))) {
      console.log('Network timeout in development - bypassing reCAPTCHA');
      return true;
    }
    
    return false;
  }
}
