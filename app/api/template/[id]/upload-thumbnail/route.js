import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { createS3Client, getS3Config } from '@/lib/s3-utils';
import authOptions from '../../../auth/[...nextauth]/auth-options';

// Helper function to check if user has admin role
function hasAdminRole(userRole) {
  return userRole === 'super-admin' || userRole === 'application-admin';
}

const prisma = new PrismaClient();

// POST /api/template/[id]/upload-thumbnail - Upload Pixie export image to S3 and update template
//
// Usage Example:
// POST /api/template/123/upload-thumbnail
// Body: { imageBlob: "data:image/png;base64,...", imageFormat: "png" }
//
// S3 Storage: template-thumbnails/template_123_thumbnail_1695123456789.png
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.roleSlug || !hasAdminRole(session.user.roleSlug)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 },
      );
    }

    const { id } = await params;
    const { imageBlob, imageFormat = 'png' } = await request.json();

    // Validate template ID
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid template ID is required' },
        { status: 400 },
      );
    }

    if (!imageBlob) {
      return NextResponse.json(
        { success: false, error: 'Image blob is required' },
        { status: 400 },
      );
    }

    // Check if template exists
    const template = await prisma.template.findFirst({
      where: {
        id,
        isTrashed: false,
      },
    });

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 },
      );
    }

    // Convert blob to buffer
    let imageBuffer;
    if (typeof imageBlob === 'string') {
      // Handle base64 data URL
      const base64Data = imageBlob.replace(/^data:image\/\w+;base64,/, '');
      imageBuffer = Buffer.from(base64Data, 'base64');
    } else if (imageBlob instanceof ArrayBuffer) {
      // Handle ArrayBuffer
      imageBuffer = Buffer.from(imageBlob);
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid image format' },
        { status: 400 },
      );
    }

    // Determine thumbnail path - use existing if available, otherwise create new
    let thumbnailPath;
    if (template.templateThumbnailPath) {
      // For edit operations: overwrite existing thumbnail
      thumbnailPath = template.templateThumbnailPath;
    } else {
      // For new uploads: generate unique filename
      const timestamp = Date.now();
      const filename = `template_${id}_thumbnail_${timestamp}.${imageFormat}`;
      thumbnailPath = `template-thumbnails/${filename}`;
    }

    // Upload to S3
    const s3Client = createS3Client();
    const { bucket } = getS3Config();

    if (!bucket) {
      return NextResponse.json(
        { success: false, error: 'S3 bucket not configured' },
        { status: 500 },
      );
    }

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: thumbnailPath,
      Body: imageBuffer,
      ContentType: `image/${imageFormat}`,
      CacheControl: 'public, max-age=31536000',
    });

    try {
      await s3Client.send(command);
    } catch (s3Error) {
      console.error('S3 upload failed:', s3Error);
      throw s3Error;
    }

    // Update template - only update thumbnail path if it's new
    const updateData = {
      updatedAt: new Date(),
    };

    // Only update templateThumbnailPath if it's a new path (not overwriting existing)
    if (!template.templateThumbnailPath) {
      updateData.templateThumbnailPath = thumbnailPath;
    }

    const updatedTemplate = await prisma.template.update({
      where: { id },
      data: updateData,
    });

    // Generate the public URL for the thumbnail
    const { region: s3Region, endpoint: s3Endpoint } = getS3Config();

    let thumbnailUrl;
    if (s3Endpoint) {
      // For S3-compatible services (DigitalOcean Spaces, etc.)
      thumbnailUrl = `${s3Endpoint}/${bucket}/${thumbnailPath}`;
    } else {
      // For AWS S3 - follow AWS standard path structure (bucket/bucket/path)
      thumbnailUrl = `https://${bucket}.s3.${s3Region}.amazonaws.com/${bucket}/${thumbnailPath}`;
    }
    const isOverwrite = !!template.templateThumbnailPath;

    return NextResponse.json({
      success: true,
      data: {
        id: updatedTemplate.id,
        name: updatedTemplate.name,
        templateThumbnailPath: thumbnailPath,
        templateThumbnailUrl: thumbnailUrl,
        message: isOverwrite
          ? 'Thumbnail updated successfully'
          : 'Thumbnail uploaded successfully',
        isOverwrite: isOverwrite,
      },
    });
  } catch (error) {
    console.error('Error uploading template thumbnail:', error);

    // Return more specific error messages for debugging
    let errorMessage = 'Failed to upload template thumbnail';
    let statusCode = 500;

    if (error.name === 'NoSuchBucket') {
      errorMessage = 'S3 bucket does not exist';
      statusCode = 500;
    } else if (error.name === 'AccessDenied') {
      errorMessage = 'Access denied to S3 bucket';
      statusCode = 403;
    } else if (error.name === 'InvalidAccessKeyId') {
      errorMessage = 'Invalid AWS credentials';
      statusCode = 401;
    } else if (error.name === 'SignatureDoesNotMatch') {
      errorMessage = 'AWS signature mismatch';
      statusCode = 401;
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Ensure we always return a proper JSON response
    const errorResponse = {
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    };

    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
