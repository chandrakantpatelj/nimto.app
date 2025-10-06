import twilio from 'twilio';
import { validatePhoneNumber } from './phone-utils';

/**
 * Simple Twilio Integration
 *
 * Environment Variables:
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 * - TWILIO_PHONE_NUMBER (for SMS)
 * - TWILIO_WHATSAPP_NUMBER (optional)
 */

let twilioClient = null;

/**
 * Get Twilio client
 */
export function getTwilioClient() {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials not configured');
    }

    twilioClient = twilio(accountSid, authToken);
  }

  return twilioClient;
}

/**
 * Check if Twilio is configured
 */
export function isTwilioConfigured() {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  );
}

/**
 * Check if WhatsApp is configured
 */
export function isWhatsAppConfigured() {
  return !!(isTwilioConfigured() && process.env.TWILIO_WHATSAPP_NUMBER);
}

/**
 * Get SMS sender number
 */
export function getSMSSender() {
  return process.env.TWILIO_PHONE_NUMBER;
}

/**
 * Get WhatsApp sender number
 */
export function getWhatsAppSender() {
  const senderNumber = process.env.TWILIO_WHATSAPP_NUMBER;
  return senderNumber?.startsWith('whatsapp:')
    ? senderNumber
    : `whatsapp:${senderNumber}`;
}

/**
 * Parse Twilio errors to user-friendly messages
 */
export function parseTwilioError(error) {
  if (!error) return 'Unknown error occurred';

  const errorMessages = {
    21211: 'Invalid phone number format',
    21408: 'Permission denied to send to this number',
    21610: 'Phone number is not opted in to receive messages',
    30003: 'Message could not be delivered',
    30004: 'Message blocked (spam filter)',
    30006: 'Landline or unreachable carrier',
    63007: 'Number is not a valid mobile number',
  };

  return errorMessages[error.code] || error.message || 'Failed to send message';
}

/**
 * Validate phone number for Twilio
 */
export function validatePhoneNumberForTwilio(phoneNumber) {
  const validation = validatePhoneNumber(phoneNumber);

  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  return validation.formatted;
}
