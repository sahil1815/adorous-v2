import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function sanitizeDbUrl(url: string): string {
  // Fix unencoded '@' characters inside the password part of the URL
  // e.g., postgresql://user:pass@word@host:port/db -> postgresql://user:pass%40word@host:port/db
  const match = url.match(/^(postgres(?:ql)?:\/\/[^:]+:)(.*)@([^@]+)$/);
  if (match) {
    const [, prefix, rawPassword, hostAndRest] = match;
    const encodedPassword = rawPassword.replace(/@/g, '%40');
    return `${prefix}${encodedPassword}@${hostAndRest}`;
  }
  return url;
}

/**
 * Normalizes PostgreSQL connection string for Supabase / PgBouncer.
 * Sets connection_limit=1 & pool_timeout=30 for serverless instances,
 * and sets pgbouncer=true on transaction pooler (port 6543).
 */
function getDatasourceUrl(): string | undefined {
  const rawUrl = process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL;
  if (!rawUrl) return undefined;

  try {
    const cleanUrl = sanitizeDbUrl(rawUrl);
    const parsed = new URL(cleanUrl);

    // Healthy connection limits for serverless instances (connection_limit=1 avoids session pool exhaustion)
    parsed.searchParams.set('connection_limit', '1');
    parsed.searchParams.set('pool_timeout', '30');

    // On transaction pooler (port 6543), pgbouncer=true is required
    if (parsed.port === '6543') {
      parsed.searchParams.set('pgbouncer', 'true');
    } else if (parsed.port === '5432') {
      parsed.searchParams.delete('pgbouncer');
    }

    return parsed.toString();
  } catch {
    return sanitizeDbUrl(rawUrl);
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
