import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { deleteImageFromS3, generateS3Url } from '@/lib/s3-utils';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';

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

    // Get user session for authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }

    // Get the event with guests to check ownership and prepare for deletion
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        guests: true,
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

    // Check if user has permission to delete this event
    if (event.User.id !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'You can only delete your own events' },
        { status: 403 },
      );
    }

    // Smart S3 image cleanup - compare with template image
    if (event.imagePath && event.templateId) {
      try {
        // Fetch the template to compare image paths
        const template = await prisma.template.findUnique({
          where: { id: event.templateId },
          select: { imagePath: true },
        });

        if (template && template.imagePath !== event.imagePath) {
          // User uploaded a new image (different from template), so delete it from S3
          await deleteImageFromS3(event.imagePath);
          console.log(`Deleted user-uploaded image: ${event.imagePath}`);
        } else if (template && template.imagePath === event.imagePath) {
          // User used template image, don't delete from S3
          console.log(`Keeping template image: ${event.imagePath}`);
        } else {
          // No template found or no template image, delete the event image
          await deleteImageFromS3(event.imagePath);
          console.log(`Deleted event image (no template): ${event.imagePath}`);
        }
      } catch (s3Error) {
        console.error('Error handling S3 image cleanup:', s3Error);
        // Continue with event deletion even if S3 deletion fails
      }
    } else if (event.imagePath && !event.templateId) {
      // Event has image but no template, delete the image
      try {
        await deleteImageFromS3(event.imagePath);
        console.log(`Deleted event image (no template): ${event.imagePath}`);
      } catch (s3Error) {
        console.error('Error deleting S3 image:', s3Error);
        // Continue with event deletion even if S3 deletion fails
      }
    }

    // Delete all associated guests first (due to foreign key constraints)
    if (event.guests && event.guests.length > 0) {
      await prisma.guest.deleteMany({
        where: { eventId: id },
      });
      console.log(`Deleted ${event.guests.length} guests for event ${id}`);
    }

    // Delete the event
    const deletedEvent = await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      data: deletedEvent,
      message: 'Event and associated guests deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting event:', error);

    // Handle specific database errors
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete event' },
      { status: 500 },
    );
  }
}
