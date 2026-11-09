import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { PRODUCTS } from '@/data/catalogue';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const includeHidden = searchParams.get('includeHidden') === 'true';

    let products: any[] = [];
    try {
      const whereClause = includeHidden ? {} : { isHidden: false };
      products = await prisma.product.findMany({
        where: whereClause,
        include: {
          colorways: true,
          galleryImages: true,
          details: true,
          piecesIncluded: true,
        },
        orderBy: [{ featuredRank: 'asc' }, { createdAt: 'asc' }],
      });
    } catch (dbErr) {
      console.warn('[/api/products] DB query error, falling back to static catalogue:', dbErr);
      products = PRODUCTS.filter((p) => includeHidden || !p.isHidden);
    }

    if (!products || products.length === 0) {
      products = PRODUCTS.filter((p) => includeHidden || !p.isHidden);
    }

    const sanitizedProducts = products.map((p) => ({
      ...p,
      price: Math.round(Number(p.price)),
      originalPrice: p.originalPrice ? Math.round(Number(p.originalPrice)) : null,
      discount: p.discount !== undefined && p.discount !== null ? Math.round(Number(p.discount)) : null,
    }));

    return NextResponse.json({
      success: true,
      count: sanitizedProducts.length,
      products: sanitizedProducts,
    });
  } catch (error: any) {
    console.error('[/api/products] Fatal error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        count: PRODUCTS.length,
        products: PRODUCTS,
      },
      { status: 500 }
    );
  }
}
