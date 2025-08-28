import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateS3Url } from '@/lib/s3-utils';

const prisma = new PrismaClient();

// GET /api/events/[id] - Get a specific event
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        guests: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            status: true,
            response: true,
            invitedAt: true,
            respondedAt: true,
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
    });
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 },
      );
    }

    // Generate S3 URL for event image if exists
    if (event.imagePath) {
      const s3ImageUrl = generateS3Url(event.imagePath);
      const proxyImageUrl = `/api/image-proxy?url=${s3ImageUrl}`;
      event.s3ImageUrl = proxyImageUrl;
    }

    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Error fetching event:', error);

    // If it's a database connection error or table doesn't exist, return 404
    if (
      error.code === 'P2021' ||
      error.code === 'P2022' ||
      error.message.includes('relation') ||
      error.message.includes('table')
    ) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch event' },
      { status: 500 },
    );
  }
}

// PUT /api/events/[id] - Update an event
export async function PUT(request, { params }) {
  try {
    const { id } = params;
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

    const event = await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        date: date ? new Date(date) : undefined,
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
        updatedAt: new Date(),
      },
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
    });

    // Generate S3 URL for event image if exists
    if (event.imagePath) {
      const s3ImageUrl = generateS3Url(event.imagePath);
      const proxyImageUrl = `/api/image-proxy?url=${s3ImageUrl}`;
      event.s3ImageUrl = proxyImageUrl;
    }

    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update event' },
      { status: 500 },
    );
  }
}

// DELETE /api/events/[id] - Delete an event (hard delete)
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const event = await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      data: event,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete event' },
      { status: 500 },
    );
  }
}
