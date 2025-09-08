import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { checkEventManagementAccess } from '@/lib/auth-utils';
import { generateS3Url } from '@/lib/s3-utils';
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

    const where = {
      isTrashed: false,
      createdByUserId: session.user.id, // Only return events created by the logged-in user
    };

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

    // Generate S3 URLs for events with imagePath
    const eventsWithUrls = events.map((event) => {
      if (event.imagePath) {
        // Generate S3 URL (already encoded by generateS3Url)
        const s3ImageUrl = generateS3Url(event.imagePath);

        // Use proxy URL to avoid CORS issues and access private S3 bucket
        const proxyImageUrl = `/api/image-proxy?url=${s3ImageUrl}`;

        return {
          ...event,
          s3ImageUrl: proxyImageUrl,
        };
      }
      return event;
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
      backgroundStyle,
      htmlContent,
      background,
      pageBackground,
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
        backgroundStyle,
        htmlContent,
        background,
        pageBackground,
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
