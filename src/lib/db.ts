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
  // In production (Vercel serverless), prioritize DATABASE_URL_POOLED (port 6543 transaction pooler)
  // to avoid exhausting the 15-client session mode pool (EMAXCONNSESSION).
  // In local development where port 6543 might be filtered by local ISP, prioritize DATABASE_URL.
  const isProd = Boolean(process.env.VERCEL) || process.env.NODE_ENV === 'production';
  const rawUrl = isProd
    ? (process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL)
    : (process.env.DATABASE_URL || process.env.DATABASE_URL_POOLED);

  if (!rawUrl) return undefined;

  try {
    const parsed = new URL(rawUrl);
    const isPooler =
      parsed.hostname.includes('pooler.supabase.com') ||
      parsed.hostname.includes('pooler') ||
      parsed.port === '6543' ||
      rawUrl.includes('pgbouncer=true');

    if (isPooler && !parsed.searchParams.has('pgbouncer')) {
      parsed.searchParams.set('pgbouncer', 'true');
    }

    if (!parsed.searchParams.has('connection_limit')) {
      parsed.searchParams.set('connection_limit', isProd ? '10' : '3');
    }
    if (!parsed.searchParams.has('pool_timeout')) {
      parsed.searchParams.set('pool_timeout', '20');
    }

    return parsed.toString();
  } catch {
    if (rawUrl.includes('pooler.supabase.com') && !rawUrl.includes('pgbouncer=true')) {
      return rawUrl.includes('?') ? `${rawUrl}&pgbouncer=true` : `${rawUrl}?pgbouncer=true`;
    }
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

