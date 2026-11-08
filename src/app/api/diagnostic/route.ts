import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const rawDbUrl = process.env.DATABASE_URL || '';
  const rawPooledUrl = process.env.DATABASE_URL_POOLED || '';

  // Mask passwords for safety
  const mask = (u: string) => u.replace(/:([^:@]+)@/, ':***@');

  const diagnostics: Record<string, any> = {
    timestamp: new Date().toISOString(),
    env: {
      hasDatabaseUrl: Boolean(rawDbUrl),
      databaseUrlMasked: mask(rawDbUrl),
      hasDatabaseUrlPooled: Boolean(rawPooledUrl),
      databaseUrlPooledMasked: mask(rawPooledUrl),
      nodeEnv: process.env.NODE_ENV,
    },
    tests: {},
  };

  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1 as connected`;
    diagnostics.tests.rawQuery = {
      success: true,
      durationMs: Date.now() - start,
    };
  } catch (err: any) {
    diagnostics.tests.rawQuery = {
      success: false,
      errorName: err?.name,
      errorMessage: err?.message,
      errorCode: err?.code,
    };
  }

  try {
    const [ordersCount, productsCount, paymentSettings] = await Promise.all([
      prisma.order.count(),
      prisma.product.count(),
      prisma.paymentSettings.findUnique({ where: { id: 'default' } }),
    ]);

    diagnostics.tests.data = {
      success: true,
      ordersCount,
      productsCount,
      hasPaymentSettings: Boolean(paymentSettings),
    };
  } catch (err: any) {
    diagnostics.tests.data = {
      success: false,
      errorName: err?.name,
      errorMessage: err?.message,
      errorCode: err?.code,
    };
  }

  return NextResponse.json(diagnostics, { status: 200 });
}
