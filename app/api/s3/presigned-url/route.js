import { NextRequest, NextResponse } from 'next/server';
import { generatePresignedUploadUrl, validateFile } from '@/lib/s3-presigned';

export async function POST(request) {
  try {
    const { fileName, contentType, directory } = await request.json();

    // Validate required fields
    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: 'fileName and contentType are required' },
        { status: 400 }
      );
    }

    // Create a mock file object for validation
    const mockFile = {
      name: fileName,
      type: contentType,
      size: 0, // We don't have the actual size at this point
    };

    // Validate file type (size validation will be done on client side)
    try {
      validateFile(mockFile);
    } catch (error) {
      if (error.message.includes('size')) {
        // Skip size validation for pre-signed URL generation
      } else {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    // Generate pre-signed URL
    const result = await generatePresignedUploadUrl(
      fileName,
      contentType,
      directory || 'templates'
    );

    return NextResponse.json({
      success: true,
      presignedUrl: result.presignedUrl,
      key: result.key,
      fileName: result.fileName,
      bucket: result.bucket,
      region: process.env.AWS_REGION || process.env.STORAGE_REGION || 'us-east-1',
    });

  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
