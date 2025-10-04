import { sendEmail } from './send-email.js';

export async function sendEventInvitation({ guest, event, invitationUrl }) {
    const { name, email, phone } = guest;
    const { title, description, startDateTime, location, User } = event;

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
    //const eventTime = eventDateTime.toLocaleTimeString('en-US', {
    //    hour: 'numeric',
    //    minute: '2-digit',
    //    hour12: true,
    //});
    const eventTime = extractHourMinute(startDateTime);

    // Get host name
    const hostName = User?.name || User?.email || 'The event host';

    const subject = `You're invited to ${title}!`;

    const content = {
        title: `You're Invited!`,
        subtitle: `<strong>${hostName}</strong> has invited you to attend <strong>${title}</strong>`,
        eventDetails: {
            date: eventDate,
            time: eventTime,
            location: location || null,
            eventDescription: description || null,
        },
        description: 'Please click the button below to view the full invitation and RSVP to this event.',
        buttonLabel: 'View Invitation & RSVP',
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

export function extractHourMinute(dateString) {
    // Match the time part after the 'T'
    const match = dateString.match(/T(\d{2}):(\d{2})/);
    if (match) {
        let hour = match[1];
        let minute = match[2];
        // Optionally format to 12-hour with AM/PM
        const hourNum = parseInt(hour, 10);
        const ampm = hourNum >= 12 ? 'PM' : 'AM';
        const hour12 = ((hourNum + 11) % 12 + 1); // 12-hour format
        return `${hour12}:${minute} ${ampm}`;
    }
    return 'Invalid Time';
}
