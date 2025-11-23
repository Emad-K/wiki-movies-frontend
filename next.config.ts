import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
    ],
    // Only disable optimization in development to avoid private IP issues
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
