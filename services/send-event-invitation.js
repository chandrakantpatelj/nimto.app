import { sendEmail } from './send-email.js';

export async function sendEventInvitation({ guest, event, invitationUrl }) {
  const { name, email, phone } = guest;
  const { title, description, startDateTime, location } = event;

  // Use email if available, otherwise use phone
  const contactInfo = email || phone;
  if (!contactInfo) {
    console.warn(`No contact info for guest ${name}`);
    return false;
  }

  // Format the event date and time
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

  const subject = `You're invited to ${title}!`;

  const content = {
    title: `You're Invited!`,
    subtitle: `You've been invited to attend ${title}`,
    description: `
      <p><strong>Event Details:</strong></p>
      <p><strong>Date:</strong> ${eventDate}</p>
      <p><strong>Time:</strong> ${eventTime}</p>
      ${location ? `<p><strong>Location:</strong> ${location}</p>` : ''}
      ${description ? `<p><strong>Description:</strong> ${description}</p>` : ''}
      <p>Please click the button below to view the full invitation and respond.</p>
    `,
    buttonLabel: 'View Invitation',
    buttonUrl: invitationUrl,
  };

  try {
    await sendEmail({
      to: contactInfo,
      subject,
      content,
    });

    console.log(`Event invitation sent to ${name} (${contactInfo})`);
    return true;
  } catch (error) {
    console.error(
      `Failed to send invitation to ${name} (${contactInfo}):`,
      error,
    );
    return false;
  }
}

export async function sendBulkEventInvitations({ guests, event, baseUrl }) {
  const results = [];

  for (const guest of guests) {
    const invitationUrl = `${baseUrl}/invitation/${event.id}/${guest.id}`;

    const success = await sendEventInvitation({
      guest,
      event,
      invitationUrl,
    });

    results.push({
      guestId: guest.id,
      guestName: guest.name,
      contact: guest.email || guest.phone,
      success,
    });
  }

  return results;
}
