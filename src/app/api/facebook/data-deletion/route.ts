import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Facebook App Secret để verify request
const FACEBOOK_APP_SECRET = process.env.OAUTH_FACEBOOK_CLIENT_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { signed_request } = body;

    if (!signed_request) {
      return NextResponse.json(
        { error: 'Missing signed_request parameter' },
        { status: 400 }
      );
    }

    // Verify the signed request from Facebook
    const [encodedSig, payload] = signed_request.split('.', 2);

    if (!encodedSig || !payload) {
      return NextResponse.json(
        { error: 'Invalid signed_request format' },
        { status: 400 }
      );
    }

    // Decode the signature and payload
    const sig = Buffer.from(
      encodedSig.replace(/-/g, '+').replace(/_/g, '/'),
      'base64'
    );
    const data = JSON.parse(
      Buffer.from(
        payload.replace(/-/g, '+').replace(/_/g, '/'),
        'base64'
      ).toString()
    );

    // Verify the signature
    const expectedSig = crypto
      .createHmac('sha256', FACEBOOK_APP_SECRET!)
      .update(payload)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    if (encodedSig !== expectedSig) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    // Extract user ID from the signed request
    const userId = data.user_id;

    if (!userId) {
      return NextResponse.json(
        { error: 'No user ID in request' },
        { status: 400 }
      );
    }

    // Here you would typically:
    // 1. Find the user in your database by Facebook user ID
    // 2. Delete all user data
    // 3. Return confirmation

    // For now, we'll return a success response
    // In production, you should implement actual data deletion logic
    console.log(`Facebook data deletion request for user: ${userId}`);

    return NextResponse.json({
      url: 'http://localhost:3000/data-deletion.html',
      confirmation_code: `DELETION_${userId}_${Date.now()}`,
    });
  } catch (error) {
    console.error('Facebook data deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Handle GET requests (for testing)
  return NextResponse.json({
    message: 'Facebook Data Deletion Callback URL is working',
    instructions: 'This endpoint handles Facebook data deletion requests',
    test_url: 'http://localhost:3000/data-deletion.html',
  });
}
