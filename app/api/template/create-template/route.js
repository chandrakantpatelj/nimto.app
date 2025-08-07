import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import authOptions from '../../auth/[...nextauth]/auth-options';

const prisma = new PrismaClient();

// POST /api/template/create-template - Create a new template
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

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
      isPremium = false,
      price = 0,
      isSystemTemplate = false,
      imagePath,
    } = body;

    // Validate required fields
    if (!name || !category) {
      return NextResponse.json(
        { success: false, error: 'Name and category are required' },
        { status: 400 }
      );
    }

    // Convert content array to JSON string
    const jsonContent = content ? JSON.stringify(content) : null;
    const backgroundStyleJson = backgroundStyle ? JSON.stringify(backgroundStyle) : null;

    const template = await prisma.template.create({
      data: {
        name,
        category,
        jsonContent,
        backgroundStyle: backgroundStyleJson,
        htmlContent,
        background,
        pageBackground,
        previewImageUrl,
        isPremium,
        price,
        isSystemTemplate,
        imagePath,
        createdByUserId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: template,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
