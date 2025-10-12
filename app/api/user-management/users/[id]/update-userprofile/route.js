import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { createS3Client, generateProxyUrl } from '@/lib/s3-utils';
import authOptions from '@/app/api/auth/[...nextauth]/auth-options';

const prisma = new PrismaClient();
const DEFAULT_AVATAR_PATH = 'media/images/600x400/19.jpg';

export async function POST(request) {
    try {
        // Authenticate user
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'You must be logged in to update your profile.' },
                { status: 403 }
            );
        }

        const userId = session.user.id;
        const {
            name,
            timezone,
            imageData,
            imageFormat = 'png'
        } = await request.json();

        // Fetch user
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User account not found.' },
                { status: 404 }
            );
        }

        let avatarUrl = user.avatar;
        let updateData = {};

        // If imageData is provided, upload new avatar and save direct URL
        if (imageData) {
            if (typeof imageData !== 'string' || !imageData.startsWith('data:image/')) {
                return NextResponse.json(
                    { success: false, error: 'Invalid image data format.' },
                    { status: 400 }
                );
            }

            const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
            if (!base64Data) {
                return NextResponse.json(
                    { success: false, error: 'Image data is empty.' },
                    { status: 400 }
                );
            }
            const imageBuffer = Buffer.from(base64Data, 'base64');

            // S3 upload setup
            const timestamp = Date.now();
            const filename = `user_${userId}_${timestamp}.${imageFormat}`;
            const imagePath = `users/${filename}`;
            const s3Client = createS3Client();
            const bucket = process.env.AWS_S3_BUCKET || process.env.STORAGE_BUCKET;

            if (!bucket) {
                return NextResponse.json(
                    { success: false, error: 'Image storage is not configured. Please contact support.' },
                    { status: 500 }
                );
            }

            try {
                const command = new PutObjectCommand({
                    Bucket: bucket,
                    Key: imagePath,
                    Body: imageBuffer,
                    ContentType: `image/${imageFormat}`,
                    CacheControl: 'public, max-age=31536000',
                });
                await s3Client.send(command);
            } catch (err) {
                console.error('S3 upload error:', err);
                return NextResponse.json(
                    { success: false, error: 'Failed to upload image. Please try again later.' },
                    { status: 500 }
                );
            }

            avatarUrl = generateProxyUrl(imagePath);
            updateData.avatar = avatarUrl;
        }

        // If no imageData and avatar is empty, set default avatar as direct URL
        if (!imageData && !avatarUrl) {
            avatarUrl = generateProxyUrl(DEFAULT_AVATAR_PATH);
            updateData.avatar = avatarUrl;
        }

        // Update other fields if provided
        if (typeof name === 'string' && name.trim() !== '') {
            updateData.name = name.trim();
        }
        if (typeof timezone === 'string' && timezone.trim() !== '') {
            updateData.timezone = timezone.trim();
        }
        updateData.updatedAt = new Date();

        // Update user in DB
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        return NextResponse.json({
            success: true,
            data: {
                id: updatedUser.id,
                name: updatedUser.name,
                avatar: updatedUser.avatar,
                imageUrl: updatedUser.avatar,
                timezone: updatedUser.timezone,
                message: imageData
                    ? 'Profile updated successfully.'
                    : (!avatarUrl ? 'Default profile image set.' : 'Profile updated successfully.'),
            },
        });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json(
            { success: false, error: 'Unexpected error. Please try again or contact support.' },
            { status: 500 }
        );
    }
}