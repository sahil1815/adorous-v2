import { NextRequest, NextResponse } from 'next/server';
import { getWelcomeOfferSettings, updateWelcomeOfferSettings } from '@/app/actions/welcomeOfferActions';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getWelcomeOfferSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch welcome offer settings' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await updateWelcomeOfferSettings(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update welcome offer settings' },
      { status: 500 }
    );
  }
}
