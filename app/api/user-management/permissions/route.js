import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getClientIP } from '@/lib/api';
import { isUnique } from '@/lib/db';
import { prisma } from '@/lib/prisma';
import { systemLog } from '@/services/system-log';
import { PermissionSchema } from '@/app/(protected)/user-management/permissions/forms/permission-schema';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';

// GET: Fetch all permissions
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') || 1);
  const limit = Number(searchParams.get('limit') || 10);
  const query = searchParams.get('query') || '';
  const sortField = searchParams.get('sort') || 'createdAt';
  const sortDirection = searchParams.get('dir') === 'desc' ? 'desc' : 'asc';
  const roleId = searchParams.get('roleId') || null;
  const skip = (page - 1) * limit;

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized request' },
        { status: 401 }, // Unauthorized
      );
    }

    // Count total records matching the filter
    const total = await prisma.userPermission.count({
      where: {
        AND: [
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
          ...(roleId ? [{ roles: { some: { roleId } } }] : []), // Filter by roleId if provided
        ],
      },
    });

    let isTableEmpty = false;

    if (total === 0) {
      // Check if the entire table is empty
      const overallTotal = await prisma.userPermission.count();
      isTableEmpty = overallTotal === 0;
    }

    // Get paginated records if total > 0
    const permissions =
      total > 0
        ? await prisma.userPermission.findMany({
            skip,
            take: limit,
            where: {
              AND: [
                {
                  name: {
                    contains: query,
                    mode: 'insensitive',
                  },
                },
                ...(roleId ? [{ roles: { some: { roleId } } }] : []), // Filter by roleId if provided
              ],
            },
            orderBy: {
              [sortField]: sortDirection,
            },
            include: {
              roles: true, // Optionally include related roles
            },
          })
        : [];

    return NextResponse.json({
      data: permissions,
      pagination: {
        total,
        page,
      },
      empty: isTableEmpty, // Use the fallback check
    });
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}

// POST: Add a new permission
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized request' },
        { status: 401 }, // Unauthorized
      );
    }

    const clientIp = getClientIP(request);
    const body = await request.json();

    const parsedData = PermissionSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { message: 'Invalid input. Please check your data and try again.' },
        { status: 400 }, // Bad Request
      );
    }

    const { name, slug, description } = parsedData.data;

    // Ensure the permission name and slug are unique
    const isUniquePermission = await isUnique('userPermission', { slug, name });
    if (!isUniquePermission) {
      return NextResponse.json(
        { message: 'Name must be unique' },
        { status: 400 },
      );
    }

    const newPermission = await prisma.userPermission.create({
      data: { name, slug, description },
    });

    // Log the event
    await systemLog({
      event: 'create',
      userId: session.user.id,
      entityId: newPermission.id,
      entityType: 'user.permission',
      description: 'User permission added.',
      ipAddress: clientIp,
    });

    return NextResponse.json(newPermission);
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
