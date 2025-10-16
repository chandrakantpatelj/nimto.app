// app/api/auth/verify-email.ts (or pages/api/auth/verify-email.ts in older structure)

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req) {
  const { token } = await req.json();

  if (!token) {
    return NextResponse.json({ error: 'Token is missing' }, { status: 400 });
  }

  // First, retrieve the verification token
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  // Check if the token is invalid or expired
  if (!verificationToken || verificationToken.expires < new Date()) {
    return NextResponse.json(
      { message: 'Invalid or expired token' },
      { status: 400 },
    );
  }

  try {
    // First check if the user exists and is not trashed
    const user = await prisma.user.findUnique({
      where: { id: verificationToken.identifier },
    });

    if (!user) {
      // Clean up orphaned token
      await prisma.verificationToken.deleteMany({
        where: { token },
      });

      return NextResponse.json(
        { message: 'User not found. Please sign up again.' },
        { status: 404 },
      );
    }

    if (user.isTrashed) {
      return NextResponse.json(
        {
          message: 'This account has been deactivated. Please contact support.',
        },
        { status: 403 },
      );
    }

    // Use a transaction to update user and delete token together
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: verificationToken.identifier,
          isTrashed: false, // Only update if not trashed
        },
        data: {
          status: 'ACTIVE',
          emailVerifiedAt: new Date(),
        },
      });

      // Use deleteMany instead of delete to avoid throwing if token not found
      await tx.verificationToken.deleteMany({
        where: { token },
      });
    });

    return NextResponse.json(
      { message: 'Email verified successfully!' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Verification failed:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}
