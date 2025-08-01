import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getClientIP } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { systemLog } from '@/services/system-log';
import { UserProfileSchema } from '@/app/(protected)/user-management/users/[id]/forms/user-profile-schema';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { UserStatus } from '@/app/models/user';

// GET: Fetch a specific user by ID, including role
export async function GET(request, { params }) {
  try {
    // Validate user session
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized request' },
        { status: 401 }, // Unauthorized
      );
    }

    const { id } = await params;

    // Fetch the user and their associated roles
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Record not found. Someone might have deleted it already.' },
        { status: 404 },
      );
    }

    return NextResponse.json(user);
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}

// PUT: Edit a specific permission by ID
export async function PUT(request, { params }) {
  try {
    // Validate user session
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized request' },
        { status: 401 }, // Unauthorized
      );
    }

    const { id } = await params;

    // Ensure the user ID is provided
    if (!id) {
      return NextResponse.json(
        { message: 'Invalid input.' },
        { status: 400 }, // Bad request
      );
    }

    const clientIp = getClientIP(request);
    const body = await request.json();

    const parsedData = UserProfileSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { message: 'Invalid input.' },
        { status: 400 }, // Bad Request
      );
    }

    const { name, status, roleId } = parsedData.data;

    // Check if the role exists
    const roleExists = await prisma.userRole.findUnique({
      where: { id: roleId },
    });
    if (!roleExists) {
      return NextResponse.json(
        { message: 'Role does not exist' },
        { status: 400 },
      );
    }

    // Use a transaction to insert multiple records atomically
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data: { name, status: status, roleId },
      });

      // Log the event
      await systemLog(
        {
          event: 'update',
          userId: session.user.id,
          entityId: user.id,
          entityType: 'user.profile',
          description: 'User profile updated.',
          ipAddress: clientIp,
        },
        tx,
      );

      return user;
    });

    return NextResponse.json(
      { message: 'User profile successfully updated.' },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    // Validate user session
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized request' },
        { status: 401 }, // Unauthorized
      );
    }

    const clientIp = getClientIP(request);
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Invalid input.' },
        { status: 400 }, // Bad request
      );
    }

    // Check if the role exists
    const userToDelete = await prisma.user.findUnique({ where: { id } });
    if (userToDelete && userToDelete.isProtected) {
      return NextResponse.json(
        { message: 'You do not have permission to delete system users.' },
        { status: 401 },
      );
    }

    // Use a transaction to insert multiple records atomically
    await prisma.$transaction(async (tx) => {
      const user = await prisma.user.update({
        where: { id, isProtected: false },
        data: { isTrashed: true, status: UserStatus.INACTIVE },
      });

      // Log the event
      await systemLog(
        {
          event: 'trash',
          userId: session.user.id,
          entityId: user.id,
          entityType: 'user',
          description: 'User trashed.',
          ipAddress: clientIp,
        },
        tx,
      );

      return user;
    });

    return NextResponse.json(
      { message: 'User successfully deleted.' },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
