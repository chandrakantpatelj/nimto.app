import { NextResponse } from 'next/server';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { checkEventManagementAccess } from '@/lib/auth-utils';
import { uid } from '@/lib/helpers';
import {
  deleteImageFromS3,
  generateDirectS3Url,
  getS3Config,
} from '@/lib/s3-utils';
import { sendBulkEventInvitations } from '@/services/send-event-invitation.js';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';

const prisma = new PrismaClient();

// Create S3 client function
function createS3Client() {
  const { region, endpoint } = getS3Config();

  const config = {
    region,
    credentials: {
      accessKeyId:
        process.env.AWS_ACCESS_KEY_ID || process.env.STORAGE_ACCESS_KEY_ID,
      secretAccessKey:
        process.env.AWS_SECRET_ACCESS_KEY ||
        process.env.STORAGE_SECRET_ACCESS_KEY,
    },
  };

  if (endpoint) {
    config.endpoint = endpoint;
    config.forcePathStyle = true;
  }

  return new S3Client(config);
}

// GET /api/events/[id] - Get a specific event
export async function GET(request, { params }) {
  try {
    const { id } = params;

    // Get user session for role-based access
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.roleName;

    // Define where clause based on user role
    let whereClause = { id };

    // If user is not authenticated or is an attendee, only show published events
    if (!session || userRole === 'attendee') {
      whereClause.status = 'PUBLISHED';
    }

    const event = await prisma.event.findUnique({
      where: whereClause,
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

    // Generate standardized proxy URL for event image if exists
    if (event.imagePath) {
      event.s3ImageUrl = generateDirectS3Url(event.imagePath);
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

    // Check role-based access
    const accessCheck = await checkEventManagementAccess('update events');
    if (accessCheck.error) {
      return accessCheck.error;
    }

    const { session } = accessCheck;

    // Get the existing event to check ownership and prepare for image handling
    const existingEvent = await prisma.event.findUnique({
      where: { id },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 },
      );
    }

    // Check if user has permission to update this event
    if (existingEvent.User.id !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'You can only update your own events' },
        { status: 403 },
      );
    }

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
      newImageData, // Base64 image data if user changed image
      imageFormat = 'png',
      status,
      invitationType, // 'all', 'new', or null
      guests, // Array of guest objects
    } = body;

    let finalImagePath = imagePath || existingEvent.imagePath;

    // Handle image update if new image data is provided
    if (newImageData) {
      try {
        const s3Client = createS3Client();
        const bucket = process.env.AWS_S3_BUCKET || process.env.STORAGE_BUCKET;

        if (!bucket) {
          return NextResponse.json(
            { success: false, error: 'S3 bucket not configured' },
            { status: 500 },
          );
        }

        // Generate unique image path
        const timestamp = Date.now();
        const uniqueId = uid();
        const extension = imageFormat || 'png';
        const filename = `template_${id}_${timestamp}_${uniqueId}.${extension}`;
        const newImagePath = `templates/${filename}`;

        // Convert base64 to buffer
        const base64Data = newImageData.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Upload new image to S3
        const uploadCommand = new PutObjectCommand({
          Bucket: bucket,
          Key: newImagePath,
          Body: imageBuffer,
          ContentType: `image/${imageFormat}`,
          CacheControl: 'public, max-age=31536000',
          Metadata: {
            'last-updated': new Date().toISOString(),
            'updated-by': 'event-updater',
          },
        });

        await s3Client.send(uploadCommand);
        console.log(`Uploaded updated event image to S3: ${newImagePath}`);

        // Smart cleanup: Delete old image if it's different from template
        if (existingEvent.imagePath && existingEvent.templateId) {
          try {
            const template = await prisma.template.findUnique({
              where: { id: existingEvent.templateId },
              select: { imagePath: true },
            });

            if (template && template.imagePath !== existingEvent.imagePath) {
              // Old image was user-uploaded, delete it
              await deleteImageFromS3(existingEvent.imagePath);
              console.log(
                `Deleted old user-uploaded image: ${existingEvent.imagePath}`,
              );
            } else {
              // Old image was template image, keep it
              console.log(`Keeping template image: ${existingEvent.imagePath}`);
            }
          } catch (cleanupError) {
            console.error('Error during image cleanup:', cleanupError);
            // Continue with update even if cleanup fails
          }
        } else if (existingEvent.imagePath && !existingEvent.templateId) {
          // No template, delete the old image
          await deleteImageFromS3(existingEvent.imagePath);
          console.log(`Deleted old event image: ${existingEvent.imagePath}`);
        }

        finalImagePath = newImagePath;
      } catch (uploadError) {
        console.error('Error uploading updated event image:', uploadError);
        return NextResponse.json(
          { success: false, error: 'Failed to upload updated image' },
          { status: 500 },
        );
      }
    }

    // Handle guest updates if provided
    let newlyCreatedGuestIds = [];
    if (guests && Array.isArray(guests)) {
      try {
        console.log('Guest Update Debug:', {
          totalGuestsInRequest: guests.length,
          guests: guests.map((g) => ({
            id: g.id,
            name: g.name,
            email: g.email,
            isNew: !g.id,
          })),
        });

        // Process each guest - update existing or create new
        for (const guest of guests) {
          if (
            guest.id &&
            typeof guest.id === 'string' &&
            guest.id.length > 0 &&
            !guest.id.startsWith('temp-')
          ) {
            // Update existing guest (has a valid database ID)
            console.log('Updating existing guest:', guest.name, guest.id);
            await prisma.guest.update({
              where: { id: guest.id },
              data: {
                name: guest.name,
                email: guest.email,
                phone: guest.phone,
                status: guest.status,
              },
            });
          } else {
            // Create new guest (no ID, temp ID, or invalid ID)
            console.log('Creating new guest:', guest.name, guest.email);
            const newGuest = await prisma.guest.create({
              data: {
                eventId: id,
                name: guest.name,
                email: guest.email,
                phone: guest.phone,
                status: guest.status || 'PENDING',
              },
            });
            newlyCreatedGuestIds.push(newGuest.id);
            console.log('New guest created with ID:', newGuest.id);
          }
        }

        console.log('Newly created guest IDs:', newlyCreatedGuestIds);
      } catch (guestError) {
        console.error('Error updating guests:', guestError);
        // Don't fail the entire update if guest update fails
      }
    }

    // Update the event
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
        imagePath: finalImagePath,
        status,
        updatedAt: new Date(),
      },
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

    // Generate standardized proxy URL for event image if exists
    if (event.imagePath) {
      event.s3ImageUrl = generateDirectS3Url(event.imagePath);
    }

    // Handle invitation sending if requested
    if (invitationType && event.guests && event.guests.length > 0) {
      try {
        let guestsToInvite = [];

        console.log('Invitation Debug:', {
          invitationType,
          totalGuests: event.guests?.length || 0,
          newlyCreatedGuestIds,
          guests: (event.guests || []).map((g) => ({
            id: g.id,
            name: g.name,
            email: g.email,
          })),
        });

        if (invitationType === 'all') {
          // Send to all guests
          guestsToInvite = event.guests || [];
          console.log('Sending to all guests:', guestsToInvite.length);
        } else if (invitationType === 'new') {
          // Send only to newly created guests
          if (newlyCreatedGuestIds.length > 0) {
            guestsToInvite = (event.guests || []).filter((guest) =>
              newlyCreatedGuestIds.includes(guest.id),
            );
            console.log(
              'Sending to new guests:',
              guestsToInvite.length,
              'guests:',
              guestsToInvite.map((g) => g.name),
            );
          } else {
            console.log('No newly created guest IDs found');
          }
        }

        if (guestsToInvite.length > 0) {
          // Update guest status and invitedAt timestamp
          await prisma.guest.updateMany({
            where: {
              id: { in: guestsToInvite.map((g) => g.id) },
            },
            data: {
              status: 'INVITED',
              invitedAt: new Date(),
            },
          });

          // Send actual email invitations
          try {
            const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
            const invitationResults = await sendBulkEventInvitations({
              guests: guestsToInvite,
              event: event,
              baseUrl: baseUrl,
            });

            const successfulInvitations = invitationResults.filter(
              (r) => r.success,
            ).length;
            const failedInvitations = invitationResults.filter(
              (r) => !r.success,
            ).length;

            console.log(
              `Invitations sent to ${successfulInvitations} guests for event ${id}`,
            );

            if (failedInvitations > 0) {
              console.warn(
                `Failed to send invitations to ${failedInvitations} guests for event ${id}`,
              );
            }
          } catch (emailError) {
            console.error('Error sending email invitations:', emailError);
            // Don't fail the entire update if email sending fails
          }
        }
      } catch (invitationError) {
        console.error('Error sending invitations:', invitationError);
        // Don't fail the entire update if invitation sending fails
      }
    }

    return NextResponse.json({
      success: true,
      data: event,
      message: 'Event updated successfully',
    });
  } catch (error) {
    console.error('Error updating event:', error);

    // Handle specific database errors
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 },
      );
    }

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

    // Check role-based access
    const accessCheck = await checkEventManagementAccess('delete events');
    if (accessCheck.error) {
      return accessCheck.error;
    }

    const { session } = accessCheck;

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
