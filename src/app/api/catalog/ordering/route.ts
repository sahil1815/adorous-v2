import { NextResponse } from 'next/server';
import { getAllPageOrderings } from '@/app/actions/productOrderingActions';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orderings = await getAllPageOrderings();
    return NextResponse.json(
      { success: true, orderings: orderings || {} },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ success: false, orderings: {} }, { status: 200 });
  }
}
