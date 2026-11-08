import { NextRequest, NextResponse } from 'next/server';
import { getPaymentSettings, updatePaymentSettings, resetPaymentSettings } from '@/app/actions/paymentSettingsActions';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getPaymentSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch payment settings' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body?.action === 'reset') {
      const result = await resetPaymentSettings();
      return NextResponse.json(result);
    }
    const result = await updatePaymentSettings(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update payment settings' },
      { status: 500 }
    );
  }
}
