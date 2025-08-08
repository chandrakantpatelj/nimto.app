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

// GET /api/template/[id] - Get a specific template
export async function GET(request, { params }) {
  try {
    // Ensure prisma is properly initialized
    if (!prisma) {
      throw new Error('Prisma client not initialized');
    }
    
    // Await params in Next.js 15
    const resolvedParams = await params;
    console.log("params", resolvedParams);
    const { id } = resolvedParams;
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role?.slug;

    let where = {
      id,
      isTrashed: false,
    };

    // Role-based access control for viewing templates
    if (userRole) {
      switch (userRole) {
        case 'super-admin':
          // Super Admin: Can see ALL templates
          break;
          
        case 'application-admin':
          // App Admin: Can see system templates and non-premium templates
          where.OR = [
            { isSystemTemplate: true },
            { isPremium: false }
          ];
          break;
          
        case 'host':
          // Host: Can see system templates and their own custom templates
          where.OR = [
            { isSystemTemplate: true },
            { 
              AND: [
                { isSystemTemplate: false },
                { createdByUserId: session.user.id }
              ]
            }
          ];
          break;
          
        case 'attendee':
        default:
          // Attendee: Can only see system templates
          where.isSystemTemplate = true;
          break;
      }
    } else {
      // No session - public access: only system templates
      where.isSystemTemplate = true;
    }

    const template = await prisma.template.findFirst({ where });

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found or access denied' },
        { status: 404 }
      );
    }

    // Parse JSON content back to object
    const parsedTemplate = {
      ...template,
      content: template.jsonContent ? JSON.parse(template.jsonContent) : null,
      backgroundStyle: template.backgroundStyle ? JSON.parse(template.backgroundStyle) : null,
    };

    return NextResponse.json({
      success: true,
      data: parsedTemplate,
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

// PUT /api/template/[id] - Update a template
export async function PUT(request, { params }) {
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

    // Await params in Next.js 15
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const userRole = session.user.role?.slug;
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

    // Check if template exists and user has access
    let existingTemplate;
    
    if (userRole === 'super-admin') {
      // Super admin can access any template
      existingTemplate = await prisma.template.findFirst({
        where: { id, isTrashed: false }
      });
    } else if (userRole === 'application-admin') {
      // App admin can access system templates and non-premium templates
      existingTemplate = await prisma.template.findFirst({
        where: {
          id,
          isTrashed: false,
          OR: [
            { isSystemTemplate: true },
            { isPremium: false }
          ]
        }
      });
    } else if (userRole === 'host') {
      // Host can only access their own templates and system templates
      existingTemplate = await prisma.template.findFirst({
        where: {
          id,
          isTrashed: false,
          OR: [
            { isSystemTemplate: true },
            { 
              AND: [
                { isSystemTemplate: false },
                { createdByUserId: session.user.id }
              ]
            }
          ]
        }
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to update templates' },
        { status: 403 }
      );
    }

    if (!existingTemplate) {
      return NextResponse.json(
        { success: false, error: 'Template not found or access denied' },
        { status: 404 }
      );
    }

    // Role-based restrictions for template properties
    if (userRole === 'host') {
      // Hosts cannot make templates system or premium
      if (isSystemTemplate) {
        return NextResponse.json(
          { success: false, error: 'Hosts cannot make templates system templates' },
          { status: 403 }
        );
      }
      if (isPremium) {
        return NextResponse.json(
          { success: false, error: 'Hosts cannot make templates premium' },
          { status: 403 }
        );
      }
    } else if (userRole === 'application-admin') {
      // App admins cannot make templates premium
      if (isPremium) {
        return NextResponse.json(
          { success: false, error: 'Application admins cannot make templates premium' },
          { status: 403 }
        );
      }
    }

    // Convert content array to JSON string
    const jsonContent = content ? JSON.stringify(content) : existingTemplate.jsonContent;
    const backgroundStyleJson = backgroundStyle ? JSON.stringify(backgroundStyle) : existingTemplate.backgroundStyle;

    const updatedTemplate = await prisma.template.update({
      where: { id },
      data: {
        name: name || existingTemplate.name,
        category: category || existingTemplate.category,
        jsonContent,
        backgroundStyle: backgroundStyleJson,
        htmlContent: htmlContent !== undefined ? htmlContent : existingTemplate.htmlContent,
        background: background !== undefined ? background : existingTemplate.background,
        pageBackground: pageBackground !== undefined ? pageBackground : existingTemplate.pageBackground,
        previewImageUrl: previewImageUrl !== undefined ? previewImageUrl : existingTemplate.previewImageUrl,
        isPremium: isPremium !== undefined ? isPremium : existingTemplate.isPremium,
        price: price !== undefined ? price : existingTemplate.price,
        isSystemTemplate: isSystemTemplate !== undefined ? isSystemTemplate : existingTemplate.isSystemTemplate,
        imagePath: imagePath !== undefined ? imagePath : existingTemplate.imagePath,
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
      { status: 500 }
    );
  }
}

// DELETE /api/template/[id] - Soft delete a template
export async function DELETE(request, { params }) {
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

    // Await params in Next.js 15
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const userRole = session.user.role?.slug;

    // Check if template exists and user has access to delete
    let existingTemplate;
    
    if (userRole === 'super-admin') {
      // Super admin can delete any template
      existingTemplate = await prisma.template.findFirst({
        where: { id, isTrashed: false }
      });
    } else if (userRole === 'application-admin') {
      // App admin can delete system templates and non-premium templates
      existingTemplate = await prisma.template.findFirst({
        where: {
          id,
          isTrashed: false,
          OR: [
            { isSystemTemplate: true },
            { isPremium: false }
          ]
        }
      });
    } else if (userRole === 'host') {
      // Host can only delete their own templates (not system templates)
      existingTemplate = await prisma.template.findFirst({
        where: {
          id,
          isTrashed: false,
          AND: [
            { isSystemTemplate: false },
            { createdByUserId: session.user.id }
          ]
        }
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to delete templates' },
        { status: 403 }
      );
    }

    if (!existingTemplate) {
      return NextResponse.json(
        { success: false, error: 'Template not found or access denied' },
        { status: 404 }
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
      { status: 500 }
    );
  }
}
