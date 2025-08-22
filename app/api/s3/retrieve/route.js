import {  NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { imageUrl } = await request.json();

    // Simple test response
    return NextResponse.json({
      success: true,
      message: 'Retrieve endpoint is working',
      imageUrl,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in retrieve endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
