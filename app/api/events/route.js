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
      (session.user.roleName !== 'super-admin' &&
        session.user.roleName !== 'application-admin')
    ) {
      where.createdByUserId = session.user.id;
    }

    if (status) {
      where.status = status;
    }

    if (date) {
      where.date = new Date(date);
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
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
      date,
      time,
      location,
      templateId,
      jsonContent,
      imagePath,
      status,
    } = body;

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        time,
        location,
        templateId,
        jsonContent,
        imagePath,
        status: status || 'DRAFT',
        createdByUserId: session.user.id, // Automatically set from session
        isTrashed: false,
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
