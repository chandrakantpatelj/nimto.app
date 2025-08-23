import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getClientIP } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { systemLog } from '@/services/system-log';
import { AccountProfileSchema } from '@/app/(protected)/user-management/account/forms/account-profile-schema';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized request' },
        { status: 401 }, // Unauthorized
      );
    }

    const clientIp = getClientIP(request);

    // Parse the form data
    const formData = await request.formData();

    // Extract form data
    const parsedData = {
      name: formData.get('name'),
      avatarFile: formData.get('avatarFile'),
      avatarAction: formData.get('avatarAction'),
    };

    // Validate the input using Zod schema
    const validationResult = AccountProfileSchema.safeParse(parsedData);
    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });
    }

    const { name, avatarFile, avatarAction } = validationResult.data;

    // Handle avatar removal
    if (avatarAction === 'remove' && session.user?.avatar) {
      // S3 functionality removed - avatar will be set to null
      console.log('Avatar removal requested - S3 functionality disabled');
    }

    // Handle new avatar upload
    let avatarUrl = session.user?.avatar || null;
    if (
      avatarAction === 'save' &&
      avatarFile &&
      avatarFile.size > 0
    ) {
      // S3 functionality removed - return error
      return NextResponse.json(
        { message: 'Avatar upload is currently disabled.' },
        { status: 503 },
      );
    }

    // Save or update the user in the database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        avatar:
          avatarAction === 'remove'
            ? null
            : avatarAction === 'save'
              ? avatarUrl
              : undefined,
      },
    });

    // Log the event
    await systemLog({
      event: 'update',
      userId: session.user.id,
      entityId: session.user.id,
      entityType: 'user.account',
      description: 'User account updated.',
      ipAddress: clientIp,
    });

    return NextResponse.json(updatedUser);
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
