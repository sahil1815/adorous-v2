import crypto from 'crypto';
import { cookies, headers } from 'next/headers';

function hashSha256(value: string): string {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.startsWith('880')) return digits;
  if (digits.startsWith('0')) return `88${digits}`;
  return `880${digits}`;
}

export interface MetaCapiUserData {
  email?: string | null;
  phone?: string | null;
  fullName?: string | null;
  district?: string | null;
}

export interface MetaCapiCustomData {
  currency?: string;
  value?: number;
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  contents?: Array<{ id: string; quantity: number; item_price?: number }>;
  content_type?: string;
  num_items?: number;
  order_id?: string;
}

export interface SendMetaEventParams {
  eventName: 'Purchase' | 'InitiateCheckout' | 'AddToCart' | 'ViewContent' | string;
  eventId: string; // Crucial for deduplication with browser pixel
  eventSourceUrl?: string;
  userData: MetaCapiUserData;
  customData: MetaCapiCustomData;
}

/**
 * Dispatches server-side conversion event to Meta Conversions API (CAPI).
 * Deduplicates automatically against browser Meta Pixel via event_id.
 */
export async function sendMetaCapiEvent(params: SendMetaEventParams): Promise<{ success: boolean; error?: string }> {
  const pixelId =
    process.env.META_PIXEL_ID ||
    process.env.NEXT_PUBLIC_META_PIXEL_ID ||
    process.env.FACEBOOK_PIXEL_ID ||
    process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

  const accessToken =
    process.env.META_ACCESS_TOKEN ||
    process.env.FACEBOOK_ACCESS_TOKEN ||
    process.env.META_CAPI_TOKEN;

  if (!pixelId || !accessToken) {
    // Missing credentials: safe no-op with warning
    return { success: false, error: 'Meta Pixel ID or Access Token not configured in environment' };
  }

  try {
    let clientIpAddress = '';
    let clientUserAgent = '';
    let fbc: string | undefined;
    let fbp: string | undefined;

    try {
      const headerList = await headers();
      clientIpAddress =
        headerList.get('x-forwarded-for')?.split(',')[0].trim() ||
        headerList.get('x-real-ip') ||
        '';
      clientUserAgent = headerList.get('user-agent') || '';

      const cookieStore = await cookies();
      fbc = cookieStore.get('_fbc')?.value;
      fbp = cookieStore.get('_fbp')?.value;
    } catch {
      // Headers/cookies may not be accessible in non-request contexts
    }

    const userPayload: Record<string, any> = {};

    if (params.userData.email) {
      userPayload.em = [hashSha256(params.userData.email)];
    }

    if (params.userData.phone) {
      userPayload.ph = [hashSha256(normalizePhone(params.userData.phone))];
    }

    if (params.userData.fullName) {
      const parts = params.userData.fullName.trim().split(' ');
      if (parts.length > 0) userPayload.fn = [hashSha256(parts[0])];
      if (parts.length > 1) userPayload.ln = [hashSha256(parts[parts.length - 1])];
    }

    if (params.userData.district) {
      userPayload.ct = [hashSha256(params.userData.district)];
      userPayload.country = [hashSha256('bd')];
    }

    if (clientIpAddress) userPayload.client_ip_address = clientIpAddress;
    if (clientUserAgent) userPayload.client_user_agent = clientUserAgent;
    if (fbc) userPayload.fbc = fbc;
    if (fbp) userPayload.fbp = fbp;

    const eventPayload = {
      event_name: params.eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: params.eventId,
      event_source_url: params.eventSourceUrl || 'https://adorousfashion.store/checkout',
      action_source: 'website',
      user_data: userPayload,
      custom_data: {
        currency: params.customData.currency || 'BDT',
        value: params.customData.value || 0,
        content_type: 'product',
        content_ids: params.customData.content_ids || [],
        num_items: params.customData.num_items || 1,
        ...(params.customData.contents && { contents: params.customData.contents }),
        ...(params.customData.order_id && { order_id: params.customData.order_id }),
      },
    };

    const res = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [eventPayload],
      }),
      cache: 'no-store',
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.warn('[Meta CAPI] Event dispatch warning:', res.status, errBody);
      return { success: false, error: errBody };
    }

    return { success: true };
  } catch (error: any) {
    console.error('[Meta CAPI] Error dispatching server event:', error);
    return { success: false, error: error?.message || 'Failed to dispatch Meta CAPI event' };
  }
}
