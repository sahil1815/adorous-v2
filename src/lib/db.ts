import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Normalizes PostgreSQL connection string for Supabase / PgBouncer.
 * If connecting to Supabase pooler (pooler.supabase.com or port 6543),
 * Prisma MUST have `pgbouncer=true` to disable named prepared statements.
 * Otherwise, PostgresError 42P05 ("prepared statement 'sX' already exists")
 * will occur when transactions or pooled connections are reused.
 */
function getDatasourceUrl(): string | undefined {
  const rawUrl = process.env.DATABASE_URL || process.env.DATABASE_URL_POOLED;
  if (!rawUrl) return undefined;

  try {
    const parsed = new URL(rawUrl);
    const isTransactionPooler = parsed.port === '6543' || rawUrl.includes('6543');

    if (isTransactionPooler) {
      if (!parsed.searchParams.has('pgbouncer')) {
        parsed.searchParams.set('pgbouncer', 'true');
      }
    } else {
      parsed.searchParams.delete('pgbouncer');
    }

    if (!parsed.searchParams.has('connection_limit')) {
      parsed.searchParams.set('connection_limit', '5');
    }
    if (!parsed.searchParams.has('pool_timeout')) {
      parsed.searchParams.set('pool_timeout', '20');
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

