import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import authOptions from '../../../auth/[...nextauth]/auth-options';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { generateS3Url } from '@/lib/s3-utils';

const prisma = new PrismaClient();

// S3 Client configuration
function createS3Client() {
  const config = {
    region: process.env.AWS_REGION || process.env.STORAGE_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.STORAGE_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.STORAGE_SECRET_ACCESS_KEY,
    },
  };

  if (process.env.AWS_ENDPOINT || process.env.STORAGE_ENDPOINT) {
    config.endpoint = process.env.AWS_ENDPOINT || process.env.STORAGE_ENDPOINT;
    config.forcePathStyle = true;
  } else {
    config.forcePathStyle = false;
  }

  return new S3Client(config);
}

// POST /api/template/[id]/save-image - Save edited image from Pixie
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { imageData, imageFormat = 'png' } = await request.json();

    if (!imageData) {
      return NextResponse.json(
        { success: false, error: 'Image data is required' },
        { status: 400 }
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
        { status: 404 }
      );
    }

    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `template_${id}_${timestamp}.${imageFormat}`;
    const imagePath = `templates/${filename}`;

    // Upload to S3
    const s3Client = createS3Client();
    const bucket = process.env.AWS_S3_BUCKET || process.env.STORAGE_BUCKET;
    
    if (!bucket) {
      return NextResponse.json(
        { success: false, error: 'S3 bucket not configured' },
        { status: 500 }
      );
    }

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: imagePath,
      Body: imageBuffer,
      ContentType: `image/${imageFormat}`,
      CacheControl: 'public, max-age=31536000',
    });

    await s3Client.send(command);

    // Update template with new image path
    const updatedTemplate = await prisma.template.update({
      where: { id },
      data: {
        imagePath: imagePath,
        updatedAt: new Date(),
      },
    });

    // Generate the full S3 URL
    const imageUrl = generateS3Url(imagePath);

    return NextResponse.json({
      success: true,
      data: {
        id: updatedTemplate.id,
        name: updatedTemplate.name,
        imagePath: imagePath,
        imageUrl: imageUrl,
        message: 'Image saved successfully',
      },
    });

  } catch (error) {
    console.error('Error saving template image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save image' },
      { status: 500 }
    );
  }
}
