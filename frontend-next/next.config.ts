import type { NextConfig } from "next";

// Media (S3/CloudFront) domain for Next.js Image - set in stg/prod when using prod S3 URLs
const mediaDomain = process.env.NEXT_PUBLIC_MEDIA_DOMAIN;

const remotePatterns = [
  { protocol: "https" as const, hostname: "images.unsplash.com" },
  { protocol: "https" as const, hostname: "plus.unsplash.com" },
];
if (mediaDomain) {
  remotePatterns.push({ protocol: "https" as const, hostname: mediaDomain });
}

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: remotePatterns as NextConfig["images"] extends { remotePatterns?: infer R } ? R : never,
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://backend:8000';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/media/:path*',
        destination: `${backendUrl}/media/:path*`,
      },
      // Proxy admin panel for convenience during dev
      {
        source: '/admin/:path*',
        destination: `${backendUrl}/admin/:path*`,
      },
      {
        source: '/static/:path*',
        destination: `${backendUrl}/static/:path*`,
      }
    ]
  }
};

export default nextConfig;
