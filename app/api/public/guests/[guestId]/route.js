import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateDirectS3Url } from '@/lib/s3-utils';

// GET /api/public/guests/[guestId] - Get guest record by ID (public access for invitations)
export async function GET(request, { params }) {
  try {
    const { guestId } = await params;

    if (!guestId) {
      return NextResponse.json(
        { success: false, error: 'Guest ID is required' },
        { status: 400 },
      );
    }

    // Get guest record with basic event information
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      include: {
        event: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!guest) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Guest invitation not found or invalid',
          errorType: 'INVALID_INVITATION',
          message: 'The invitation link you clicked is not valid. Please check the link or contact the event organizer.'
        },
        { status: 404 },
      );
    }

    // Check if event is valid and not trashed
    if (!guest.event) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Event not found',
          errorType: 'EVENT_NOT_FOUND',
          message: 'The event associated with this invitation no longer exists.'
        },
        { status: 404 },
      );
    }

    if (guest.event.isTrashed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Event has been removed',
          errorType: 'EVENT_REMOVED',
          message: 'This event has been removed by the host/organizer and is no longer available. The host may have deleted the event or it may have been removed from the platform.'
        },
        { status: 404 },
      );
    }

    if (guest.event.status === 'CANCELLED') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Event has been cancelled',
          errorType: 'EVENT_CANCELLED',
          message: 'This event has been cancelled by the organizer. Please contact them for more information.'
        },
        { status: 404 },
      );
    }

    if (guest.event.status === 'COMPLETED') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Event has already been completed',
          errorType: 'EVENT_COMPLETED',
          message: 'This event has already taken place and is no longer accepting RSVPs. Thank you for your interest!'
        },
        { status: 404 },
      );
    }

    // Generate S3 URL for event image if it exists
    try {
      if (guest.event.imagePath) {
        guest.event.s3ImageUrl = generateDirectS3Url(guest.event.imagePath);
      }
    } catch (s3Error) {
      console.warn('S3 URL generation failed:', s3Error);
      // Continue without S3 URL
    }

    return NextResponse.json({
      success: true,
      data: guest,
    });
  } catch (error) {
    console.error('Error fetching public guest:', {
      guestId,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch guest information',
        errorType: 'SERVER_ERROR',
        message: 'We encountered an unexpected error while loading your invitation. Please try again or contact support if the problem persists.'
      },
      { status: 500 },
    );
  }
}
