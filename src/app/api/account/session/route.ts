import { NextResponse } from 'next/server';
import { getCurrentCustomerAction } from '@/app/actions/customerAuthActions';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const customer = await getCurrentCustomerAction();
    return NextResponse.json(
      { success: true, customer },
      {
        headers: {
          'Cache-Control': 'no-store, private',
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ success: false, customer: null }, { status: 200 });
  }
}
