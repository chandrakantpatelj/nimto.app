import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { generateDirectS3Url } from '@/lib/s3-utils';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';

const prisma = new PrismaClient();

// GET /api/template - Get templates based on user role
export async function GET(request) {
  try {
    // Get user session to determine role-based access
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.roleSlug?.toLowerCase();

    // Determine if user should see all templates or only featured
    const isSuperAdmin = userRole === 'super-admin';
    const isApplicationAdmin = userRole === 'application-admin';
    const shouldShowAllTemplates = isSuperAdmin || isApplicationAdmin;

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isPremium = searchParams.get('isPremium');
    const search = searchParams.get('search');
    const orientation = searchParams.get('orientation');
    const trending = searchParams.get('trending');
    const newTemplates = searchParams.get('new');
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;

    const where = {
      isTrashed: false,
      // Only show featured templates for non-admin users
      ...(shouldShowAllTemplates ? {} : { isFeatured: true }),
    };

    // Apply filters
    if (category) where.category = category;
    if (isPremium !== null) where.isPremium = isPremium === 'true';
    if (orientation) where.orientation = orientation;
    if (trending === 'true') where.isTrending = true;
    if (newTemplates === 'true') where.isNew = true;

    let templates = [];
    let totalCount = 0;

    if (search) {
      // Use raw SQL for efficient partial tag matching
      const searchLower = search.toLowerCase();

      // Build SQL query for partial matching in tags using PostgreSQL array functions
      const featuredCondition = shouldShowAllTemplates
        ? ''
        : 'AND "isFeatured" = true';

      const sqlQuery = `
        SELECT * FROM "Template" 
        WHERE "isTrashed" = false 
        ${featuredCondition}
        AND (
          LOWER("name") LIKE $1 
          OR LOWER("category") LIKE $1 
          OR LOWER("badge") LIKE $1 
          OR $2 = ANY("keywords")
          OR $2 = ANY("tags")
          OR EXISTS (
            SELECT 1 FROM unnest("tags") AS tag 
            WHERE LOWER(tag) LIKE $1
          )
        )
        ORDER BY "isTrending" DESC, "isNew" DESC, "popularity" DESC, "createdAt" DESC
        LIMIT $3 OFFSET $4
      `;

      const countQuery = `
        SELECT COUNT(*) FROM "Template" 
        WHERE "isTrashed" = false 
        ${featuredCondition}
        AND (
          LOWER("name") LIKE $1 
          OR LOWER("category") LIKE $1 
          OR LOWER("badge") LIKE $1 
          OR $2 = ANY("keywords")
          OR $2 = ANY("tags")
          OR EXISTS (
            SELECT 1 FROM unnest("tags") AS tag 
            WHERE LOWER(tag) LIKE $1
          )
        )
      `;

      const searchPattern = `%${searchLower}%`;

      // Execute queries in parallel
      const [templatesResult, countResult] = await Promise.all([
        prisma.$queryRawUnsafe(sqlQuery, searchPattern, search, limit, offset),
        prisma.$queryRawUnsafe(countQuery, searchPattern, search),
      ]);

      templates = templatesResult;
      totalCount = parseInt(countResult[0].count);
    } else {
      // Regular query when no search
      [totalCount, templates] = await Promise.all([
        prisma.template.count({ where }),
        prisma.template.findMany({
          where,
          orderBy: [
            { isTrending: 'desc' },
            { isNew: 'desc' },
            { popularity: 'desc' },
            { createdAt: 'desc' },
          ],
          take: limit,
          skip: offset,
        }),
      ]);
    }

    // Generate S3 URLs for templates
    const templatesWithUrls = templates.map((template) => {
      const result = { ...template };

      if (template.imagePath) {
        result.s3ImageUrl = `/api/image-proxy?url=${generateDirectS3Url(template.imagePath)}`;
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
