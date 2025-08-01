import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getClientIP } from '@/lib/api';
import { isUnique } from '@/lib/db';
import { prisma } from '@/lib/prisma';
import { systemLog } from '@/services/system-log';
import { RoleSchema } from '@/app/(protected)/user-management/roles/forms/role-schema';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';

// GET: Fetch all roles with permissions
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') || 1);
  const limit = Number(searchParams.get('limit') || 10);
  const query = searchParams.get('query') || '';
  const sortField = searchParams.get('sort') || 'createdAt';
  const sortDirection = searchParams.get('dir') === 'desc' ? 'desc' : 'asc';
  const skip = (page - 1) * limit;

  try {
    // Validate user session
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized request' },
        { status: 401 }, // Unauthorized
      );
    }

    // Count total records matching the filter
    const total = await prisma.userRole.count({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
    });

    let isTableEmpty = false;

    if (total === 0) {
      // Check if the entire table is empty
      const overallTotal = await prisma.userRole.count();
      isTableEmpty = overallTotal === 0;
    }

    // Get paginated roles with their permissions
    const roles =
      total > 0
        ? await prisma.userRole.findMany({
            skip,
            take: limit,
            where: {
              name: {
                contains: query,
                mode: 'insensitive',
              },
            },
            orderBy: {
              [sortField]: sortDirection,
            },
            include: {
              permissions: {
                select: {
                  permission: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                    },
                  },
                },
              },
            },
          })
        : [];

    // Map permissions into a more straightforward structure
    const formattedRoles = roles.map((role) => ({
      ...role,
      permissions: role.permissions?.map((rp) => rp.permission),
    }));

    return NextResponse.json({
      data: formattedRoles,
      pagination: {
        total,
        page,
      },
      empty: isTableEmpty,
    });
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}

// POST: Add a new role
export async function POST(request) {
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
    const body = await request.json();

    const parsedData = RoleSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { message: 'Invalid input. Please check your data and try again.' },
        { status: 400 }, // Bad Request
      );
    }

    const { name, slug, description, permissions } = parsedData.data;

    // Check for uniqueness
    const isUniqueRole = await isUnique('userRole', { slug, name });
    if (!isUniqueRole) {
      return NextResponse.json(
        { message: 'Name and slug must be unique' },
        { status: 400 },
      );
    }

    // Use a Prisma transaction to ensure all operations succeed or fail together
    const createdRole = await prisma.$transaction(async (tx) => {
      // Create the new role
      const newRole = await tx.userRole.create({
        data: {
          name,
          slug,
          description,
        },
      });

      // Add permissions to UserRolePermission table
      if (permissions && permissions.length > 0) {
        const rolePermissionEntries = permissions.map((permissionId) => ({
          roleId: newRole.id,
          permissionId,
        }));

        await tx.userRolePermission.createMany({
          data: rolePermissionEntries,
        });
      }

      // Log the event
      await systemLog(
        {
          event: 'create',
          userId: session.user.id,
          entityId: newRole.id,
          entityType: 'user.role',
          description: 'User role added.',
          ipAddress: clientIp,
        },
        tx,
      );

      // Fetch the newly created role with its permissions
      return await tx.userRole.findUnique({
        where: { id: newRole.id },
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      });
    });

    return NextResponse.json(createdRole, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
