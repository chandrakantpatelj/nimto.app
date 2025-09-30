import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import authOptions from '../../auth/[...nextauth]/auth-options';

// GET /api/attendee/guests - Get guest records (invitations) for the user
// Query parameters:
// - email: User's email (for email-based access)
// - userId: User's ID (for authenticated access)
// - eventId: Filter by specific event ID
// - status: Filter by invitation status (PENDING, CONFIRMED, DECLINED)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const userId = searchParams.get('userId');
    const eventId = searchParams.get('eventId');
    const status = searchParams.get('status');

    // Check if user is authenticated or email is provided
    const session = await getServerSession(authOptions);

    let userEmail = email;
    let userIdentifier = userId;

    // If no email provided but user is authenticated, use session data
    if (!email && session?.user?.email) {
      userEmail = session.user.email;
      userIdentifier = session.user.id;
    }

    // If no email or userId provided and no session, return unauthorized
    if (!userEmail && !userIdentifier) {
      return NextResponse.json(
        { success: false, error: 'Email or userId required' },
        { status: 400 },
      );
    }

    // Build the where clause for guest records
    const where = {};

    // Filter by email if provided
    if (userEmail) {
      where.email = userEmail;
    }

    // If eventId is provided, filter by that specific event
    if (eventId) {
      where.eventId = eventId;
    }

    // If status is provided, filter by that status
    if (status) {
      where.status = status;
    }

    const guests = await prisma.guest.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDateTime: true,
            endDateTime: true,
            locationAddress: true,
            locationUnit: true,
            description: true,
            imagePath: true,
          },
        },
      },
      orderBy: { invitedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: guests,
    });
  } catch (error) {
    console.error('Error fetching attendee guests:', error);

    // If it's a database connection error or table doesn't exist, return empty array
    if (
      error.code === 'P2021' ||
      error.code === 'P2022' ||
      error.message.includes('relation') ||
      error.message.includes('table')
    ) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch attendee guests' },
      { status: 500 },
    );
  }
}

// PUT /api/attendee/guests - Update guest response (RSVP)
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const userId = searchParams.get('userId');
    const eventId = searchParams.get('eventId');

    const session = await getServerSession(authOptions);

    let userEmail = email;
    let userIdentifier = userId;

    // If no email provided but user is authenticated, use session data
    if (!email && session?.user?.email) {
      userEmail = session.user.email;
      userIdentifier = session.user.id;
    }

    // If no email or userId provided and no session, return unauthorized
    if (!userEmail && !userIdentifier) {
      return NextResponse.json(
        { success: false, error: 'Email or userId required' },
        { status: 400 },
      );
    }

    const body = await request.json();
    const {
      status: newStatus,
      response,
      name,
      phone,
      plusOnes,
      adults,
      children,
    } = body;

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required' },
        { status: 400 },
      );
    }

    if (
      !newStatus ||
      !['PENDING', 'CONFIRMED', 'DECLINED', 'MAYBE'].includes(newStatus)
    ) {
      return NextResponse.json(
        { success: false, error: 'Valid status is required' },
        { status: 400 },
      );
    }

    // Find the guest record with event details
    const guest = await prisma.guest.findFirst({
      where: {
        email: userEmail,
        eventId: eventId,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            allowPlusOnes: true,
            maxPlusOnes: true,
            allowMaybeRSVP: true,
            allowFamilyHeadcount: true,
            limitEventCapacity: true,
            maxEventCapacity: true,
          },
        },
      },
    });

    if (!guest) {
      return NextResponse.json(
        { success: false, error: 'Guest record not found' },
        { status: 404 },
      );
    }

    // Validate against event settings
    const event = guest.event;

    // Validate Maybe RSVP
    if (newStatus === 'MAYBE' && !event.allowMaybeRSVP) {
      return NextResponse.json(
        { success: false, error: 'Maybe RSVP is not allowed for this event' },
        { status: 400 },
      );
    }

    // Validate Plus Ones
    if (plusOnes !== undefined) {
      if (!event.allowPlusOnes && plusOnes > 0) {
        return NextResponse.json(
          { success: false, error: 'Plus ones are not allowed for this event' },
          { status: 400 },
        );
      }
      if (event.allowPlusOnes && plusOnes > (event.maxPlusOnes || 0)) {
        return NextResponse.json(
          { success: false, error: `Plus ones cannot exceed ${event.maxPlusOnes}` },
          { status: 400 },
        );
      }
    }

    // Validate Family Headcount
    if (adults !== undefined || children !== undefined) {
      if (!event.allowFamilyHeadcount && (adults > 1 || children > 0)) {
        return NextResponse.json(
          { success: false, error: 'Family headcount is not allowed for this event' },
          { status: 400 },
        );
      }
      if (event.allowFamilyHeadcount) {
        if (adults !== undefined && adults < 1) {
          return NextResponse.json(
            { success: false, error: 'At least 1 adult is required' },
            { status: 400 },
          );
        }
        if (children !== undefined && children < 0) {
          return NextResponse.json(
            { success: false, error: 'Children count cannot be negative' },
            { status: 400 },
          );
        }
      }
    }

    // Validate Event Capacity
    if (event.limitEventCapacity && event.maxEventCapacity) {
      const totalAttendees = (adults || guest.adults) + (children || guest.children) + (plusOnes || guest.plusOnes);
      if (totalAttendees > event.maxEventCapacity) {
        return NextResponse.json(
          { success: false, error: `Total attendees (${totalAttendees}) cannot exceed event capacity (${event.maxEventCapacity})` },
          { status: 400 },
        );
      }
    }

    // Convert response to proper enum value
    let guestResponse = null;
    if (response) {
      const normalizedResponse = response.toString().toLowerCase();
      if (normalizedResponse === 'yes') {
        guestResponse = 'YES';
      } else if (normalizedResponse === 'no') {
        guestResponse = 'NO';
      } else if (normalizedResponse === 'maybe') {
        guestResponse = 'MAYBE';
      } else if (
        ['YES', 'NO', 'MAYBE'].includes(response.toString().toUpperCase())
      ) {
        // If it's already a valid enum value, keep it
        guestResponse = response.toString().toUpperCase();
      }
    }

    // Update the guest record
    const updatedGuest = await prisma.guest.update({
      where: { id: guest.id },
      data: {
        name: name || guest.name,
        phone: phone || guest.phone,
        status: newStatus,
        response: guestResponse,
        respondedAt: new Date(),
        plusOnes: plusOnes !== undefined ? plusOnes : guest.plusOnes,
        adults: adults !== undefined ? adults : guest.adults,
        children: children !== undefined ? children : guest.children,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDateTime: true,
            endDateTime: true,
            locationAddress: true,
            locationUnit: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedGuest,
    });
  } catch (error) {
    console.error('Error updating guest response:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update guest response' },
      { status: 500 },
    );
  }
}
