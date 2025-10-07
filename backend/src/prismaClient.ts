import { PrismaClient } from '@prisma/client';

// Singleton pattern to avoid creating multiple clients in dev with hot reload
const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  });

if (process.env.NODE_ENV === 'development') globalForPrisma.prisma = prisma;

export default prisma;
