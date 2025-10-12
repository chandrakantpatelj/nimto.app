import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { checkEventManagementAccess } from '@/lib/auth-utils';
import { generateDirectS3Url, generateProxyUrl } from '@/lib/s3-utils';
import authOptions from '../auth/[...nextauth]/auth-options';

// Create a singleton Prisma client
const globalForPrisma = global;

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient();
}

const prisma = globalForPrisma.prisma;

// GET /api/events - Get events created by the logged-in user
export async function GET(request) {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const date = searchParams.get('date');
    const admin = searchParams.get('admin'); // Admin flag to get all events

    const where = {
      isTrashed: false,
    };

    // Super Admin and Application Admin can see all events, others see only their own
    if (
      !admin ||
      (session.user.roleSlug !== 'super-admin' &&
        session.user.roleSlug !== 'application-admin')
    ) {
      where.createdByUserId = session.user.id;
    }

    if (status) {
      where.status = status;
    }

    if (date) {
      where.startDateTime = new Date(date);
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        {
          OR: [
            { locationAddress: { contains: search, mode: 'insensitive' } },
            { locationUnit: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        guests: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
            response: true,
          },
        },
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    // Generate URLs for events with imagePath and eventThumbnailPath
    const eventsWithUrls = events.map((event) => {
      const result = { ...event };

      if (event.imagePath) {
        // Generate proxy URL for template image (avoids CORS issues)
        result.s3ImageUrl = generateProxyUrl(event.imagePath);
      }

      if (event.eventThumbnailPath) {
        // Generate direct S3 URL for event thumbnail
        result.eventThumbnailUrl = generateDirectS3Url(
          event.eventThumbnailPath,
        );
      }

      // Parse mapCoordinate from JSON string to object
      if (result.mapCoordinate && typeof result.mapCoordinate === 'string') {
        try {
          result.mapCoordinate = JSON.parse(result.mapCoordinate);
        } catch (error) {
          console.error('Error parsing mapCoordinate:', error);
          result.mapCoordinate = null;
        }
      }

      return result;
    });

    return NextResponse.json({
      success: true,
      data: eventsWithUrls,
    });
  } catch (error) {
    console.error('Error fetching events:', error);

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
      { success: false, error: 'Failed to fetch events' },
      { status: 500 },
    );
  }
}

// POST /api/events - Create a new event
export async function POST(request) {
  // Check role-based access
  const accessCheck = await checkEventManagementAccess('create events');
  if (accessCheck.error) {
    return accessCheck.error;
  }

  const { session } = accessCheck;

  try {
    const body = await request.json();

    const {
      title,
      description,
      startDateTime,
      endDateTime,
      locationAddress,
      locationUnit,
      showMap,
      templateId,
      jsonContent,
      imagePath,
      status,
      // Event features
      privateGuestList = false,
      allowPlusOnes = false,
      allowMaybeRSVP = true,
      allowFamilyHeadcount = false,
      limitEventCapacity = false,
      maxEventCapacity = 0,
      maxPlusOnes = 0,
    } = body;

    // Validate required fields
    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Event title is required' },
        { status: 400 },
      );
    }

    if (!startDateTime) {
      return NextResponse.json(
        { success: false, error: 'Start date is required' },
        { status: 400 },
      );
    }

    if (!locationAddress || !locationAddress.trim()) {
      return NextResponse.json(
        { success: false, error: 'Location address is required' },
        { status: 400 },
      );
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        startDateTime: new Date(startDateTime),
        endDateTime: endDateTime ? new Date(endDateTime) : null,
        locationAddress,
        locationUnit,
        showMap: showMap !== undefined ? showMap : true, // Temporarily disabled until DB migration is confirmed
        templateId,
        jsonContent,
        imagePath,
        status: status || 'DRAFT',
        createdByUserId: session.user.id, // Automatically set from session
        isTrashed: false,
        // Event features
        privateGuestList,
        allowPlusOnes,
        allowMaybeRSVP,
        allowFamilyHeadcount,
        limitEventCapacity,
        maxEventCapacity,
        maxPlusOnes,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create event' },
      { status: 500 },
    );
  }
}
