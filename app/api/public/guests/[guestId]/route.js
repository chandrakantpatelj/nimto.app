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
        { success: false, error: 'Guest record not found' },
        { status: 404 },
      );
    }

    // Check if event is valid and not trashed
    if (!guest.event || guest.event.isTrashed || guest.event.status === 'CANCELLED') {
      return NextResponse.json(
        { success: false, error: 'Event is no longer available' },
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
    console.error('Error fetching public guest:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch guest information' },
      { status: 500 },
    );
  }
}
