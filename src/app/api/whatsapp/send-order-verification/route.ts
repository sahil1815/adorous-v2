import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppOrderVerification } from '@/lib/whatsapp';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderId = body?.orderId;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'orderId parameter is required' },
        { status: 400 }
      );
    }

    const result = await sendWhatsAppOrderVerification(orderId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API send-order-verification] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
