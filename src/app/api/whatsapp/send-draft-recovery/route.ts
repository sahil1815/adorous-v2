import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppDraftRecovery } from '@/lib/whatsapp';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sessionId = body?.sessionId;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'sessionId parameter is required' },
        { status: 400 }
      );
    }

    const result = await sendWhatsAppDraftRecovery(sessionId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API send-draft-recovery] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
