import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Normalizes PostgreSQL connection string for Supabase / PgBouncer.
 * Always routes to port 5432 (IPv4 session pooler) with connection_limit=1
 * for serverless instances, preventing both port 6543 unreachable errors
 * and EMAXCONNSESSION (pool_size: 15) session ceiling.
 */
function getDatasourceUrl(): string | undefined {
  const rawUrl = process.env.DATABASE_URL || process.env.DATABASE_URL_POOLED;
  if (!rawUrl) return undefined;

  try {
    const parsed = new URL(rawUrl);

    // Port 6543 on Supabase pooler is unreachable/rejected in this region;
    // ensure we always route to the working IPv4 port 5432.
    if (parsed.port === '6543') {
      parsed.port = '5432';
    }

    // Healthy connection limits for serverless instances
    parsed.searchParams.set('connection_limit', '3');
    parsed.searchParams.set('pool_timeout', '20');
    parsed.searchParams.set('connect_timeout', '15');

    // On session mode port 5432, remove pgbouncer=true to allow native query handling
    if (parsed.port === '5432') {
      parsed.searchParams.delete('pgbouncer');
    }

    return parsed.toString();
  } catch {
    return rawUrl;
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: getDatasourceUrl(),
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Always store on globalThis so all Next.js server chunks/Server Actions share the singleton
globalForPrisma.prisma = prisma;

