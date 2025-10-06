import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive') !== 'false';

    const categories = await prisma.templateCategory.findMany({
      where: {
        isActive,
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching template categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch template categories',
      },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    // Check if user is super admin
    const session = await getServerSession(authOptions);
    if (
      !session?.user?.roleName ||
      session.user.roleName.toLowerCase() !== 'super-admin'
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized. Super admin access required.',
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { name, slug, description, thumbnailUrl, color, sortOrder } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name and slug are required',
        },
        { status: 400 },
      );
    }

    // Check if slug already exists
    const existingCategory = await prisma.templateCategory.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: 'Category with this slug already exists',
        },
        { status: 400 },
      );
    }

    // Create category
    const category = await prisma.templateCategory.create({
      data: {
        name,
        slug,
        description,
        thumbnailUrl,
        color,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Error creating template category:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create template category',
      },
      { status: 500 },
    );
  }
}
