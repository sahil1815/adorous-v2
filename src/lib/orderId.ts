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
    const orders = await db.order.findMany({
      where: { orderId: { startsWith: `AF-${year}-` } },
      select: { orderId: true },
      take: 200,
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
  } catch (err) {
    console.warn(`[orderId] Error querying max sequence from Order table for year ${year}:`, err);
    return 0;
  }
}

/**
 * Atomically generates the next continuous Order ID for the given year (or current Bangladesh year).
 * Format: AF-(year)-10001, AF-(year)-10002, AF-(year)-10003, ...
 * Uses native Prisma atomic operations on OrderSequence, fully compatible with both MySQL/MariaDB and PostgreSQL.
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

  // Query highest existing sequence in the Order table for this year
  const maxExisting = await getMaxExistingOrderSeq(year, db);
  // Base starting sequence floor is at least 10000, or the highest existing order
  let floorSeq = Math.max(10000, maxExisting);

  let attempts = 0;
  while (attempts < 50) {
    attempts++;

    try {
      const existingRecord = await db.orderSequence.findUnique({
        where: { year },
      });

      let currentSeq: number;

      if (!existingRecord) {
        // Initialize sequence for new year
        const created = await db.orderSequence.upsert({
          where: { year },
          create: {
            year,
            lastSeq: floorSeq + 1,
          },
          update: {
            lastSeq: { increment: 1 },
          },
        });
        currentSeq = created.lastSeq;
      } else if (existingRecord.lastSeq < floorSeq) {
        // Self-healing: catch up if sequence record fell behind existing orders
        const updated = await db.orderSequence.update({
          where: { year },
          data: {
            lastSeq: floorSeq + 1,
          },
        });
        currentSeq = updated.lastSeq;
      } else {
        // Standard atomic increment (works natively across MySQL, MariaDB, and PostgreSQL)
        const updated = await db.orderSequence.update({
          where: { year },
          data: {
            lastSeq: { increment: 1 },
          },
        });
        currentSeq = updated.lastSeq;
      }

      const candidateId = `AF-${year}-${currentSeq}`;

      // Verify candidateId does not clash with any pre-existing or legacy Order
      const existing = await db.order.findUnique({
        where: { orderId: candidateId },
        select: { id: true },
      });

      if (!existing) {
        return candidateId;
      }

      // If occupied, re-evaluate floor
      const latestMax = await getMaxExistingOrderSeq(year, db);
      floorSeq = Math.max(currentSeq, latestMax);
    } catch (err) {
      if (attempts >= 50) throw err;
      await new Promise((r) => setTimeout(r, 20 * attempts));
    }
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
