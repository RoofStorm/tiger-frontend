import { NextResponse } from 'next/server';

export async function GET() {
  // Redirect to the Next.js privacy policy page
  return NextResponse.redirect(
    `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/privacy-policy`
  );
}

export async function POST() {
  // Handle POST requests if needed
  return NextResponse.json({
    privacy_policy_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/privacy-policy`,
    message: 'Privacy policy is available at the provided URL',
  });
}
