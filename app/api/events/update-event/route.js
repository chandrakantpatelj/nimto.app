import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { checkEventManagementAccess } from '@/lib/auth-utils';
import { uid } from '@/lib/helpers';
import { createS3Client, deleteImageFromS3 } from '@/lib/s3-utils';
import { sendBulkEventInvitations } from '@/services/send-event-invitation.js';
import authOptions from '../../auth/[...nextauth]/auth-options';

const prisma = new PrismaClient();

// PUT /api/events/update-event - Update an existing event
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const body = await request.json();
    const {
      id,
      title,
      description,
      startDateTime,
      locationAddress,
      locationUnit,
      showMap,
      templateId,
      jsonContent,
      newImageData,
      imageFormat = 'png',
      status,
      guests = [],
      invitationType,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required' },
        { status: 400 },
      );
    }

    // Validate required fields if provided
    if (title !== undefined && (!title || !title.trim())) {
      return NextResponse.json(
        { success: false, error: 'Event title is required' },
        { status: 400 },
      );
    }

    if (startDateTime !== undefined && !startDateTime) {
      return NextResponse.json(
        { success: false, error: 'Start date is required' },
        { status: 400 },
      );
    }

    if (
      locationAddress !== undefined &&
      (!locationAddress || !locationAddress.trim())
    ) {
      return NextResponse.json(
        { success: false, error: 'Location address is required' },
        { status: 400 },
      );
    }

    // Check if user has access to manage this event
    const hasAccess = await checkEventManagementAccess(session.user.id, id);
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 },
      );
    }

    // Get existing event
    const existingEvent = await prisma.event.findUnique({
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

    if (!existingEvent) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 },
      );
    }

    // Parse and validate startDateTime
    let eventDate;
    if (startDateTime) {
      try {
        eventDate = new Date(startDateTime);
        if (isNaN(eventDate.getTime())) {
          throw new Error('Invalid date format');
        }
      } catch {
        return NextResponse.json(
          { success: false, error: 'Invalid date format' },
          { status: 400 },
        );
      }
    }

    // Handle image upload if newImageData is provided
    let finalImagePath = existingEvent.imagePath;
    if (newImageData && newImageData.trim()) {
      try {
        const s3Client = createS3Client();
        const bucket = process.env.AWS_S3_BUCKET_NAME;

        if (!bucket) {
          return NextResponse.json(
            { success: false, error: 'S3 bucket not configured' },
            { status: 500 },
          );
        }

        // Generate unique image path for the event
        const imageExtension = imageFormat === 'png' ? 'png' : 'jpg';
        const newImagePath = `events/event_${id}_${uid()}.${imageExtension}`;

        // Convert base64 to buffer
        const base64Data = newImageData.replace(
          /^data:image\/[a-z]+;base64,/,
          '',
        );
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Upload to S3
        const uploadCommand = new PutObjectCommand({
          Bucket: bucket,
          Key: newImagePath,
          Body: imageBuffer,
          ContentType: `image/${imageFormat}`,
          Metadata: {
            'uploaded-by': session.user.id,
            'event-id': id,
            'last-updated': new Date().toISOString(),
            'updated-by': 'event-updater',
          },
        });

        await s3Client.send(uploadCommand);

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
            }
          } catch (cleanupError) {
            console.error('Error during image cleanup:', cleanupError);
            // Continue with update even if cleanup fails
          }
        } else if (existingEvent.imagePath && !existingEvent.templateId) {
          // No template, delete the old image
          await deleteImageFromS3(existingEvent.imagePath);
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
        // Validate guest data first
        for (const guest of guests) {
          if (!guest.name || !guest.name.trim()) {
            return NextResponse.json(
              { success: false, error: 'Guest name is required' },
              { status: 400 },
            );
          }
          if (
            (!guest.email || !guest.email.trim()) &&
            (!guest.phone || !guest.phone.trim())
          ) {
            return NextResponse.json(
              {
                success: false,
                error: 'Either email or phone number is required for guests',
              },
              { status: 400 },
            );
          }
        }

        // Process each guest - update existing or create new
        for (const guest of guests) {
          if (
            guest.id &&
            typeof guest.id === 'string' &&
            guest.id.length > 0 &&
            !guest.id.startsWith('temp-')
          ) {
            // Update existing guest (has a valid database ID)
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
          }
        }
      } catch (guestError) {
        console.error('Error updating guests:', guestError);
        // Don't fail the entire update if guest update fails
      }
    }

    // Update the event
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(eventDate && { startDateTime: eventDate }),
        ...(locationAddress !== undefined && { locationAddress }),
        ...(locationUnit !== undefined && { locationUnit }),
        ...(showMap !== undefined && { showMap }), // Temporarily disabled until DB migration is confirmed
        ...(templateId !== undefined && { templateId }),
        ...(jsonContent !== undefined && { jsonContent }),
        ...(finalImagePath && { imagePath: finalImagePath }),
        ...(status && { status: status.toUpperCase() }),
        updatedAt: new Date(),
      },
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

    // Handle invitation sending if requested
    if (
      invitationType &&
      updatedEvent.guests &&
      updatedEvent.guests.length > 0
    ) {
      try {
        let guestsToInvite = [];

        if (invitationType === 'all') {
          // Send to all guests
          guestsToInvite = updatedEvent.guests || [];
        } else if (invitationType === 'new') {
          // Send only to newly created guests
          if (newlyCreatedGuestIds.length > 0) {
            guestsToInvite = (updatedEvent.guests || []).filter((guest) =>
              newlyCreatedGuestIds.includes(guest.id),
            );
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

          // Send bulk invitations
          const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
          const invitationResults = await sendBulkEventInvitations({
            guests: guestsToInvite,
            event: updatedEvent,
            baseUrl: baseUrl,
          });

          const failedInvitations = invitationResults.filter(
            (r) => !r.success,
          ).length;

          if (failedInvitations > 0) {
            console.warn(
              `Failed to send invitations to ${failedInvitations} guests for event ${id}`,
            );
          }
        }
      } catch (error) {
        console.error('Error sending invitations:', error);
        // Don't fail the entire update if invitation sending fails
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedEvent,
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
