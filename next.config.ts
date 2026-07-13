import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'illustrations.popsy.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },

  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
