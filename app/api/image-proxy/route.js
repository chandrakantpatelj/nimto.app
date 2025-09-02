import { NextResponse } from 'next/server';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getS3Config } from '@/lib/s3-utils';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    const imagePath = searchParams.get('path');

    console.log('Image proxy - Received URL:', imageUrl, 'Path:', imagePath);

    let s3Url = imageUrl;

    // If we have a path instead of a full URL, construct the S3 URL
    if (!s3Url && imagePath) {
      const { bucket, region, endpoint } = getS3Config();
      console.log('Image proxy - S3 config:', { bucket, region, endpoint });

      if (endpoint) {
        s3Url = `${endpoint}/${imagePath}`;
      } else if (bucket && region) {
        s3Url = `https://${bucket}.s3.${region}.amazonaws.com/${imagePath}`;
      } else {
        return NextResponse.json(
          { error: 'S3 configuration not found' },
          { status: 500 },
        );
      }
      console.log('Image proxy - Constructed S3 URL:', s3Url);
    }

    if (!s3Url) {
      return NextResponse.json(
        { error: 'URL or path parameter is required' },
        { status: 400 },
      );
    }

    // Parse the S3 URL to extract bucket and key
    const url = new URL(s3Url);
    const pathParts = url.pathname.split('/').filter((part) => part);

    console.log('Image proxy - Parsed URL:', {
      hostname: url.hostname,
      pathParts,
    });

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
