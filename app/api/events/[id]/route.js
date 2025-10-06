import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { checkEventManagementAccess } from '@/lib/auth-utils';
import {
  deleteImageFromS3,
  generateDirectS3Url,
  generateProxyUrl,
} from '@/lib/s3-utils';

const prisma = new PrismaClient();

// GET /api/events/[id] - Get a specific event (public access for design pages)
export async function GET(request, { params }) {
  try {
    const { id } = await params;

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

    // Generate S3 URLs for images
    if (event.imagePath) {
      // Generate proxy URL for template images or direct URL for event images
      event.s3ImageUrl = generateProxyUrl(event.imagePath);
    }

    if (event.eventThumbnailPath) {
      // Generate direct S3 URL for event thumbnail
      event.eventThumbnailUrl = generateDirectS3Url(event.eventThumbnailPath);
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

// DELETE /api/events/[id] - Delete an event (hard delete)
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Check role-based access
    const accessCheck = await checkEventManagementAccess('delete events');
    if (accessCheck.error) {
      return accessCheck.error;
    }

    // const { session } = accessCheck;

    // Get the event with its guests for cleanup
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

    // Handle S3 image cleanup before deleting the event
    if (event.imagePath) {
      try {
        const bucket = process.env.AWS_S3_BUCKET_NAME;

        if (bucket) {
          // Check if this image is from a template
          if (event.templateId) {
            const template = await prisma.template.findUnique({
              where: { id: event.templateId },
              select: { imagePath: true },
            });

            if (template && template.imagePath !== event.imagePath) {
              // User uploaded a new image (different from template), so delete it from S3
              await deleteImageFromS3(event.imagePath);
            } else if (template && template.imagePath === event.imagePath) {
              // User used template image, don't delete from S3
            } else {
              // No template found or no template image, delete the event image
              await deleteImageFromS3(event.imagePath);
            }
          } else {
            // Event has image but no template, delete the image
            try {
              await deleteImageFromS3(event.imagePath);
            } catch (s3Error) {
              console.error('Error deleting S3 image:', s3Error);
              // Continue with event deletion even if S3 deletion fails
            }
          }
        }
      } catch (s3Error) {
        console.error('Error handling S3 image cleanup:', s3Error);
        // Continue with event deletion even if S3 deletion fails
      }
    }

    // Delete all associated guests first (due to foreign key constraints)
    if (event.guests && event.guests.length > 0) {
      await prisma.guest.deleteMany({
        where: { eventId: id },
      });
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
