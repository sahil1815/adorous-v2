import { NextResponse } from 'next/server';
import { getWelcomeOfferSettings } from '@/app/actions/welcomeOfferActions';
import { DEFAULT_WELCOME_OFFER_SETTINGS } from '@/data/newVisitorOffer';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getWelcomeOfferSettings();
    return NextResponse.json(
      { success: true, settings: settings || DEFAULT_WELCOME_OFFER_SETTINGS },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { success: true, settings: DEFAULT_WELCOME_OFFER_SETTINGS },
      { status: 200 }
    );
  }
}
