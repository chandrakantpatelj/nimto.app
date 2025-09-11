import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const category = await prisma.templateCategory.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: 'Category not found',
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Error fetching template category:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch template category',
      },
      { status: 500 },
    );
  }
}

export async function PUT(request, { params }) {
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

    const { id } = params;
    const body = await request.json();
    const {
      name,
      slug,
      description,
      thumbnailUrl,
      color,
      sortOrder,
      isActive,
    } = body;

    // Check if category exists
    const existingCategory = await prisma.templateCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: 'Category not found',
        },
        { status: 404 },
      );
    }

    // Check if slug already exists (excluding current category)
    if (slug && slug !== existingCategory.slug) {
      const slugExists = await prisma.templateCategory.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json(
          {
            success: false,
            error: 'Category with this slug already exists',
          },
          { status: 400 },
        );
      }
    }

    // Update category
    const updatedCategory = await prisma.templateCategory.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
        ...(color !== undefined && { color }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedCategory,
    });
  } catch (error) {
    console.error('Error updating template category:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update template category',
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
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

    const { id } = params;

    // Check if category exists
    const existingCategory = await prisma.templateCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: 'Category not found',
        },
        { status: 404 },
      );
    }

    // Check if category is being used by templates
    const templatesUsingCategory = await prisma.template.count({
      where: {
        category: existingCategory.slug,
        isTrashed: false,
      },
    });

    if (templatesUsingCategory > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete category that is being used by templates',
        },
        { status: 400 },
      );
    }

    // Delete category
    await prisma.templateCategory.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting template category:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete template category',
      },
      { status: 500 },
    );
  }
}
