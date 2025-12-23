import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Validate DATABASE_URL in production
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  const errorMessage = 
    process.env.NODE_ENV === 'production'
      ? '❌ DATABASE_URL is not set in production environment variables. Please set DATABASE_URL in your deployment platform (Vercel, etc.).'
      : '⚠️ DATABASE_URL is not set. Using fallback localhost connection (development only).';
  
  console.error(errorMessage);
  
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'DATABASE_URL environment variable is required in production. ' +
      'Please set it in your deployment platform settings.'
    );
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl || 'postgresql://postgres:password@localhost:5432/tiger?schema=public',
      },
    },
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
