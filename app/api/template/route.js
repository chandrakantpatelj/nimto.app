import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { generateDirectS3Url } from '@/lib/s3-utils';
import authOptions from '../auth/[...nextauth]/auth-options';

const prisma = new PrismaClient();

// Helper function to check if user has admin role
function hasAdminRole(userRole) {
  return (
    userRole === 'super-admin' ||
    userRole === 'host' ||
    userRole === 'application-admin'
  );
}

// GET /api/template - Get all templates
export async function GET(request) {
  try {
    // Check authentication and role
    const session = await getServerSession(authOptions);
    if (!session?.user?.roleName || !hasAdminRole(session.user.roleName)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized - Admin or Host access required',
        },
        { status: 403 },
      );
    }
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isPremium = searchParams.get('isPremium');
    const search = searchParams.get('search');
    const orientation = searchParams.get('orientation');
    const trending = searchParams.get('trending');
    const featured = searchParams.get('featured');
    const newTemplates = searchParams.get('new');
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;

    const where = {
      isTrashed: false,
    };

    if (category) {
      where.category = category;
    }

    if (isPremium !== null) {
      where.isPremium = isPremium === 'true';
    }

    if (orientation) {
      where.orientation = orientation;
    }

    if (trending === 'true') {
      where.isTrending = true;
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    if (newTemplates === 'true') {
      where.isNew = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { keywords: { has: search } },
      ];
    }

    const templates = await prisma.template.findMany({
      where,
      orderBy: [
        { isFeatured: 'desc' },
        { isTrending: 'desc' },
        { isNew: 'desc' },
        { popularity: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      skip: offset,
    });

    // Generate S3 URLs for templates with imagePath and templateThumbnailPath
    const templatesWithUrls = templates.map((template) => {
      const result = { ...template };

      if (template.imagePath) {
        // Use image proxy to avoid CORS and permission issues
        const s3ImageUrl = `/api/image-proxy?url=${generateDirectS3Url(template.imagePath)}`;
        result.s3ImageUrl = s3ImageUrl;
      }

      if (template.templateThumbnailPath) {
        // Generate thumbnail URL
        const thumbnailUrl = generateDirectS3Url(
          template.templateThumbnailPath,
        );
        result.templateThumbnailPath = template.templateThumbnailPath;
        result.templateThumbnailUrl = thumbnailUrl;
      }

      return result;
    });

    return NextResponse.json({
      success: true,
      data: templatesWithUrls,
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 },
    );
  }
}
