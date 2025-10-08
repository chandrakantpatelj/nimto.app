import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import authOptions from '../../auth/[...nextauth]/auth-options';

// Helper function to check if user has admin role
function hasAdminRole(userRole) {
  return userRole === 'super-admin' || userRole === 'application-admin';
}

const prisma = new PrismaClient();

// POST /api/template/create-template - Create a new template
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.roleSlug || !hasAdminRole(session.user.roleSlug)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 },
      );
    }

    const body = await request.json();
    const {
      name,
      category,
      jsonContent,
      isPremium = false,
      price = 0,
      isSystemTemplate = false,
      imagePath,
    } = body;

    // Validate required fields
    if (!name || !category) {
      return NextResponse.json(
        { success: false, error: 'Name and category are required' },
        { status: 400 },
      );
    }

    const template = await prisma.template.create({
      data: {
        name,
        category,
        jsonContent,
        isPremium,
        price,
        isSystemTemplate,
        imagePath,
        createdByUserId: session.user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: template,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create template' },
      { status: 500 },
    );
  }
}
