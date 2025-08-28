import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { generateS3Url } from '@/lib/s3-utils';
import authOptions from '../../auth/[...nextauth]/auth-options';

const prisma = new PrismaClient();

// GET /api/template/[id] - Get a specific template
export async function GET(request, { params }) {
  try {
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

    // Generate S3 URL for template image
    let s3ImageUrl = null;
    if (template.imagePath) {
      const directS3Url = generateS3Url(template.imagePath);
      // Use proxy URL to avoid CORS issues and access private S3 bucket
      s3ImageUrl = `/api/image-proxy?url=${directS3Url}`;
    }

    // Parse JSON content back to object
    const parsedTemplate = {
      ...template,
      s3ImageUrl,
      content: template.jsonContent ? JSON.parse(template.jsonContent) : null,
      backgroundStyle: template.backgroundStyle
        ? JSON.parse(template.backgroundStyle)
        : null,
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

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const { id } = params;
    const body = await request.json();
    const {
      name,
      category,
      content,
      backgroundStyle,
      htmlContent,
      background,
      pageBackground,
      previewImageUrl,
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

    // Convert content array to JSON string
    const jsonContent = content
      ? JSON.stringify(content)
      : existingTemplate.jsonContent;
    const backgroundStyleJson = backgroundStyle
      ? JSON.stringify(backgroundStyle)
      : existingTemplate.backgroundStyle;

    const updatedTemplate = await prisma.template.update({
      where: { id },
      data: {
        name: name || existingTemplate.name,
        category: category || existingTemplate.category,
        jsonContent,
        backgroundStyle: backgroundStyleJson,
        htmlContent:
          htmlContent !== undefined
            ? htmlContent
            : existingTemplate.htmlContent,
        background:
          background !== undefined ? background : existingTemplate.background,
        pageBackground:
          pageBackground !== undefined
            ? pageBackground
            : existingTemplate.pageBackground,
        previewImageUrl:
          previewImageUrl !== undefined
            ? previewImageUrl
            : existingTemplate.previewImageUrl,
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

    const { id } = params;

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
