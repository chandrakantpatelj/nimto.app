import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateS3Url } from '@/lib/s3-utils';

// Create a singleton Prisma client
const globalForPrisma = global;

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient();
}

const prisma = globalForPrisma.prisma;

// GET /api/events - Get all events
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const createdByUserId = searchParams.get('createdByUserId');
    const date = searchParams.get('date');

    const where = {
      isTrashed: false, // Add back the isTrashed filter
    };

    if (status) {
      where.status = status;
    }

    if (createdByUserId) {
      where.createdByUserId = createdByUserId;
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
      createdByUserId,
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
        createdByUserId,
        isTrashed: false, // Add the isTrashed field
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
