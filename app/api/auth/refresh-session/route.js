import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import authOptions from '../[...nextauth]/auth-options';

export async function POST(request) {
  try {
    const { force = false } = await request.json().catch(() => ({}));
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not authenticated',
          shouldRedirect: true,
          redirectTo: '/signin',
        },
        { status: 401 },
      );
    }

    // Performance optimization: Check cache first unless force refresh
    const now = Date.now();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    const lastFetch = session.user.lastFetch || 0;

    if (!force && lastFetch && now - lastFetch < CACHE_DURATION) {
      // Return cached data - no database query needed
      return NextResponse.json({
        success: true,
        message: 'Session data from cache',
        fromCache: true,
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          avatar: session.user.avatar,
          status: session.user.status,
          roleId: session.user.roleId,
          roleSlug: session.user.roleSlug,
          roleName: session.user.roleName,
        },
      });
    }

    // Fetch fresh data from database
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
        isTrashed: false,
        status: 'ACTIVE',
      },
      include: {
        role: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      console.log(
        `User ${session.user.id} not found or inactive during session refresh`,
      );
      return NextResponse.json(
        {
          success: false,
          error: 'User not found or inactive',
          shouldRedirect: true,
          redirectTo: '/signin',
        },
        { status: 404 },
      );
    }

    // Return fresh user data with cache timestamp
    return NextResponse.json({
      success: true,
      message: force
        ? 'Session force refreshed successfully'
        : 'Session refreshed successfully',
      fromCache: false,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        status: user.status,
        roleId: user.roleId,
        roleSlug: user.role?.slug,
        roleName: user.role?.name,
        lastFetch: now,
      },
    });
  } catch (error) {
    console.error('Error refreshing session:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to refresh session',
        shouldRedirect: true,
        redirectTo: '/signin',
      },
      { status: 500 },
    );
  }
}
