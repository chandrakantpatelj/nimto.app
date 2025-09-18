import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { generateDirectS3Url } from '@/lib/s3-utils';
import authOptions from '../../auth/[...nextauth]/auth-options';

// Helper function to check if user has admin role
function hasAdminRole(roleName) {
  return ['super-admin', 'application-admin'].includes(roleName);
}

const prisma = new PrismaClient();

// GET /api/template/[id] - Get a specific template (public access)
export async function GET(request, { params }) {
  try {
    // Allow public access to read individual templates
    // No authentication required for viewing templates
    const { id } = await params;

    const template = await prisma.template.findFirst({
      where: {
        id,
        isTrashed: false,
      },
    });

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 },
      );
    }

    // Generate standardized proxy URL for template image
    let s3ImageUrl = null;
    if (template.imagePath) {
      console.log('Template imagePath:', template.imagePath);
      const directS3Url = generateDirectS3Url(template.imagePath);
      // Use image proxy to avoid CORS and permission issues
      s3ImageUrl = `/api/image-proxy?url=${directS3Url}`;
      console.log('Generated s3ImageUrl:', s3ImageUrl);
    }

    // Return template with jsonContent
    const parsedTemplate = {
      ...template,
      s3ImageUrl,
    };

    return NextResponse.json({
      success: true,
      data: parsedTemplate,
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch template' },
      { status: 500 },
    );
  }
}

// PUT /api/template/[id] - Update a template
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.roleName || !hasAdminRole(session.user.roleName)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      category,
      jsonContent,
      isPremium,
      price,
      isSystemTemplate,
      imagePath,
    } = body;

    // Check if template exists
    const existingTemplate = await prisma.template.findFirst({
      where: {
        id,
        isTrashed: false,
      },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 },
      );
    }

    const updatedTemplate = await prisma.template.update({
      where: { id },
      data: {
        name: name || existingTemplate.name,
        category: category || existingTemplate.category,
        jsonContent: jsonContent || existingTemplate.jsonContent,
        isPremium:
          isPremium !== undefined ? isPremium : existingTemplate.isPremium,
        price: price !== undefined ? price : existingTemplate.price,
        isSystemTemplate:
          isSystemTemplate !== undefined
            ? isSystemTemplate
            : existingTemplate.isSystemTemplate,
        imagePath:
          imagePath !== undefined ? imagePath : existingTemplate.imagePath,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedTemplate,
    });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update template' },
      { status: 500 },
    );
  }
}

// DELETE /api/template/[id] - Soft delete a template
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const { id } = await params;

    // Check if template exists
    const existingTemplate = await prisma.template.findFirst({
      where: {
        id,
        isTrashed: false,
      },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 },
      );
    }

    // Soft delete by setting isTrashed to true
    await prisma.template.update({
      where: { id },
      data: { isTrashed: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete template' },
      { status: 500 },
    );
  }
}
