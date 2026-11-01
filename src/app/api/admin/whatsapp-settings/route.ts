import { NextRequest, NextResponse } from 'next/server';
import { getWhatsAppSettings, updateWhatsAppVerificationTemplate, resetWhatsAppVerificationTemplate } from '@/app/actions/whatsappSettingsActions';

export async function GET() {
  try {
    const settings = await getWhatsAppSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body?.action === 'reset') {
      const result = await resetWhatsAppVerificationTemplate();
      return NextResponse.json(result);
    }

    const template = body?.template;
    if (typeof template !== 'string') {
      return NextResponse.json(
        { success: false, error: 'template string is required' },
        { status: 400 }
      );
    }

    const result = await updateWhatsAppVerificationTemplate(template);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update template' },
      { status: 500 }
    );
  }
}
