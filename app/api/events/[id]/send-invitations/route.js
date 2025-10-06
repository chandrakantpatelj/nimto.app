import { NextResponse } from 'next/server';
import { checkGuestManagementAccess } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';
import { sendEventInvitation } from '@/services/send-event-invitation';

// POST /api/events/[id]/send-invitations - Send invitations to selected guests
export async function POST(request, { params }) {
  try {
    // Check role-based access
    const accessCheck = await checkGuestManagementAccess('send invitations');
    if (accessCheck.error) {
      return accessCheck.error;
    }

    const { id: eventId } = await params;
    const body = await request.json();
    const { guestIds, type = 'invitation' } = body; // type: 'invitation' or 'reminder'

    // Validate event exists and user has access
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        description: true,
        startDateTime: true,
        locationAddress: true,
        locationUnit: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 },
      );
    }

    // Get guests to send invitations to
    let guests;
    if (guestIds && guestIds.length > 0) {
      // Send to specific guests
      guests = await prisma.guest.findMany({
        where: {
          id: { in: guestIds },
          eventId: eventId,
        },
      });
    } else if (type === 'invitation') {
      // Send to all unsent guests
      guests = await prisma.guest.findMany({
        where: {
          eventId: eventId,
          invitedAt: null, // Not sent yet
        },
      });
    } else if (type === 'reminder') {
      // Send reminders to pending guests
      guests = await prisma.guest.findMany({
        where: {
          eventId: eventId,
          invitedAt: { not: null }, // Already sent
          status: { in: ['PENDING', null] }, // Still pending
        },
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid request parameters' },
        { status: 400 },
      );
    }

    if (guests.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No guests found to send invitations to',
        results: [],
      });
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const results = [];

    // Send invitations to each guest
    for (const guest of guests) {
      try {
        const invitationUrl = `${baseUrl}/invitation/${eventId}/${guest.id}`;

        // Check if any messaging service is available
        const hasEmailConfig =
          process.env.SMTP_HOST &&
          process.env.SMTP_USER &&
          process.env.SMTP_PASS;
        const hasTwilioConfig =
          process.env.TWILIO_ACCOUNT_SID &&
          process.env.TWILIO_AUTH_TOKEN &&
          process.env.TWILIO_PHONE_NUMBER;

        if (!hasEmailConfig && !hasTwilioConfig) {
          console.warn(
            'No messaging service configured. Skipping invitation sending.',
          );
          results.push({
            guestId: guest.id,
            guestName: guest.name,
            contact: guest.email || guest.phone,
            success: false,
            error: 'No messaging service configured',
          });
          continue;
        }

        const invitationResult = await sendEventInvitation({
          guest: {
            name: guest.name,
            email: guest.email,
            phone: guest.phone,
          },
          event: {
            title: event.title,
            description: event.description,
            startDateTime: event.startDateTime,
            location: event.locationAddress
              ? `${event.locationAddress}${event.locationUnit ? `, ${event.locationUnit}` : ''}`
              : null,
          },
          invitationUrl,
        });

        if (invitationResult.success) {
          // Update invitedAt timestamp
          await prisma.guest.update({
            where: { id: guest.id },
            data: { invitedAt: new Date() },
          });

          results.push({
            guestId: guest.id,
            guestName: guest.name,
            contact: guest.email || guest.phone,
            success: true,
            emailSent: invitationResult.emailSent,
            smsSent: invitationResult.smsSent,
          });
        } else {
          results.push({
            guestId: guest.id,
            guestName: guest.name,
            contact: guest.email || guest.phone,
            success: false,
            error: invitationResult.error || 'Failed to send invitation',
          });
        }
      } catch (error) {
        console.error(`Error sending invitation to ${guest.name}:`, error);
        results.push({
          guestId: guest.id,
          guestName: guest.name,
          contact: guest.email || guest.phone,
          success: false,
          error: error.message,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `Sent ${type}s to ${successCount} guests${failureCount > 0 ? `, ${failureCount} failed` : ''}`,
      results,
      summary: {
        total: guests.length,
        successful: successCount,
        failed: failureCount,
      },
    });
  } catch (error) {
    console.error('Error sending invitations:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send invitations',
        details: error.message,
      },
      { status: 500 },
    );
  }
}
