import { NextResponse } from 'next/server';
import {
  GetObjectCommand,
  HeadObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getS3Config } from '@/lib/s3-utils';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    const imagePath = searchParams.get('path');

    console.log('Image proxy - Input:', { imageUrl, imagePath });

    // Build S3 URL if only path is provided
    let s3Url = imageUrl;
    if (!s3Url && imagePath) {
      const { bucket, region, endpoint } = getS3Config();
      if (!bucket && !endpoint) {
        return NextResponse.json(
          { error: 'S3 configuration not found' },
          { status: 500 },
        );
      }
      s3Url = endpoint
        ? `${endpoint}/${imagePath}`
        : `https://${bucket}.s3.${region}.amazonaws.com/${imagePath}`;
      console.log('Image proxy - Constructed S3 URL:', s3Url);
    }

    if (!s3Url) {
      return NextResponse.json(
        { error: 'URL or path parameter is required' },
        { status: 400 },
      );
    }

    // Parse S3 URL
    const url = new URL(s3Url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    if (pathParts.length === 0) {
      return NextResponse.json({ error: 'Invalid S3 URL' }, { status: 400 });
    }

    const bucket = url.hostname.split('.')[0];
    const decodedKey = decodeURIComponent(
      pathParts.length > 1 ? pathParts.slice(1).join('/') : pathParts[0],
    );

    console.log('S3 Proxy - Parsed:', { bucket, decodedKey });

    // Configure S3 client
    const s3Client = new S3Client({
      region: process.env.STORAGE_REGION || 'ap-southeast-2',
      credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
        secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
      },
      endpoint: process.env.STORAGE_ENDPOINT || undefined,
      forcePathStyle: Boolean(process.env.STORAGE_ENDPOINT),
    });

    // Validate that the object exists
    try {
      await s3Client.send(
        new HeadObjectCommand({ Bucket: bucket, Key: decodedKey }),
      );
    } catch (headError) {
      if (headError.name === 'NoSuchKey') {
        return NextResponse.json({ error: 'Image not found' }, { status: 404 });
      }
      if (headError.name === 'AccessDenied') {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
      throw headError;
    }

    // Fetch object from S3
    const { Body, ContentType: fetchedContentType } = await s3Client.send(
      new GetObjectCommand({ Bucket: bucket, Key: decodedKey }),
    );

    if (!Body) {
      return NextResponse.json(
        { error: 'No image data received' },
        { status: 404 },
      );
    }

    // Convert readable stream to buffer
    const chunks = [];
    for await (const chunk of Body) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': fetchedContentType || 'image/png',
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);

    const statusMap = {
      NoSuchKey: 404,
      AccessDenied: 403,
    };
    const status = statusMap[error.name] || 500;

    return NextResponse.json(
      {
        error:
          error.name === 'NoSuchKey'
            ? 'Image not found'
            : error.name === 'AccessDenied'
              ? 'Access denied to S3 bucket'
              : 'Failed to fetch image',
        details: error.message,
      },
      { status },
    );
  }
}
