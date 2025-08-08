import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import authOptions from '../../auth/[...nextauth]/auth-options';

// Initialize Prisma client with proper error handling
let prisma;

try {
  prisma = new PrismaClient();
} catch (error) {
  console.error('Failed to initialize Prisma client:', error);
  throw new Error('Database connection failed');
}

// POST /api/template/create-template - Create a new template
export async function POST(request) {
  try {
    // Ensure prisma is properly initialized
    if (!prisma) {
      throw new Error('Prisma client not initialized');
    }

    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Role-based permission check for template creation
    const userRole = session.user.role?.slug;
    const allowedRoles = ['super-admin', 'application-admin', 'host'];
    
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to create templates' },
        { status: 403 }
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

    // Role-based restrictions for template properties
    if (userRole === 'host') {
      // Hosts can only create non-system, non-premium templates
      if (isSystemTemplate) {
        return NextResponse.json(
          { success: false, error: 'Hosts cannot create system templates' },
          { status: 403 }
        );
      }
      if (isPremium) {
        return NextResponse.json(
          { success: false, error: 'Hosts cannot create premium templates' },
          { status: 403 }
        );
      }
    } else if (userRole === 'application-admin') {
      // App admins can create system templates but not premium ones
      if (isPremium) {
        return NextResponse.json(
          { success: false, error: 'Application admins cannot create premium templates' },
          { status: 403 }
        );
      }
    }
    // Super admins have no restrictions

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
