import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { uid } from './helpers';
import { createS3Client, getS3Config } from './s3-utils';

// Generate pre-signed URL for upload
export async function generatePresignedUploadUrl(
  fileName,
  contentType,
  directory = 'templates',
) {
  try {
    const s3Client = createS3Client();
    const { bucket } = getS3Config();

    if (!bucket) {
      throw new Error('S3 bucket not configured');
    }

    // Generate unique filename
    const uniqueFileName = `${uid()}_${fileName}`;
    const key = `${directory}/${uniqueFileName}`;

    // Create the command for uploading
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000',
      // Removed ACL: 'public-read' as bucket doesn't support ACLs
    });

    // Generate pre-signed URL (valid for 15 minutes)
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 900, // 15 minutes
    });

    console.log('Generated presigned URL:', {
      bucket,
      key,
      presignedUrl: presignedUrl.substring(0, 100) + '...',
      region:
        process.env.AWS_REGION || process.env.STORAGE_REGION || 'us-east-1',
    });

    return {
      presignedUrl,
      key,
      fileName: uniqueFileName,
      bucket,
    };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error('Failed to generate upload URL');
  }
}

// Generate pre-signed URL for download/viewing
export async function generatePresignedDownloadUrl(key, expiresIn = 3600) {
  try {
    const s3Client = createS3Client();
    const { bucket } = getS3Config();

    if (!bucket) {
      throw new Error('S3 bucket not configured');
    }

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn,
    });

    return presignedUrl;
  } catch (error) {
    console.error('Error generating download URL:', error);
    throw new Error('Failed to generate download URL');
  }
}

// Get public URL for uploaded file
export function getPublicUrl(key) {
  const { bucket, region, endpoint } = getS3Config();

  if (endpoint) {
    // For S3-compatible services (DigitalOcean Spaces, etc.)
    return `${endpoint}/${bucket}/${key}`;
  } else {
    // For AWS S3 - follow AWS standard path structure (bucket/bucket/path)
    return `https://${bucket}.s3.${region}.amazonaws.com/${bucket}/${key}`;
  }
}

// Validate file type and size
export function validateFile(file) {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  if (!file) {
    throw new Error('No file provided');
  }

  if (file.size > maxSize) {
    throw new Error('File size must be less than 5MB');
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only image files (JPG, PNG, GIF, WebP) are allowed');
  }

  return true;
}
