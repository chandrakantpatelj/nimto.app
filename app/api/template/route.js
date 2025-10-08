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
    
    console.log('🔍 API: Received pagination params:', { limit, offset });

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
      // Split search query into individual words for better matching
      const searchWords = search.split(' ').map(word => word.trim()).filter(word => word.length > 0);
      
      where.OR = [
        // Exact phrase search
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { badge: { contains: search, mode: 'insensitive' } },
        // Individual word search for better results
        ...searchWords.map(word => ({ name: { contains: word, mode: 'insensitive' } })),
        ...searchWords.map(word => ({ category: { contains: word, mode: 'insensitive' } })),
        ...searchWords.map(word => ({ badge: { contains: word, mode: 'insensitive' } })),
        // Keywords array search - check if any keyword contains the search term
        { keywords: { hasSome: searchWords } },
        // Also check if any keyword contains the full search phrase
        { keywords: { has: search } },
      ];
    }

    // Get total count for pagination
    const totalCount = await prisma.template.count({ where });

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
      pagination: {
        total: totalCount,
        limit,
        offset,
        pageCount: Math.ceil(totalCount / limit),
        currentPage: Math.floor(offset / limit) + 1,
      },
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 },
    );
  }
}
