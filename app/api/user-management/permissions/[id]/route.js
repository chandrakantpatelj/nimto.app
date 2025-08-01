import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getClientIP } from '@/lib/api';
import { isUnique } from '@/lib/db';
import { prisma } from '@/lib/prisma';
import { systemLog } from '@/services/system-log';
import { PermissionSchema } from '@/app/(protected)/user-management/permissions/forms/permission-schema';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';

// GET: Fetch a specific permission by ID
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized request' },
        { status: 401 }, // Unauthorized
      );
    }

    const { id } = await params;

    const permission = await prisma.userPermission.findUnique({
      where: { id },
    });

    if (!permission) {
      return NextResponse.json(
        { message: 'Record not found. Someone might have deleted it already.' },
        { status: 404 },
      );
    }

    return NextResponse.json(permission);
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
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized request' },
        { status: 401 }, // Unauthorized
      );
    }

    const { id } = await params;
    const clientIp = getClientIP(request);

    // Ensure the ID is provided
    if (!id) {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });
    }

    // Check if record exists
    const existingPermission = await prisma.userPermission.findUnique({
      where: { id },
    });
    if (!existingPermission) {
      return NextResponse.json(
        { message: 'Record not found. Someone might have deleted it already.' },
        { status: 404 },
      );
    }

    const body = await request.json();
    const parsedData = PermissionSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });
    }

    const { name, description } = parsedData.data;

    // Check uniqueness for name only (slug is not updatable)
    const isUniquePermission = await isUnique(
      'userPermission',
      { name },
      { id },
    );
    if (!isUniquePermission) {
      return NextResponse.json(
        { message: 'Name and slug must be unique.' },
        { status: 400 },
      );
    }

    // Update the permission (excluding slug)
    const updatedPermission = await prisma.userPermission.update({
      where: { id },
      data: { name, description },
    });

    // Log the event
    await systemLog({
      event: 'update',
      userId: session.user.id,
      entityId: id,
      entityType: 'user.permission',
      description: 'User permission updated.',
      ipAddress: clientIp,
    });

    return NextResponse.json(updatedPermission);
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}

// DELETE: Remove a specific permission by ID
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized request' },
        { status: 401 }, // Unauthorized
      );
    }

    const { id } = await params;
    const clientIp = getClientIP(request);

    if (!id) {
      return NextResponse.json(
        { message: 'Invalid input. Please check your data and try again.' },
        { status: 400 },
      );
    }

    // Check if the permission exists
    const existingPermission = await prisma.userPermission.findUnique({
      where: { id },
    });
    if (!existingPermission) {
      return NextResponse.json(
        { message: 'Requested data not found.' },
        { status: 404 },
      );
    }

    // Perform deletion in a transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Delete linked role permissions
      await tx.userRolePermission.deleteMany({
        where: { permissionId: id },
      });

      // Delete the permission itself
      await tx.userPermission.delete({
        where: { id },
      });

      // Log the event
      await systemLog(
        {
          event: 'delete',
          userId: session.user.id,
          entityId: id,
          entityType: 'user.permission',
          description: 'User permission deleted.',
          ipAddress: clientIp,
        },
        tx,
      );
    });

    return NextResponse.json({ message: 'Permission deleted successfully.' });
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
