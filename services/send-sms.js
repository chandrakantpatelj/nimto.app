import {
  getSMSSender,
  getTwilioClient,
  getWhatsAppSender,
  isTwilioConfigured,
  isWhatsAppConfigured,
  parseTwilioError,
  validatePhoneNumberForTwilio,
} from '@/lib/twilio';

/**
 * Send SMS message
 */
export async function sendSMS({ to, message }) {
  try {
    if (!isTwilioConfigured()) {
      throw new Error('Twilio SMS is not configured');
    }

    const formattedTo = validatePhoneNumberForTwilio(to);
    const fromNumber = getSMSSender();
    const client = getTwilioClient();

    console.log(`📤 Sending SMS to ${formattedTo} from ${fromNumber}`);

    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: formattedTo,
      // Optional webhook for delivery status tracking
      statusCallback: process.env.TWILIO_STATUS_CALLBACK_URL || undefined,
    });

    console.log(
      `✅ SMS sent to ${formattedTo}. Status: ${result.status}, SID: ${result.sid}`,
    );

    return {
      success: true,
      channel: 'SMS',
      sid: result.sid,
      status: result.status,
    };
  } catch (error) {
    console.error(`❌ SMS failed for ${to}:`, {
      message: error.message,
      code: error.code,
      moreInfo: error.moreInfo,
    });

    return {
      success: false,
      channel: 'SMS',
      error: parseTwilioError(error),
    };
  }
}

/**
 * Send WhatsApp message
 */
export async function sendWhatsApp({ to, message }) {
  try {
    if (!isWhatsAppConfigured()) {
      throw new Error('WhatsApp is not configured');
    }

    const formattedTo = validatePhoneNumberForTwilio(to);
    const fromSender = getWhatsAppSender();
    const fromNumber = fromSender.startsWith('whatsapp:')
      ? fromSender
      : `whatsapp:${fromSender}`;

    const client = getTwilioClient();
    const whatsappTo = `whatsapp:${formattedTo}`;

    console.log(
      `📤 Sending WhatsApp message to ${formattedTo} from ${fromNumber}`,
    );

    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: whatsappTo,
      statusCallback: process.env.TWILIO_STATUS_CALLBACK_URL || undefined,
    });

    const failureStatuses = [
      'failed',
      'undelivered',
      'unknown',
      'canceled',
      'undeliverable',
      'rejected',
      'blocked',
      'invalid',
      'unreachable',
    ];

    const failureErrorCodes = [21211, 21408, 21610, 30003, 30004, 30006, 63007];

    const status = result.status?.toLowerCase() || '';
    const isStatusFailed = failureStatuses.includes(status);
    const hasErrorCode =
      result.errorCode && failureErrorCodes.includes(result.errorCode);

    const isFailed = isStatusFailed || hasErrorCode;

    console.log(`📨 WhatsApp API Response for ${to}:`, {
      status: result.status,
      sid: result.sid,
      isFailed,
      errorCode: result.errorCode,
      errorMessage: result.errorMessage,
    });

    return {
      success: !isFailed,
      channel: 'WHATSAPP',
      sid: result.sid,
      status: result.status,
      errorCode: result.errorCode,
      error: isFailed
        ? `WhatsApp delivery failed: ${result.status} (Code: ${result.errorCode})`
        : null,
    };
  } catch (error) {
    console.error(`❌ WhatsApp API error for ${to}:`, {
      message: error.message,
      code: error.code,
      moreInfo: error.moreInfo,
    });

    return {
      success: false,
      channel: 'WHATSAPP',
      error: parseTwilioError(error),
    };
  }
}

/**
 * Try sending WhatsApp first, then fallback to SMS
 */
export async function sendMessage({ to, message }) {
  if (isWhatsAppConfigured()) {
    const whatsappResult = await sendWhatsApp({ to, message });

    const failureStatuses = [
      'failed',
      'undelivered',
      'unknown',
      'canceled',
      'undeliverable',
      'rejected',
      'blocked',
      'invalid',
      'unreachable',
    ];

    const status = whatsappResult.status?.toLowerCase() || '';
    const isWhatsAppSuccessful =
      whatsappResult.success && !failureStatuses.includes(status);

    if (isWhatsAppSuccessful) {
      console.log(`✅ WhatsApp delivered successfully to ${to}`);
      return whatsappResult;
    }

    console.warn(
      `⚠️ WhatsApp failed for ${to}. Falling back to SMS. Status: ${whatsappResult.status}`,
    );
  }

  return await sendSMS({ to, message });
}

/**
 * Send bulk messages with delay (rate-limited)
 */
export async function sendBulkMessages({ recipients, message, delay = 1000 }) {
  const client = getTwilioClient();
  const results = [];

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    const phone = recipient.phone;
    const msg = recipient.message || message;

    try {
      const result = await sendMessage({ to: phone, message: msg, client });

      results.push({ recipient: phone, ...result });

      if (i < recipients.length - 1 && delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    } catch (error) {
      results.push({
        recipient: phone,
        success: false,
        error: error.message,
      });
    }
  }

  return results;
}
