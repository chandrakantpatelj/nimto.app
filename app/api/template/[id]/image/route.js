import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateS3Url } from '@/lib/s3-utils';

const prisma = new PrismaClient();

// GET /api/template/[id]/image - Get template image
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const template = await prisma.template.findFirst({
      where: {
        id,
        isTrashed: false,
      },
      select: {
        id: true,
        name: true,
        imagePath: true,
      },
    });

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    if (!template.imagePath) {
      return NextResponse.json(
        { success: false, error: 'Template has no image' },
        { status: 404 }
      );
    }

    // Generate the full S3 URL
    const imageUrl = generateS3Url(template.imagePath);

    return NextResponse.json({
      success: true,
      data: {
        id: template.id,
        name: template.name,
        imagePath: template.imagePath,
        imageUrl: imageUrl,
      },
    });
  } catch (error) {
    console.error('Error fetching template image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch template image' },
      { status: 500 }
    );
  }
}
