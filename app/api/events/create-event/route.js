import { NextResponse } from 'next/server';
import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';
import { checkEventManagementAccess } from '@/lib/auth-utils';
import { uid } from '@/lib/helpers';
import { createS3Client } from '@/lib/s3-utils';
import { sendEmail } from '@/services/send-email';

// Create a singleton Prisma client
const globalForPrisma = global;
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient();
}
const prisma = globalForPrisma.prisma;

// Check if image exists in S3 (same as templates)
async function checkImageExists(s3Client, bucket, key) {
  try {
    await s3Client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch (error) {
    if (error.name === 'NotFound') {
      return false;
    }
    throw error;
  }
}

// Delete image from S3 (same as templates)
async function deleteImageFromS3(s3Client, bucket, key) {
  try {
    await s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    console.log(`Deleted image from S3: ${key}`);
    return true;
  } catch (error) {
    console.error(`Failed to delete image from S3: ${key}`, error);
    return false;
  }
}

// Generate unique image path (same logic as templates but for events)
function generateUniqueImagePath(
  eventId,
  originalFileName,
  imageFormat = 'png',
) {
  const timestamp = Date.now();
  const uniqueId = uid();
  const extension = imageFormat || originalFileName?.split('.').pop() || 'png';
  const filename = `template_${eventId}_${timestamp}_${uniqueId}.${extension}`;
  return `templates/${filename}`;
}

// POST /api/events/create-event - Create event with optional invitations
export async function POST(request) {
  try {
    // Check role-based access
    const accessCheck = await checkEventManagementAccess('create events');
    if (accessCheck.error) {
      return accessCheck.error;
    }

    const { session } = accessCheck;

    const body = await request.json();

    const {
      title,
      description,
      date,
      time,
      location,
      templateId,
      jsonContent,
      templateImagePath, // Original template imagePath to copy
      newImageData, // Base64 image data if user changed image in Pixie
      imageFormat = 'png',
      status,
      guests = [],
      sendInvitations = false,
    } = body;

    // Validate required fields
    if (!title || !date) {
      return NextResponse.json(
        { success: false, error: 'Title and date are required' },
        { status: 400 },
      );
    }

    // Validate user session
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'User session not found' },
        { status: 401 },
      );
    }

    // Debug: Log session data
    console.log('Session data:', {
      userId: session.user.id,
      userEmail: session.user.email,
      userName: session.user.name,
      roleId: session.user.roleId,
      roleName: session.user.roleName,
    });

    // Try to find user by session ID first
    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true },
    });

    // If not found by ID, try to find by email (common issue with NextAuth)
    if (!user && session.user.email) {
      console.log(
        'User not found by ID, trying to find by email:',
        session.user.email,
      );
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, name: true, email: true },
      });

      if (user) {
        console.log('Found user by email, but ID mismatch:', {
          sessionUserId: session.user.id,
          databaseUserId: user.id,
          email: user.email,
        });
        console.log('Using database user ID for event creation');
      }
    }

    // If still not found, try to find by name (last resort)
    if (!user && session.user.name) {
      console.log(
        'User not found by ID or email, trying to find by name:',
        session.user.name,
      );
      user = await prisma.user.findFirst({
        where: {
          name: session.user.name,
          email: session.user.email, // Additional check to ensure it's the right user
        },
        select: { id: true, name: true, email: true },
      });

      if (user) {
        console.log('Found user by name and email:', {
          sessionUserId: session.user.id,
          databaseUserId: user.id,
          email: user.email,
          name: user.name,
        });
      }
    }

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found in database',
          debug: {
            sessionUserId: session.user.id,
            sessionEmail: session.user.email,
            searchedBy: session.user.id,
          },
        },
        { status: 404 },
      );
    }

    // Verify template exists if templateId is provided
    if (templateId) {
      const template = await prisma.template.findUnique({
        where: { id: templateId },
        select: { id: true, name: true },
      });

      if (!template) {
        return NextResponse.json(
          { success: false, error: 'Template not found' },
          { status: 404 },
        );
      }
    }

    // Validate date format
    let eventDate;
    try {
      eventDate = new Date(date);
      if (isNaN(eventDate.getTime())) {
        throw new Error('Invalid date format');
      }
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid date format' },
        { status: 400 },
      );
    }

    if (guests.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one guest is required' },
        { status: 400 },
      );
    }

    // Debug logging
    console.log('Creating event with data:', {
      title,
      date: eventDate,
      sessionUserId: session.user.id,
      databaseUserId: user.id,
      userExists: !!user,
      userEmail: user?.email,
      guestsCount: guests.length,
    });

    // First create the event to get the event ID
    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: eventDate,
        time,
        location,
        templateId,
        jsonContent,
        imagePath: templateImagePath, // Initially use template imagePath
        status:
          status && typeof status === 'string' ? status.toUpperCase() : 'DRAFT',
        createdByUserId: session.user.id, // This is correct - it's setting from session
        isTrashed: false,
      },
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

    let finalImagePath = templateImagePath; // Default to template imagePath

    // If user changed the image in Pixie, generate new imagePath and upload to template folder
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

        // Generate unique image path (same as templates)
        const newImagePath = generateUniqueImagePath(
          event.id,
          null,
          imageFormat,
        );

        // Convert base64 to buffer
        const base64Data = newImageData.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Upload new image to S3 (same as templates)
        const uploadCommand = new PutObjectCommand({
          Bucket: bucket,
          Key: newImagePath,
          Body: imageBuffer,
          ContentType: `image/${imageFormat}`,
          CacheControl: 'public, max-age=31536000',
          Metadata: {
            'last-updated': new Date().toISOString(),
            'updated-by': 'event-creator',
          },
        });

        await s3Client.send(uploadCommand);
        console.log(`Uploaded new event image to S3: ${newImagePath}`);

        // If template has an existing image, delete it from S3 (optional cleanup)
        if (templateImagePath && templateImagePath !== newImagePath) {
          const oldImageExists = await checkImageExists(
            s3Client,
            bucket,
            templateImagePath,
          );
          if (oldImageExists) {
            await deleteImageFromS3(s3Client, bucket, templateImagePath);
          }
        }

        finalImagePath = newImagePath;

        // Update the event with the new imagePath
        await prisma.event.update({
          where: { id: event.id },
          data: { imagePath: finalImagePath },
        });
      } catch (uploadError) {
        console.error('Error uploading event image:', uploadError);
        return NextResponse.json(
          { success: false, error: 'Failed to upload image' },
          { status: 500 },
        );
      }
    }

    // Create guests
    const createdGuests = [];
    if (guests.length > 0) {
      const guestData = guests.map((guest) => ({
        name: guest.name,
        email: guest.contact,
        eventId: event.id,
        status: 'PENDING',
        response: null, // GuestResponse is optional, set to null initially
      }));

      await prisma.guest.createMany({
        data: guestData,
      });

      // Fetch the created guests with their IDs
      createdGuests.push(
        ...(await prisma.guest.findMany({
          where: { eventId: event.id },
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
            response: true,
          },
        })),
      );
    }

    // Send invitations if requested
    let invitationResults = [];
    if (sendInvitations && createdGuests.length > 0) {
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.NEXTAUTH_URL ||
        'http://localhost:3000';

      for (const guest of createdGuests) {
        try {
          // Create personalized RSVP URL for each guest
          const rsvpUrl = `${baseUrl}/invitation/${event.id}/${guest.id}`;

          await sendEmail({
            to: guest.email,
            subject: `You're invited to ${title}`,
            content: {
              title: `You're invited to ${title}`,
              subtitle: `Join us for this special event`,
              description: `
                <p><strong>Event Details:</strong></p>
                <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${time || 'TBD'}</p>
                <p><strong>Location:</strong> ${location || 'TBD'}</p>
                ${description ? `<p><strong>Description:</strong> ${description}</p>` : ''}
                <p>Please click the button below to view the full invitation and respond.</p>
              `,
              buttonLabel: 'View Invitation & RSVP',
              buttonUrl: rsvpUrl,
            },
          });

          invitationResults.push({
            guest: guest.name,
            email: guest.email,
            status: 'sent',
            rsvpUrl: rsvpUrl,
          });
        } catch (emailError) {
          console.error(
            `Failed to send invitation to ${guest.email}:`,
            emailError,
          );
          invitationResults.push({
            guest: guest.name,
            email: guest.email,
            status: 'failed',
            error: emailError.message,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        event: {
          ...event,
          imagePath: finalImagePath, // Return the final imagePath
        },
        guests: createdGuests,
        invitations: invitationResults,
        imagePath: finalImagePath,
      },
    });
  } catch (error) {
    console.error('Error creating event:', error);

    // Return more specific error messages for debugging
    let errorMessage = 'Failed to create event';
    let statusCode = 500;

    if (error.code === 'P2002') {
      errorMessage = 'Event with this title already exists';
      statusCode = 409;
    } else if (error.code === 'P2003') {
      errorMessage = 'Invalid template or user reference';
      statusCode = 400;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details:
          process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: statusCode },
    );
  }
}
