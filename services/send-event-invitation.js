import {
  formatDateInTimezone,
  formatEventDateWithTimezone,
  formatTimeInTimezone,
  getTimezoneAbbreviation,
} from '@/lib/date-utils.js';
import { cleanPhoneNumber } from '@/lib/phone-utils.js';
import { sendEmail } from './send-email.js';
import { sendMessage } from './send-sms.js';

export async function sendEventInvitation({
  guest,
  event,
  invitationUrl,
  channels = ['email', 'sms'],
}) {
  const { name, email, phone } = guest;
  const { title, description, startDateTime, timezone, location, User } = event;

  if (!email && !phone) {
    console.warn(`No contact info for guest ${name}`);
    return { success: false, error: 'No contact information available' };
  }

  // Get event timezone (default to UTC if not set) - using same logic as invitation route
  const eventTimezone = timezone || 'UTC';

  // Use our comprehensive timezone utilities for consistent formatting
  const formattedDateTime = formatEventDateWithTimezone(
    startDateTime,
    eventTimezone,
    true, // Show timezone abbreviation
  );

  // Use same timezone logic as invitation route for consistency
  const eventDate = formatDateInTimezone(startDateTime, eventTimezone);
  const eventTime = formatTimeInTimezone(startDateTime, eventTimezone);
  const timezoneAbbr = getTimezoneAbbreviation(eventTimezone);

  // Format time exactly like invitation route: "12:00 PM GMT+5:30"
  const eventTimeWithTimezone = `${eventTime} ${timezoneAbbr}`;

  // Get host name
  const hostName = User?.name || User?.email || 'The event host';

  const results = {
    email: { sent: false, error: null },
    sms: { sent: false, error: null },
  };

  // Send email if email is available and email channel is requested
  if (email && channels.includes('email')) {
    try {
      const subject = `You're invited to ${title}!`;
      const content = {
        title: `You're Invited!`,
        subtitle: `<strong>${hostName}</strong> has invited you to attend <strong>${title}</strong>`,
        eventDetails: {
          date: eventDate,
          time: eventTimeWithTimezone,
          location: location || null,
          eventDescription: description || null,
        },
        description:
          'Please click the button below to view the full invitation and RSVP to this event.',
        buttonLabel: 'View Invitation & RSVP',
        buttonUrl: invitationUrl,
      };

      await sendEmail({
        to: email,
        subject,
        content,
      });

      results.email.sent = true;
      console.log(`Event invitation email sent to ${name} (${email})`);
    } catch (error) {
      results.email.error = error.message;
      console.error(
        `Failed to send email invitation to ${name} (${email}):`,
        error,
      );
    }
  }

  // Send SMS/WhatsApp if phone is available and sms channel is requested
  if (phone && channels.includes('sms')) {
    try {
      // Clean phone number - remove all spaces and non-digit characters except +
      const cleanPhone = cleanPhoneNumber(phone);

      // Use formatted date/time with timezone for SMS
      const smsMessage = `Hi ${name}! You're invited to "${title}" on ${formattedDateTime}${location ? ` at ${location}` : ''}. View details and RSVP: ${invitationUrl}`;

      const smsResult = await sendMessage({
        to: cleanPhone,
        message: smsMessage,
      });

      if (smsResult.success) {
        results.sms.sent = true;
        console.log(
          `Event invitation SMS sent to ${name} (${cleanPhone}) via ${smsResult.channel}`,
        );
      } else {
        results.sms.error = smsResult.error;
        console.error(
          `Failed to send SMS invitation to ${name} (${cleanPhone}):`,
          smsResult.error,
        );
      }
    } catch (error) {
      results.sms.error = error.message;
      console.error(
        `Failed to send SMS invitation to ${name} (${cleanPhone}):`,
        error,
      );
    }
  }

  // Return success if at least one channel succeeded
  const success = results.email.sent || results.sms.sent;
  return {
    success,
    results,
    message: success
      ? 'Invitation sent successfully'
      : 'Failed to send invitation',
  };
}

export async function sendBulkEventInvitations({
  guests,
  event,
  baseUrl,
  channels = ['email', 'sms'],
}) {
  const results = [];

  for (const guest of guests) {
    const invitationUrl = `${baseUrl}/invitation/${event.id}/${guest.id}`;

    const invitationResult = await sendEventInvitation({
      guest,
      event,
      invitationUrl,
      channels,
    });

    results.push({
      guestId: guest.id,
      guestName: guest.name,
      contact: guest.email || guest.phone,
      success: invitationResult.success,
      emailSent: invitationResult.results?.email?.sent || false,
      smsSent: invitationResult.results?.sms?.sent || false,
      errors: {
        email: invitationResult.results?.email?.error || null,
        sms: invitationResult.results?.sms?.error || null,
      },
    });
  }

  return results;
}

export function extractHourMinute(dateString) {
  if (!dateString) return { hour: null, minute: null };
  const str =
    typeof dateString === 'string' ? dateString : dateString.toISOString();
  const match = str.match(/T(\d{2}):(\d{2})/);
  if (match) {
    let hour = match[1];
    let minute = match[2];
    return { hour, minute };
  }
  return { hour: null, minute: null };
}
