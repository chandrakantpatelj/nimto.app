import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateDirectS3Url } from '@/lib/s3-utils';

const prisma = new PrismaClient();

// GET /api/template - Get all templates (public access)
export async function GET(request) {
  try {
    // Allow public access to read templates
    // No authentication required for browsing templates
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

      // Keep jsonContent as is - no parsing needed
      // The client can parse jsonContent when needed

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
