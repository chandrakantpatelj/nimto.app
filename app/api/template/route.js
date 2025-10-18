import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateDirectS3Url } from '@/lib/s3-utils';

const prisma = new PrismaClient();

function getSearchParams(request) {
    const { searchParams } = new URL(request.url);
    const params = {};
    for (const [key, value] of searchParams.entries()) {
        params[key] = value;
    }
    return params;
}

function buildWhereClause(params) {
    const where = { isTrashed: false };

    if (params.category) where.category = params.category;
    if (params.isPremium !== undefined)
        where.isPremium = params.isPremium === 'true';
    if (params.orientation) where.orientation = params.orientation;

    // "New" means created within last 2 weeks
    if (params.new === 'true') {
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        where.createdAt = { gte: twoWeeksAgo };
    }

    if (params.isFeatured !== undefined)
        where.isFeatured = params.isFeatured === 'true';

    if (params.search) {
        const search = params.search.toLowerCase();
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { category: { contains: search, mode: 'insensitive' } },
            { badge: { contains: search, mode: 'insensitive' } },
            { keywords: { has: search } },
            { tags: { has: search } },
            { tags: { hasSome: [search] } },
        ];
    }

    return where;
}

export async function GET(request) {
    try {
        const params = getSearchParams(request);
        const limit = parseInt(params.limit) || 50;
        const offset = parseInt(params.offset) || 0;
        const where = buildWhereClause(params);

        let templates = [];
        let totalCount = 0;

        // Always apply filters, then sort by trending if requested
        // 1. Get all filtered templates
        const allTemplates = await prisma.template.findMany({ where });

        // 2. If trending, get usage counts and sort
        if (params.trending === 'true') {
            // Get usage counts for filtered templates only, only for PUBLISHED events
            const templateIds = allTemplates.map(t => t.id);
            let usageCounts = [];
            if (templateIds.length > 0) {
                usageCounts = await prisma.event.groupBy({
                    by: ['templateId'],
                    where: {
                        templateId: { in: templateIds },
                        status: 'PUBLISHED'
                    },
                    _count: { templateId: true }
                });
            }
            // Map templateId to usage count
            const usageMap = {};
            usageCounts.forEach(e => {
                usageMap[e.templateId] = e._count.templateId;
            });

            // Attach usage count and sort
            const sortedTemplates = allTemplates
                .map(t => ({
                    ...t,
                    usage_count: usageMap[t.id] || 0
                }))
                .sort((a, b) => b.usage_count - a.usage_count || b.createdAt - a.createdAt);

            totalCount = sortedTemplates.length;
            templates = sortedTemplates.slice(offset, offset + limit);
        } else {
            // Not trending: sort by other priorities
            const orderBy = params.search
                ? [
                    { isTrending: 'desc' },
                    { isNew: 'desc' },
                    { popularity: 'desc' },
                    { createdAt: 'desc' },
                ]
                : [
                    { isFeatured: 'desc' },
                    { isPremium: 'desc' },
                    { createdAt: 'desc' },
                    { isPremium: 'asc' },
                ];

            totalCount = allTemplates.length;
            templates = [...allTemplates].sort((a, b) => {
                for (const order of orderBy) {
                    const [key, dir] = Object.entries(order)[0];
                    if (a[key] === b[key]) continue;
                    return dir === 'desc' ? b[key] - a[key] : a[key] - b[key];
                }
                return b.createdAt - a.createdAt;
            }).slice(offset, offset + limit);
        }

        // Generate S3 URLs for templates
        const templatesWithUrls = templates.map((template) => {
            const result = { ...template };
            if (template.imagePath) {
                result.s3ImageUrl = `/api/image-proxy?url=${generateDirectS3Url(template.imagePath)}`;
            }
            if (template.templateThumbnailPath) {
                result.templateThumbnailPath = template.templateThumbnailPath;
                result.templateThumbnailUrl = generateDirectS3Url(template.templateThumbnailPath);
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
            { status: 500 }
        );
    }
}