import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'illustrations.popsy.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },

  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'country-state-city',
      'recharts',
      'date-fns',
      'framer-motion',
    ],
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
