import { NextRequest, NextResponse } from 'next/server';
import { sendMetaCapiEvent } from '@/lib/metaCapi';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventName, eventId, eventSourceUrl, userData, customData } = body;

    if (!eventName || !eventId) {
      return NextResponse.json({ success: false, error: 'Missing eventName or eventId' }, { status: 400 });
    }

    const result = await sendMetaCapiEvent({
      eventName,
      eventId,
      eventSourceUrl: eventSourceUrl || req.headers.get('referer') || undefined,
      userData: userData || {},
      customData: customData || {},
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Server error' }, { status: 500 });
  }
}
