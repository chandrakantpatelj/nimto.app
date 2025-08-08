import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import authOptions from '../auth/[...nextauth]/auth-options';

// Initialize Prisma client with proper error handling
let prisma;

try {
  prisma = new PrismaClient();
} catch (error) {
  console.error('Failed to initialize Prisma client:', error);
  throw new Error('Database connection failed');
}

// GET /api/template - Get all templates based on user role
export async function GET(request) {
  try {
    // Ensure prisma is properly initialized
    if (!prisma) {
      throw new Error('Prisma client not initialized');
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isPremium = searchParams.get('isPremium');
    const search = searchParams.get('search');
    const visualOnly = searchParams.get('visualOnly') === 'true';

    // Get user session to determine role
    const session = await getServerSession(authOptions);

    let where = {
      isTrashed: false,
    };

    // Role-based template filtering
    if (session?.user?.role?.slug) {
      const userRole = session.user.role.slug;
      switch (userRole) {
        case 'super-admin':
          // Super Admin: Can see ALL templates (system + custom + premium)
          break;
        case 'application-admin':
          // App Admin: Can see system templates and manage non-premium templates
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
          // Attendee: Can only see system templates (public templates)
          where.isSystemTemplate = true;
          break;
      }
    } else {
      // No session - public access: only system templates
      where.isSystemTemplate = true;
    }

    // Additional filters
    if (category) {
      where.category = category;
    }

    if (isPremium !== null) {
      where.isPremium = isPremium === 'true';
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Visual only filter
    if (visualOnly) {
      where.OR = [
        { content: { not: null } },
        { backgroundStyle: { not: null } },
        { previewImageUrl: { not: null } },
        { background: { not: null } }
      ];
    }

    const templates = await prisma.template.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: templates,
      userRole: session?.user?.role?.slug || 'public',
      totalCount: templates.length
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}
