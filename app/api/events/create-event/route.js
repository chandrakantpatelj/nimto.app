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
import { sendEventInvitation } from '@/services/send-event-invitation';

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
      startDateTime,
      endDateTime,
      timezone, // Event timezone (IANA identifier)
      locationAddress,
      locationUnit,
      showMap,
      templateId,
      jsonContent,
      templateImagePath, // Original template imagePath to copy
      newImageData, // Base64 image data if user changed image in Pixie
      imageFormat = 'png',
      status,
      guests = [],
      sendInvitations = false,
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
    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 },
      );
    }

    if (!startDateTime) {
      return NextResponse.json(
        { success: false, error: 'Event start date and time are required' },
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

    // Try to find user by session ID first
    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, timezone: true },
    });

    // If not found by ID, try to find by email (common issue with NextAuth)
    if (!user && session.user.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, name: true, email: true, timezone: true },
      });

      if (user) {
      }
    }

    // If still not found, try to find by name (last resort)
    if (!user && session.user.name) {
      user = await prisma.user.findFirst({
        where: {
          name: session.user.name,
          email: session.user.email, // Additional check to ensure it's the right user
        },
        select: { id: true, name: true, email: true, timezone: true },
      });
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

    if (guests.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one guest is required' },
        { status: 400 },
      );
    }

    // Smart timezone logic: Use provided timezone > User timezone > UTC
    let eventTimezone = timezone || user?.timezone || 'UTC';

    const event = await prisma.event.create({
      data: {
        title,
        description,
        startDateTime: eventDate,
        endDateTime: endDateTime ? new Date(endDateTime) : null,
        timezone: eventTimezone,
        locationAddress,
        locationUnit,
        showMap: showMap !== undefined ? showMap : true,
        templateId,
        jsonContent,
        imagePath: templateImagePath, // Initially use template imagePath
        status:
          status && typeof status === 'string' ? status.toUpperCase() : 'DRAFT',
        createdByUserId: session.user.id, // This is correct - it's setting from session
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
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            timezone: true,
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
      // Validate guest data
      for (const guest of guests) {
        if (!guest.name || !guest.name.trim()) {
          return NextResponse.json(
            { success: false, error: 'Guest name is required' },
            { status: 400 },
          );
        }
        if (!guest.contact || !guest.contact.trim()) {
          return NextResponse.json(
            {
              success: false,
              error: 'Guest contact information (email or phone) is required',
            },
            { status: 400 },
          );
        }
      }

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

          const invitationResult = await sendEventInvitation({
            guest: {
              name: guest.name,
              email: guest.email,
              phone: guest.phone,
            },
            event: {
              title: title,
              description: description,
              startDateTime: eventDate,
              timezone: eventTimezone,
              location: locationAddress
                ? `${locationAddress}${locationUnit ? `, ${locationUnit}` : ''}`
                : null,
              User: {
                name: user.name,
                email: user.email,
              },
            },
            invitationUrl: rsvpUrl,
            channels: ['email'], // Only send email for now
          });

          invitationResults.push({
            guest: guest.name,
            email: guest.email,
            status: invitationResult.success ? 'sent' : 'failed',
            rsvpUrl: rsvpUrl,
            error: invitationResult.success ? null : invitationResult.message,
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
