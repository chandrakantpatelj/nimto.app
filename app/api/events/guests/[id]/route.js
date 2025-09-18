import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { checkGuestManagementAccess } from '@/lib/auth-utils';

const prisma = new PrismaClient();

// GET /api/events/guests/[id] - Get a specific guest
export async function GET(request, { params }) {
  try {
    // Check role-based access
    const accessCheck = await checkGuestManagementAccess('view guests');
    if (accessCheck.error) {
      return accessCheck.error;
    }

    const { id } = params;

    const guest = await prisma.guest.findUnique({
      where: { id },
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
    });

    if (!guest) {
      return NextResponse.json(
        { success: false, error: 'Guest not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: guest,
    });
  } catch (error) {
    console.error('Error fetching guest:', error);

    // If it's a database connection error or table doesn't exist, return 404
    if (
      error.code === 'P2021' ||
      error.code === 'P2022' ||
      error.message.includes('relation') ||
      error.message.includes('table')
    ) {
      return NextResponse.json(
        { success: false, error: 'Guest not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch guest' },
      { status: 500 },
    );
  }
}

// PUT /api/events/guests/[id] - Update a guest
export async function PUT(request, { params }) {
  try {
    // Check role-based access
    const accessCheck = await checkGuestManagementAccess('update guests');
    if (accessCheck.error) {
      return accessCheck.error;
    }

    const { id } = params;
    const body = await request.json();

    const { name, email, phone, status, response } = body;

    // Convert response to proper enum value
    let guestResponse = null;
    if (response) {
      const normalizedResponse = response.toString().toLowerCase();
      if (normalizedResponse === 'yes') {
        guestResponse = 'YES';
      } else if (normalizedResponse === 'no') {
        guestResponse = 'NO';
      } else if (normalizedResponse === 'maybe') {
        guestResponse = 'MAYBE';
      } else {
        guestResponse = response; // Keep original if it's already uppercase
      }
    }

    const guest = await prisma.guest.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        status,
        response: guestResponse,
        respondedAt: guestResponse ? new Date() : undefined,
      },
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
    });

    return NextResponse.json({
      success: true,
      data: guest,
    });
  } catch (error) {
    console.error('Error updating guest:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update guest' },
      { status: 500 },
    );
  }
}

// DELETE /api/events/guests/[id] - Delete a guest (hard delete)
export async function DELETE(request, { params }) {
  try {
    // Check role-based access
    const accessCheck = await checkGuestManagementAccess('delete guests');
    if (accessCheck.error) {
      return accessCheck.error;
    }

    const { id } = params;

    const guest = await prisma.guest.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      data: guest,
      message: 'Guest deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting guest:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete guest' },
      { status: 500 },
    );
  }
}
