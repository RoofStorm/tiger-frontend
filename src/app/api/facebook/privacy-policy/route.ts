import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Redirect to the static privacy policy page
  return NextResponse.redirect(
    `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/privacy-policy.html`
  );
}

export async function POST(request: NextRequest) {
  // Handle POST requests if needed
  return NextResponse.json({
    privacy_policy_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/privacy-policy.html`,
    message: 'Privacy policy is available at the provided URL',
  });
}
