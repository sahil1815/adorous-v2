import { NextResponse } from 'next/server';
import { getAllLandingPages } from '@/app/actions/landingPageActions';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pages = await getAllLandingPages();
    return NextResponse.json(
      { success: true, pages: pages || [] },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ success: false, pages: [] }, { status: 200 });
  }
}
