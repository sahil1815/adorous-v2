import { prisma } from './db';
import { Prisma } from '@prisma/client';

/**
 * Returns current 4-digit year in Bangladesh time zone (Asia/Dhaka, UTC+6).
 */
export function getCurrentBangladeshYear(): number {
  try {
    const yearStr = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Dhaka',
      year: 'numeric',
    }).format(new Date());
    const parsed = parseInt(yearStr, 10);
    return isNaN(parsed) ? new Date().getFullYear() : parsed;
  } catch {
    return new Date().getFullYear();
  }
}

/**
 * Atomically generates the next continuous Order ID for the given year (or current Bangladesh year).
 * Format: AF-(year)-10001, AF-(year)-10002, AF-(year)-10003, ...
 * Uses PostgreSQL row-level atomic UPSERT on "OrderSequence" to prevent race conditions,
 * duplicate IDs, or numbering gaps.
 */
export async function generateNextOrderId(
  forcedYear?: number,
  client?: Prisma.TransactionClient | typeof prisma
): Promise<string> {
  const db = client || prisma;
  const year = forcedYear || getCurrentBangladeshYear();

  // Ensure table exists (self-healing if migrations have not run yet)
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "OrderSequence" (
      "year" INTEGER NOT NULL,
      "lastSeq" INTEGER NOT NULL,
      CONSTRAINT "OrderSequence_pkey" PRIMARY KEY ("year")
    );
  `);

  let attempts = 0;
  while (attempts < 20) {
    attempts++;

    // Atomic increment/upsert in PostgreSQL
    // If no row for this year exists, initialize at 10001.
    // If row exists, increment by 1.
    const rows = await db.$queryRawUnsafe<{ lastSeq: number }[]>(
      `
      INSERT INTO "OrderSequence" ("year", "lastSeq")
      VALUES ($1, 10001)
      ON CONFLICT ("year")
      DO UPDATE SET "lastSeq" = "OrderSequence"."lastSeq" + 1
      RETURNING "lastSeq";
      `,
      year
    );

    const seq = rows[0]?.lastSeq;
    if (!seq) {
      throw new Error(`Failed to generate sequence for year ${year}`);
    }

    const candidateId = `AF-${year}-${seq}`;

    // Verify candidateId does not clash with any pre-existing or legacy Order
    const existing = await db.order.findUnique({
      where: { orderId: candidateId },
      select: { id: true },
    });

    if (!existing) {
      return candidateId;
    }
    // If it already exists in Order table, the while-loop atomically increments again
  }

  throw new Error(`Failed to allocate a unique order ID for year ${year} after multiple attempts.`);
}

/**
 * Checks if a given string matches the valid AF Order ID format:
 * e.g. AF-2026-10001, AF-2026-9529, or AF-LEG-XXXX
 */
export function isValidOrderId(orderId: string): boolean {
  if (!orderId || typeof orderId !== 'string') return false;
  const trimmed = orderId.trim();
  // Standard format: AF-YYYY-NNNN+
  if (/^AF-\d{4}-\d{4,}$/.test(trimmed)) return true;
  // Legacy format: AF-LEG-...
  if (/^AF-LEG-/.test(trimmed)) return true;
  return false;
}
