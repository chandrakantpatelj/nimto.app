import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { checkGuestManagementAccess } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';
import { sendEventInvitation } from '@/services/send-event-invitation';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';

// GET /api/events/guests - Get all guests (with optional filtering)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where = {};

    if (eventId) {
      where.eventId = eventId;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const guests = await prisma.guest.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            location: true,
          },
        },
      },
      orderBy: { invitedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: guests,
    });
  } catch (error) {
    console.error('Error fetching guests:', error);

    // If it's a database connection error or table doesn't exist, return empty array
    if (
      error.code === 'P2021' ||
      error.code === 'P2022' ||
      error.message.includes('relation') ||
      error.message.includes('table')
    ) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch guests' },
      { status: 500 },
    );
  }
}

// POST /api/events/guests - Create a new guest
export async function POST(request) {
  try {
    // Check role-based access
    const accessCheck = await checkGuestManagementAccess('create guests');
    if (accessCheck.error) {
      return accessCheck.error;
    }

    const { session } = accessCheck;

    const body = await request.json();

    const { eventId, name, email, phone, status, response } = body;

    // Validate that the event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 },
      );
    }

    const guest = await prisma.guest.create({
      data: {
        eventId,
        name,
        email,
        phone,
        status: status || 'PENDING',
        response,
        invitedAt: new Date(),
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            location: true,
            description: true,
          },
        },
      },
    });

    // Send email invitation automatically
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const invitationUrl = `${baseUrl}/events/${event.id}/invitation/${guest.id}`;

      await sendEventInvitation({
        guest: {
          name: guest.name,
          email: guest.email,
          phone: guest.phone,
        },
        event: {
          title: guest.event.title,
          description: guest.event.description,
          date: guest.event.date,
          location: guest.event.location,
        },
        invitationUrl,
      });
    } catch (emailError) {
      console.error('Error sending email invitation:', emailError);
    }

    return NextResponse.json({
      success: true,
      data: guest,
    });
  } catch (error) {
    console.error('Error creating guest:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create guest' },
      { status: 500 },
    );
  }
}

// PUT /api/events/guests - Update guest details
export async function PUT(request) {
  try {
    // Check role-based access
    const accessCheck = await checkGuestManagementAccess('update guests');
    if (accessCheck.error) {
      return accessCheck.error;
    }

    const body = await request.json();
    const { guestId, name, email, phone, status, response } = body;

    if (!guestId) {
      return NextResponse.json(
        { success: false, error: 'Guest ID is required' },
        { status: 400 },
      );
    }

    // Check if guest exists
    const existingGuest = await prisma.guest.findUnique({
      where: { id: guestId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!existingGuest) {
      return NextResponse.json(
        { success: false, error: 'Guest not found' },
        { status: 404 },
      );
    }

    // Update guest
    const updatedGuest = await prisma.guest.update({
      where: { id: guestId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(status && { status }),
        ...(response !== undefined && { response }),
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            location: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedGuest,
    });
  } catch (error) {
    console.error('Error updating guest:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update guest' },
      { status: 500 },
    );
  }
}

// DELETE /api/events/guests - Delete guest(s)
export async function DELETE(request) {
  try {
    // Check role-based access
    const accessCheck = await checkGuestManagementAccess('delete guests');
    if (accessCheck.error) {
      return accessCheck.error;
    }

    const { searchParams } = new URL(request.url);
    const guestId = searchParams.get('guestId');
    const guestIds = searchParams.get('guestIds');

    if (!guestId && !guestIds) {
      return NextResponse.json(
        { success: false, error: 'Guest ID(s) are required' },
        { status: 400 },
      );
    }

    let deleteResult;
    let deletedCount = 0;

    if (guestId) {
      const existingGuest = await prisma.guest.findUnique({
        where: { id: guestId },
        select: { id: true, name: true },
      });

      if (!existingGuest) {
        return NextResponse.json(
          { success: false, error: 'Guest not found' },
          { status: 404 },
        );
      }

      deleteResult = await prisma.guest.delete({ where: { id: guestId } });
      deletedCount = 1;
    } else if (guestIds) {
      const idsArray = guestIds.split(',').map((id) => id.trim());
      const existingGuests = await prisma.guest.findMany({
        where: { id: { in: idsArray } },
        select: { id: true, name: true },
      });

      if (existingGuests.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No guests found' },
          { status: 404 },
        );
      }

      deleteResult = await prisma.guest.deleteMany({
        where: { id: { in: idsArray } },
      });
      deletedCount = deleteResult.count;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedCount} guest(s)`,
      deletedCount,
    });
  } catch (error) {
    console.error('Error deleting guest(s):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete guest(s)' },
      { status: 500 },
    );
  }
}
