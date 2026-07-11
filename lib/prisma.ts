import { PrismaClient } from '@prisma/client';

// Ensure DATABASE_URL is set before attempting to connect to Prisma
if (!process.env.DATABASE_URL) {
  console.error('CRITICAL: DATABASE_URL environment variable is not set. Prisma will fail to connect.');
  // We don't throw here to allow the build process to proceed if needed, 
  // but it logs a massive warning.
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
