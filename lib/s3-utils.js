/**
 * S3 URL generation utilities
 * Provides consistent URL generation for both server and client side
 */

import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Get S3 configuration from environment variables
export function getS3Config() {
  return {
    bucket:
      process.env.AWS_S3_BUCKET ||
      process.env.STORAGE_BUCKET ||
      process.env.NEXT_PUBLIC_AWS_S3_BUCKET ||
      process.env.NEXT_PUBLIC_STORAGE_BUCKET,
    region:
      process.env.AWS_REGION ||
      process.env.STORAGE_REGION ||
      process.env.NEXT_PUBLIC_AWS_REGION ||
      process.env.NEXT_PUBLIC_STORAGE_REGION ||
      'us-east-1',
    endpoint:
      process.env.AWS_ENDPOINT ||
      process.env.STORAGE_ENDPOINT ||
      process.env.NEXT_PUBLIC_AWS_ENDPOINT ||
      process.env.NEXT_PUBLIC_STORAGE_ENDPOINT,
  };
}

// Create S3 client
export function createS3Client() {
  const { region, endpoint } = getS3Config();
  const config = {
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.STORAGE_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.STORAGE_SECRET_ACCESS_KEY,
    },
  };

  if (endpoint) {
    config.endpoint = endpoint;
    config.forcePathStyle = true;
  }

  return new S3Client(config);
}

// Delete image from S3
export async function deleteImageFromS3(imagePath) {
  if (!imagePath) {
    console.warn('No image path provided for deletion');
    return false;
  }

  try {
    const s3Client = createS3Client();
    const { bucket } = getS3Config();

    if (!bucket) {
      console.error('S3 bucket not configured');
      return false;
    }

    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: imagePath,
    });

    await s3Client.send(command);
    console.log(`Successfully deleted image from S3: ${imagePath}`);
    return true;
  } catch (error) {
    console.error('Error deleting image from S3:', error);
    return false;
  }
}

// Generate public URL for S3 object
export function generateS3Url(imagePath) {
  if (!imagePath) return null;

  const { bucket, region, endpoint } = getS3Config();

  if (!bucket) {
    console.warn('S3 bucket not configured');
    return null;
  }

  // URL encode the image path to handle spaces and special characters
  const encodedImagePath = encodeURIComponent(imagePath);  
  if (endpoint) {
    // For S3-compatible services (DigitalOcean Spaces, etc.)
    return `${endpoint}/${bucket}/${encodedImagePath}`;
  } else {
    // For AWS S3 - include bucket name in the path
    return `https://${bucket}.s3.${region}.amazonaws.com/${bucket}/${encodedImagePath}`;
  }
}

// Validate S3 URL format
export function isValidS3Url(url) {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === 'https:' &&
      (parsed.hostname.includes('s3.amazonaws.com') ||
        parsed.hostname.includes('digitaloceanspaces.com') ||
        parsed.hostname.includes('s3.'))
    );
  } catch {
    return false;
  }
}

// Extract image path from S3 URL
export function extractImagePathFromUrl(url) {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split('/');

    // Remove bucket name from path (it's usually the first part after the slash)
    if (pathParts.length > 2) {
      return pathParts.slice(2).join('/');
    }

    return null;
  } catch {
    return null;
  }
}

// Check if image path is valid
export function isValidImagePath(imagePath) {
  if (!imagePath) return false;

  // Check if it's a valid path format
  const validPathRegex = /^[a-zA-Z0-9\/\-_\.]+$/;
  return validPathRegex.test(imagePath) && !imagePath.includes('..');
}

// Generate fallback image URL for testing
export function getFallbackImageUrl() {
  return 'https://via.placeholder.com/400x300?text=No+Image';
}
