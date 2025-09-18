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
            date: true,
            location: true,
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
      additionalNotes,
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

    // Find the guest record
    const guest = await prisma.guest.findFirst({
      where: {
        email: userEmail,
        eventId: eventId,
      },
    });

    if (!guest) {
      return NextResponse.json(
        { success: false, error: 'Guest record not found' },
        { status: 404 },
      );
    }

    // Convert response to proper enum value
    let guestResponse = null;
    const responseValue = additionalNotes || response;
    if (responseValue) {
      const normalizedResponse = responseValue.toString().toLowerCase();
      if (normalizedResponse === 'yes') {
        guestResponse = 'YES';
      } else if (normalizedResponse === 'no') {
        guestResponse = 'NO';
      } else if (normalizedResponse === 'maybe') {
        guestResponse = 'MAYBE';
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
            date: true,
            location: true,
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
