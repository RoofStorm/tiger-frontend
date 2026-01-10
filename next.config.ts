import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // Only use standalone output in production (for Docker builds)
  ...(process.env.NODE_ENV === 'production' ? { output: 'standalone' as const } : {}),
  // Fix warning about multiple lockfiles by explicitly setting the workspace root
  outputFileTracingRoot: process.cwd(),
  images: {
    qualities: [75, 90, 100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh4.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh5.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh6.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com',
      },
      {
        protocol: 'https',
        hostname: 'scontent.xx.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'scontent-*.xx.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'storage.tiger-corporation-vietnam.vn',
      },
      {
        protocol: 'http',
        hostname: 'storage.tiger-corporation-vietnam.vn',
      },
      {
        protocol: 'https',
        hostname: 's3.tiger-corporation-vietnam.vn',
      },
      {
        protocol: 'http',
        hostname: 's3.tiger-corporation-vietnam.vn',
      },
      {
        protocol: 'https',
        hostname: 'tiger-minio.fly.dev',
      },
      // Development/testing only - should be replaced with proper image URLs
      {
        protocol: 'https',
        hostname: 'example.com',
      },
    ],
  },
  serverExternalPackages: ['html2canvas'],
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;
