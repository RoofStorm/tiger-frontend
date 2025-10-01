import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  images: {
    domains: ['localhost', 'res.cloudinary.com', 's3.amazonaws.com'],
  },
  experimental: {
    serverComponentsExternalPackages: ['html2canvas'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;