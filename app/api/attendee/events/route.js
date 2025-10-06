import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { generateDirectS3Url } from '@/lib/s3-utils';
import authOptions from '../../auth/[...nextauth]/auth-options';

// GET /api/attendee/events - Get events that the user has been invited to
// Query parameters:
// - email: User's email (for email-based access)
// - userId: User's ID (for authenticated access)
// - eventId: Get a specific event by ID
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
    const guestWhere = {};

    // Filter by email if provided
    if (userEmail) {
      guestWhere.email = userEmail;
    }

    // If eventId is provided, filter by that specific event
    if (eventId) {
      guestWhere.eventId = eventId;
    }

    // If status is provided, filter by that status
    if (status) {
      guestWhere.status = status;
    }

    // Get guest records with associated events
    let userGuests;
    try {
      userGuests = await prisma.guest.findMany({
        where: guestWhere,
        include: {
          event: {
            include: {
              User: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { invitedAt: 'desc' },
      });
    } catch (queryError) {
      console.error('Attendee Events API - Prisma query error:', queryError);
      throw queryError;
    }

    // Filter out events that are null or trashed
    let events = userGuests
      .filter((guest) => guest.event !== null && !guest.event.isTrashed)
      .map((guest) => ({
        ...guest.event,
        guests: [
          {
            id: guest.id,
            name: guest.name,
            email: guest.email,
            phone: guest.phone,
            status: guest.status,
            response: guest.response,
            plusOnes: guest.plusOnes,
            adults: guest.adults,
            children: guest.children,
            invitedAt: guest.invitedAt,
            respondedAt: guest.respondedAt,
          },
        ],
      }));

    // Generate S3 URLs for events with imagePath and thumbnailPath
    const eventsWithUrls = events.map((event) => {
      const eventWithUrls = { ...event };

      // Generate S3 URL for main image
      if (event.imagePath) {
        eventWithUrls.s3ImageUrl = generateDirectS3Url(event.imagePath);
      }

      // Generate S3 URL for thumbnail
      if (event.eventThumbnailPath) {
        eventWithUrls.eventThumbnailUrl = generateDirectS3Url(
          event.eventThumbnailPath,
        );
      }

      return eventWithUrls;
    });

    return NextResponse.json({
      success: true,
      data: eventsWithUrls,
    });
  } catch (error) {
    console.error('Error fetching attendee events:', error);

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
      { success: false, error: 'Failed to fetch attendee events' },
      { status: 500 },
    );
  }
}
