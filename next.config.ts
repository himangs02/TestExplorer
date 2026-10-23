import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  devIndicators: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },

  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  experimental: {
    // Prevent Hostinger/Docker from spawning 63 workers and hitting OS thread limits (EAGAIN / os error 11)
    cpus: 1,
    workerThreads: false,
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
