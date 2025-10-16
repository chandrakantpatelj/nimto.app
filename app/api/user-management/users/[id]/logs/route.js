import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';

// GET: Fetch user activity logs
export async function GET(request, { params }) {
  try {
    // Validate user session
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized request' },
        { status: 401 },
      );
    }

    const { id } = await params;

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Fetch system logs for this user
    const systemLogs = await prisma.systemLog.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to last 50 logs
    });

    // Transform system logs to activity logs format
    const activityLogs = systemLogs.map((log) => ({
      id: log.id,
      action: getActionFromEvent(log.event),
      description: log.description || getDefaultDescription(log.event),
      timestamp: log.createdAt,
      type: getTypeFromEvent(log.event),
      event: log.event,
      entityType: log.entityType,
      ipAddress: log.ipAddress,
    }));

    // Add user creation log if user exists
    if (user.createdAt) {
      activityLogs.unshift({
        id: 'user-created',
        action: 'User created',
        description: 'User account was created',
        timestamp: user.createdAt,
        type: 'create',
        event: 'create',
        entityType: 'user',
        ipAddress: null,
      });
    }

    // Add email verification log if user has verified email
    if (user.emailVerifiedAt) {
      activityLogs.unshift({
        id: 'email-verified',
        action: 'Email verified',
        description: 'User email address was verified',
        timestamp: user.emailVerifiedAt,
        type: 'verify',
        event: 'verify',
        entityType: 'user.email',
        ipAddress: null,
      });
    }

    // Add last sign in log if user has signed in
    if (user.lastSignInAt) {
      activityLogs.unshift({
        id: 'last-signin',
        action: 'Last sign in',
        description: 'User last signed in to the system',
        timestamp: user.lastSignInAt,
        type: 'login',
        event: 'login',
        entityType: 'user.session',
        ipAddress: null,
      });
    }

    // Sort by timestamp (newest first)
    activityLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return NextResponse.json(activityLogs);
  } catch (error) {
    console.error('Error fetching user activity logs:', error);
    return NextResponse.json(
      { message: 'Failed to fetch activity logs' },
      { status: 500 },
    );
  }
}

// Helper functions to transform system log events to user-friendly format
function getActionFromEvent(event) {
  switch (event) {
    case 'create':
      return 'Created';
    case 'update':
      return 'Updated';
    case 'delete':
      return 'Deleted';
    case 'trash':
      return 'Trashed';
    case 'restore':
      return 'Restored';
    case 'login':
      return 'Signed in';
    case 'logout':
      return 'Signed out';
    case 'verify':
      return 'Verified';
    default:
      return event.charAt(0).toUpperCase() + event.slice(1);
  }
}

function getDefaultDescription(event) {
  switch (event) {
    case 'create':
      return 'Record was created';
    case 'update':
      return 'Record was updated';
    case 'delete':
      return 'Record was deleted';
    case 'trash':
      return 'Record was moved to trash';
    case 'restore':
      return 'Record was restored from trash';
    case 'login':
      return 'User signed in to the system';
    case 'logout':
      return 'User signed out of the system';
    case 'verify':
      return 'Record was verified';
    default:
      return 'Activity was recorded';
  }
}

function getTypeFromEvent(event) {
  switch (event) {
    case 'create':
      return 'create';
    case 'update':
      return 'update';
    case 'delete':
    case 'trash':
      return 'delete';
    case 'restore':
      return 'restore';
    case 'login':
      return 'login';
    case 'logout':
      return 'logout';
    case 'verify':
      return 'verify';
    default:
      return 'default';
  }
}
