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
 * Helper to safely query the maximum order sequence number already present
 * in the Order table for a given year (e.g. from 'AF-2026-10130' -> 10130).
 */
async function getMaxExistingOrderSeq(
  year: number,
  db: Prisma.TransactionClient | typeof prisma
): Promise<number> {
  try {
    const rows = await db.$queryRawUnsafe<{ maxSeq: string | number }[]>(
      `SELECT COALESCE(MAX(CAST(SUBSTRING("orderId" FROM '^AF-' || $1 || '-([0-9]+)$') AS BIGINT)), 0)::text as "maxSeq"
       FROM "Order"
       WHERE "orderId" LIKE 'AF-' || $1 || '-%'`,
      year
    );
    const parsed = parseInt(String(rows[0]?.maxSeq || '0'), 10);
    return isNaN(parsed) ? 0 : parsed;
  } catch (err) {
    console.warn(`[orderId] Error querying max sequence from Order table for year ${year}:`, err);
    try {
      const orders = await db.order.findMany({
        where: { orderId: { startsWith: `AF-${year}-` } },
        select: { orderId: true },
        take: 100,
        orderBy: { createdAt: 'desc' },
      });
      let maxSeq = 0;
      for (const o of orders) {
        const match = o.orderId.match(new RegExp(`^AF-${year}-(\\d+)$`));
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
      return maxSeq;
    } catch {
      return 0;
    }
  }
}

/**
 * Atomically generates the next continuous Order ID for the given year (or current Bangladesh year).
 * Format: AF-(year)-10001, AF-(year)-10002, AF-(year)-10003, ...
 * Uses PostgreSQL row-level atomic UPSERT on "OrderSequence" to prevent race conditions,
 * duplicate IDs, or numbering gaps.
 * 
 * Self-healing: If "OrderSequence" is ever missing, reset, or falls behind existing orders
 * (e.g. after a backup restore, legacy data import, or manual inserts), it automatically
 * synchronizes with the highest existing sequence in the "Order" table and proceeds smoothly.
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

  // Query highest existing sequence in the Order table for this year
  const maxExisting = await getMaxExistingOrderSeq(year, db);
  // Base starting sequence floor is at least 10000, or the highest existing order
  let floorSeq = Math.max(10000, maxExisting);
  let initialSeq = floorSeq + 1;

  let attempts = 0;
  while (attempts < 50) {
    attempts++;

    // Atomic increment/upsert in PostgreSQL
    // If no row for this year exists, initialize at initialSeq (>= 10001 and > maxExisting).
    // If row exists, ensure it is at least floorSeq, then increment by 1.
    const rows = await db.$queryRawUnsafe<{ lastSeq: number }[]>(
      `
      INSERT INTO "OrderSequence" ("year", "lastSeq")
      VALUES ($1, $2)
      ON CONFLICT ("year")
      DO UPDATE SET "lastSeq" = GREATEST("OrderSequence"."lastSeq", $3) + 1
      RETURNING "lastSeq";
      `,
      year,
      initialSeq,
      floorSeq
    );

    const seq = Number(rows[0]?.lastSeq);
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

    // In the rare event candidateId was already occupied, re-evaluate floorSeq
    const latestMax = await getMaxExistingOrderSeq(year, db);
    floorSeq = Math.max(seq, latestMax);
    initialSeq = floorSeq + 1;
  }

  // Emergency deterministic fallback (only reached if 50 attempts somehow failed)
  const emergencySeq = Math.max(floorSeq + 50, Date.now() % 1000000);
  return `AF-${year}-${emergencySeq}`;
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
