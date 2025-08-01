import { apiFetch } from './api';

export async function verifyRecaptchaToken(token) {
  try {
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
    return false;
  }
}
