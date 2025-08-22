import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateS3Url } from '@/lib/s3-utils';

const prisma = new PrismaClient();

// GET /api/template - Get all templates
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isPremium = searchParams.get('isPremium');
    const search = searchParams.get('search');

    const where = {
      isTrashed: false,
    };

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

    const templates = await prisma.template.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Generate S3 URLs for templates with imagePath
    const templatesWithUrls = templates.map(template => {
      if (template.imagePath) {
        // Generate S3 URL (already encoded by generateS3Url)
        const s3ImageUrl = generateS3Url(template.imagePath);
        // Use proxy URL to avoid CORS issues - don't double encode
        const proxyImageUrl = `/api/test-image?url=${s3ImageUrl}`;
        
        return {
          ...template,
          s3ImageUrl: proxyImageUrl,
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
      { status: 500 }
    );
  }
}
