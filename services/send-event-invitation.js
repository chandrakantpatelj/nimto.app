import { validatePhoneNumber } from '@/lib/phone-utils';
import { sendEmail } from './send-email.js';
import { sendMessage } from './send-sms.js';

/**
 * Send event invitation to a guest via email and/or SMS
 */
export async function sendEventInvitation({ guest, event, invitationUrl }) {
  const { name, email, phone } = guest;
  const { title, description, startDateTime, locationAddress } = event;

  // Validate contact info
  if (!email && !phone) {
    console.warn(`No contact info for guest ${name}`);
    return { success: false, error: 'No contact information available' };
  }

  // Format event details
  const eventDateTime = new Date(startDateTime);
  const eventDate = eventDateTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const eventTime = eventDateTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  let emailSent = false;
  let smsSent = false;

  // Try to send email
  if (email) {
    try {
      const subject = `You're invited to ${title}!`;
      const content = {
        title: `You're Invited!`,
        subtitle: `You've been invited to attend ${title}`,
        description: `
          <p><strong>Event Details:</strong></p>
          <p><strong>Date:</strong> ${eventDate}</p>
          <p><strong>Time:</strong> ${eventTime}</p>
          ${locationAddress ? `<p><strong>Location:</strong> ${locationAddress}</p>` : ''}
          ${description ? `<p><strong>Description:</strong> ${description}</p>` : ''}
          <p>Please click the button below to view the full invitation and respond.</p>
        `,
        buttonLabel: 'View Invitation',
        buttonUrl: invitationUrl,
      };

      await sendEmail({ to: email, subject, content });
      console.log(`Email invitation sent to ${name} (${email})`);
      emailSent = true;
    } catch (error) {
      console.error(`Failed to send email to ${name}:`, error);
    }
  }

  // Try to send SMS/WhatsApp if phone is available
  if (phone) {
    // Clean phone number (remove spaces and other non-digit characters except +)
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    const phoneValidation = validatePhoneNumber(cleanPhone);

    console.log(`📱 Processing phone for ${name}:`, {
      original: phone,
      cleaned: cleanPhone,
      isValid: phoneValidation.isValid,
      validationError: phoneValidation.error,
    });

    if (phoneValidation.isValid) {
      try {
        const message = `Hi ${name}!\n\nYou're invited to ${title}\n\n📅 ${eventDate}\n🕐 ${eventTime}\n${locationAddress ? `📍 ${locationAddress}\n` : ''}\nView invitation: ${invitationUrl}`;

        console.log(`🚀 Attempting to send message to ${name} (${cleanPhone})`);
        const result = await sendMessage({ to: cleanPhone, message });

        console.log(`📊 Message result for ${name}:`, {
          success: result.success,
          channel: result.channel,
          status: result.status,
          error: result.error,
        });

        if (result.success) {
          console.log(
            `✅ ${result.channel} invitation sent to ${name} (${phone})`,
          );
          smsSent = true;
        } else {
          console.error(
            `❌ Failed to send ${result.channel} to ${name}: ${result.error}`,
          );
        }
      } catch (error) {
        console.error(`💥 Exception sending message to ${name}:`, error);
      }
    } else {
      console.warn(
        `⚠️ Invalid phone number for ${name}: ${phone} (cleaned: ${cleanPhone}) - ${phoneValidation.error}`,
      );
    }
  }

  return {
    success: emailSent || smsSent,
    emailSent,
    smsSent,
    contact: email || phone,
  };
}

/**
 * Send invitations to multiple guests
 */
export async function sendBulkEventInvitations({ guests, event, baseUrl }) {
  const results = [];

  for (const guest of guests) {
    const invitationUrl = `${baseUrl}/events/${event.id}/invitation/${guest.id}`;
    const result = await sendEventInvitation({ guest, event, invitationUrl });

    results.push({
      guestId: guest.id,
      guestName: guest.name,
      ...result,
    });

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  const successful = results.filter((r) => r.success).length;
  console.log(`Invitations sent: ${successful}/${results.length}`);

  return results;
}
