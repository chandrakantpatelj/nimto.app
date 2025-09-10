import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateDirectS3Url } from '@/lib/s3-utils';

const prisma = new PrismaClient();

// GET /api/template - Get all templates
export async function GET(request) {
  try {
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

    // Generate S3 URLs for templates with imagePath
    const templatesWithUrls = templates.map((template) => {
      if (template.imagePath) {
        // Generate standardized proxy URL
        const s3ImageUrl = generateDirectS3Url(template.imagePath);

        return {
          ...template,
          s3ImageUrl: s3ImageUrl,
        };
      }
      return template;
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
