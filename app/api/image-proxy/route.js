import { NextResponse } from 'next/server';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 },
      );
    }

    // Parse the S3 URL to extract bucket and key
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/').filter((part) => part);

    if (pathParts.length === 0) {
      return NextResponse.json({ error: 'Invalid S3 URL' }, { status: 400 });
    }

    const bucket = url.hostname.split('.')[0]; // Extract bucket name from hostname
    const key = pathParts.join('/'); // The rest is the object key

    console.log('S3 Proxy - Bucket:', bucket, 'Key:', key);

    // Create S3 client with credentials
    const s3Client = new S3Client({
      region: process.env.STORAGE_REGION || 'ap-southeast-2',
      credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
        secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
      },
    });

    // Get the object from S3
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      return NextResponse.json(
        { error: 'No image data received' },
        { status: 404 },
      );
    }

    // Convert the readable stream to buffer
    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Determine content type
    const contentType = response.ContentType || 'image/png';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);

    if (error.name === 'NoSuchKey') {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    if (error.name === 'AccessDenied') {
      return NextResponse.json(
        { error: 'Access denied to S3 bucket' },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch image',
        details: error.message,
      },
      { status: 500 },
    );
  }
}
