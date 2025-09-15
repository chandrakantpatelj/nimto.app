import { NextResponse } from 'next/server';
import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { uid } from '@/lib/helpers';
import { createS3Client, generateProxyUrl, getS3Config } from '@/lib/s3-utils';
import authOptions from '../../../auth/[...nextauth]/auth-options';

// Helper function to check if user has admin role
function hasAdminRole(userRole) {
  return userRole === 'super-admin' || userRole === 'application-admin';
}

const prisma = new PrismaClient();

// Check if image exists in S3
async function checkImageExists(s3Client, bucket, key) {
  try {
    await s3Client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch (error) {
    if (error.name === 'NotFound') {
      return false;
    }
    throw error;
  }
}

// Delete image from S3
async function deleteImageFromS3(s3Client, bucket, key) {
  try {
    await s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    console.log(`Deleted image from S3: ${key}`);
    return true;
  } catch (error) {
    console.error(`Failed to delete image from S3: ${key}`, error);
    return false;
  }
}

// Generate unique image path
function generateUniqueImagePath(
  templateId,
  originalFileName,
  imageFormat = 'png',
) {
  const timestamp = Date.now();
  const uniqueId = uid();
  const extension = imageFormat || originalFileName?.split('.').pop() || 'png';
  const filename = `template_${templateId}_${timestamp}_${uniqueId}.${extension}`;
  return `templates/${filename}`;
}

// POST /api/template/[id]/update-image - Update template image with proper S3 handling
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.roleName || !hasAdminRole(session.user.roleName)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 },
      );
    }

    const { id } = params;
    const {
      imageData,
      imageFormat = 'png',
      originalFileName,
    } = await request.json();

    if (!imageData) {
      return NextResponse.json(
        { success: false, error: 'Image data is required' },
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

    const s3Client = createS3Client();
    const bucket = process.env.AWS_S3_BUCKET || process.env.STORAGE_BUCKET;

    if (!bucket) {
      return NextResponse.json(
        { success: false, error: 'S3 bucket not configured' },
        { status: 500 },
      );
    }

    // Generate unique image path
    const newImagePath = generateUniqueImagePath(
      id,
      originalFileName,
      imageFormat,
    );

    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Upload new image to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: bucket,
      Key: newImagePath,
      Body: imageBuffer,
      ContentType: `image/${imageFormat}`,
      CacheControl: 'public, max-age=31536000',
    });

    await s3Client.send(uploadCommand);
    console.log(`Uploaded new image to S3: ${newImagePath}`);

    // If template has an existing image, delete it from S3
    let oldImageDeleted = false;
    if (template.imagePath) {
      const oldImageExists = await checkImageExists(
        s3Client,
        bucket,
        template.imagePath,
      );
      if (oldImageExists) {
        oldImageDeleted = await deleteImageFromS3(
          s3Client,
          bucket,
          template.imagePath,
        );
      }
    }

    // Update template with new image path
    const updatedTemplate = await prisma.template.update({
      where: { id },
      data: {
        imagePath: newImagePath,
        updatedAt: new Date(),
      },
    });

    // Generate the standardized proxy URL
    const imageUrl = generateProxyUrl(newImagePath);

    return NextResponse.json({
      success: true,
      data: {
        id: updatedTemplate.id,
        name: updatedTemplate.name,
        imagePath: newImagePath,
        imageUrl: imageUrl,
        oldImageDeleted: oldImageDeleted,
        message: 'Image updated successfully',
      },
    });
  } catch (error) {
    console.error('Error updating template image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update image' },
      { status: 500 },
    );
  }
}

// PUT /api/template/[id]/update-image - Upload new image file
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.roleName || !hasAdminRole(session.user.roleName)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 },
      );
    }

    const { id } = params;
    const formData = await request.formData();
    const file = formData.get('image');
    const useExistingPath = formData.get('useExistingPath') === 'true';
    const existingPath = formData.get('existingPath');

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Image file is required' },
        { status: 400 },
      );
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Only image files (JPG, PNG, GIF, WebP) are allowed',
        },
        { status: 400 },
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 5MB' },
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

    const s3Client = createS3Client();
    const bucket = process.env.AWS_S3_BUCKET || process.env.STORAGE_BUCKET;

    if (!bucket) {
      return NextResponse.json(
        { success: false, error: 'S3 bucket not configured' },
        { status: 500 },
      );
    }

    // Generate image path - use existing path if requested, otherwise generate new unique path
    const imageFormat = file.type.split('/')[1];
    let newImagePath;

    if (useExistingPath && existingPath) {
      newImagePath = existingPath;
    } else {
      newImagePath = generateUniqueImagePath(id, file.name, imageFormat);
    }

    // Handle existing image deletion BEFORE upload
    let oldImageDeleted = false;
    if (template.imagePath && useExistingPath) {
      const oldImageExists = await checkImageExists(
        s3Client,
        bucket,
        template.imagePath,
      );
      if (oldImageExists) {
        // Delete the existing file first to force update
        oldImageDeleted = await deleteImageFromS3(
          s3Client,
          bucket,
          template.imagePath,
        );
      }
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // Upload new image to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: bucket,
      Key: newImagePath,
      Body: imageBuffer,
      ContentType: file.type,
      CacheControl: 'public, max-age=31536000',
      // Force update by adding metadata
      Metadata: {
        'last-updated': new Date().toISOString(),
        'updated-by': 'template-editor',
      },
    });

    await s3Client.send(uploadCommand);

    // Handle existing image deletion for new paths
    if (template.imagePath && !useExistingPath) {
      const oldImageExists = await checkImageExists(
        s3Client,
        bucket,
        template.imagePath,
      );
      if (oldImageExists) {
        oldImageDeleted = await deleteImageFromS3(
          s3Client,
          bucket,
          template.imagePath,
        );
      }
    }

    // Update template with new image path
    const updatedTemplate = await prisma.template.update({
      where: { id },
      data: {
        imagePath: newImagePath,
        updatedAt: new Date(),
      },
    });

    // Generate the standardized proxy URL
    const imageUrl = generateProxyUrl(newImagePath);

    return NextResponse.json({
      success: true,
      data: {
        id: updatedTemplate.id,
        name: updatedTemplate.name,
        imagePath: newImagePath,
        imageUrl: imageUrl,
        oldImageDeleted: oldImageDeleted,
        message: 'Image uploaded successfully',
      },
    });
  } catch (error) {
    console.error('Error uploading template image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload image' },
      { status: 500 },
    );
  }
}
