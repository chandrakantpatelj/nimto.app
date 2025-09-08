import { NextResponse } from 'next/server';
import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { checkEventManagementAccess } from '@/lib/auth-utils';
import { uid } from '@/lib/helpers';
import { sendEmail } from '@/services/send-email';
import authOptions from '../../auth/[...nextauth]/auth-options';

// Create a singleton Prisma client
const globalForPrisma = global;
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient();
}
const prisma = globalForPrisma.prisma;

// S3 Client configuration (same as templates)
function createS3Client() {
  const config = {
    region: process.env.AWS_REGION || process.env.STORAGE_REGION || 'us-east-1',
    credentials: {
      accessKeyId:
        process.env.AWS_ACCESS_KEY_ID || process.env.STORAGE_ACCESS_KEY_ID,
      secretAccessKey:
        process.env.AWS_SECRET_ACCESS_KEY ||
        process.env.STORAGE_SECRET_ACCESS_KEY,
    },
  };

  if (process.env.AWS_ENDPOINT || process.env.STORAGE_ENDPOINT) {
    config.endpoint = process.env.AWS_ENDPOINT || process.env.STORAGE_ENDPOINT;
    config.forcePathStyle = true;
  } else {
    config.forcePathStyle = false;
  }

  return new S3Client(config);
}

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
      backgroundStyle,
      htmlContent,
      background,
      pageBackground,
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

    if (guests.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one guest is required' },
        { status: 400 },
      );
    }

    // First create the event to get the event ID
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
        imagePath: templateImagePath, // Initially use template imagePath
        status: status.toUpperCase() || 'DRAFT',
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
    if (sendInvitations && guests.length > 0) {
      const eventUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/events/${event.id}`;

      for (const guest of guests) {
        try {
          await sendEmail({
            to: guest.contact,
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
              `,
              buttonLabel: 'View Event',
              buttonUrl: eventUrl,
            },
          });

          invitationResults.push({
            guest: guest.name,
            email: guest.contact,
            status: 'sent',
          });
        } catch (emailError) {
          console.error(
            `Failed to send invitation to ${guest.contact}:`,
            emailError,
          );
          invitationResults.push({
            guest: guest.name,
            email: guest.contact,
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
    return NextResponse.json(
      { success: false, error: 'Failed to create event' },
      { status: 500 },
    );
  }
}
