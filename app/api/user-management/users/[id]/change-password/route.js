import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';
import { getPasswordSchema } from '@/app/(auth)/forms/password-schema';

const prisma = new PrismaClient();

export async function POST(request) {
    try {
        // Authenticate user
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'You must be logged in to change your password.' },
                { status: 403 }
            );
        }

        const userId = session.user.id;
        const { currentPassword, newPassword, confirmPassword } = await request.json();

        // Basic validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            return NextResponse.json(
                { success: false, error: 'All password fields are required.' },
                { status: 400 }
            );
        }
        if (newPassword !== confirmPassword) {
            return NextResponse.json(
                { success: false, error: 'New password and confirmation do not match.' },
                { status: 400 }
            );
        }

        // Validate new password using Zod schema
        const passwordSchema = getPasswordSchema(8);
        const parseResult = passwordSchema.safeParse(newPassword);
        if (!parseResult.success) {
            // Return the first error message
            const errorMsg = parseResult.error.errors[0]?.message || 'Invalid password format.';
            return NextResponse.json(
                { success: false, error: errorMsg },
                { status: 400 }
            );
        }

        // Fetch user
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || !user.password) {
            return NextResponse.json(
                { success: false, error: 'User not found or password not set.' },
                { status: 404 }
            );
        }

        // Validate current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { success: false, error: 'Current password is incorrect.' },
                { status: 401 }
            );
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password in DB
        await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Password changed successfully.',
        });
    } catch (error) {
        console.error('Change password error:', error);
        return NextResponse.json(
            { success: false, error: 'Unexpected error. Please try again or contact support.' },
            { status: 500 }
        );
    }
}