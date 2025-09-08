import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { checkGuestManagementAccess } from '@/lib/auth-utils';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';

const prisma = new PrismaClient();

// GET /api/events/guests - Get all guests (with optional filtering)
export async function GET(request) {
  try {
    // Check role-based access
    const accessCheck = await checkGuestManagementAccess('view guests');
    if (accessCheck.error) {
      return accessCheck.error;
    }

    const { session } = accessCheck;

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
          },
        },
      },
    });

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
