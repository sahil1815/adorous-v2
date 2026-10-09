/**
 * Meta WhatsApp Cloud API Service for Adorous Fashion
 * Handles official automated WhatsApp messages for Order Verifications and Draft Order Recovery.
 */

import { formatPrice } from './formatPrice';
import { prisma } from './db';

const META_GRAPH_VERSION = 'v21.0';

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  mode?: 'template' | 'text' | 'skipped';
}

/**
 * Standardizes phone numbers to Meta E.164 without leading plus (e.g. 8801329112765).
 */
export function formatWhatsAppPhone(phone: string): string {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return '';

  // Already starts with Bangladesh country code (880)
  if (digits.startsWith('880')) {
    return digits;
  }

  // Starts with standard national 01... (e.g. 017..., 013..., 018...)
  if (digits.startsWith('0')) {
    return '880' + digits.slice(1);
  }

  // 10 digits without leading 0 (e.g. 1712345678)
  if (digits.length === 10) {
    return '880' + digits;
  }

  return digits;
}

/**
 * Low-level call to Meta WhatsApp Cloud API
 */
async function callMetaWhatsAppApi(payload: Record<string, unknown>): Promise<{
  ok: boolean;
  status: number;
  data: any;
}> {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneId || !token) {
    console.warn('[WhatsApp] Missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN in .env');
    return {
      ok: false,
      status: 400,
      data: { error: 'WhatsApp Cloud API credentials not configured in environment variables' },
    };
  }

  const endpoint = `https://graph.facebook.com/${META_GRAPH_VERSION}/${phoneId}/messages`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error('[WhatsApp API Error]', response.status, JSON.stringify(data));
  }

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}

/**
 * Sends a pre-approved Meta Template message with positional parameters.
 */
export async function sendMetaWhatsAppTemplate({
  to,
  templateName,
  languageCode = 'en_US',
  parameters,
}: {
  to: string;
  templateName: string;
  languageCode?: string;
  parameters: Array<string | number>;
}): Promise<WhatsAppSendResult> {
  const formattedPhone = formatWhatsAppPhone(to);
  if (!formattedPhone || formattedPhone.length < 8) {
    return { success: false, error: `Invalid recipient phone number: ${to}` };
  }

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: formattedPhone,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: languageCode,
      },
      components: [
        {
          type: 'body',
          parameters: parameters.map((param) => ({
            type: 'text',
            text: String(param || ''),
          })),
        },
      ],
    },
  };

  const res = await callMetaWhatsAppApi(payload);

  if (res.ok && res.data?.messages?.[0]?.id) {
    return {
      success: true,
      messageId: res.data.messages[0].id,
      mode: 'template',
    };
  }

  const errMsg = res.data?.error?.message || 'Failed to send template message via Meta API';
  return {
    success: false,
    error: errMsg,
  };
}

/**
 * Sends a direct text message (fallback or 24-hr session reply).
 */
export async function sendMetaWhatsAppText({
  to,
  text,
}: {
  to: string;
  text: string;
}): Promise<WhatsAppSendResult> {
  const formattedPhone = formatWhatsAppPhone(to);
  if (!formattedPhone || formattedPhone.length < 8) {
    return { success: false, error: `Invalid recipient phone number: ${to}` };
  }

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: formattedPhone,
    type: 'text',
    text: {
      preview_url: false,
      body: text,
    },
  };

  const res = await callMetaWhatsAppApi(payload);

  if (res.ok && res.data?.messages?.[0]?.id) {
    return {
      success: true,
      messageId: res.data.messages[0].id,
      mode: 'text',
    };
  }

  const errMsg = res.data?.error?.message || 'Failed to send direct text message via Meta API';
  return {
    success: false,
    error: errMsg,
  };
}

/**
 * Automatically sends the Order Verification WhatsApp message for a confirmed order.
 */
export async function sendWhatsAppOrderVerification(orderIdOrOrder: string | any): Promise<WhatsAppSendResult> {
  try {
    let order: any = null;

    if (typeof orderIdOrOrder === 'string') {
      order = await prisma.order.findUnique({
        where: { orderId: orderIdOrOrder },
        include: {
          customer: true,
          items: true,
        },
      });
    } else {
      order = orderIdOrOrder;
    }

    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    // Deduplication check: Do not re-send if already auto-sent
    if (order.internalNotes && order.internalNotes.includes('[WhatsApp Auto-Sent:')) {
      return { success: true, mode: 'skipped', error: 'WhatsApp verification already sent for this order.' };
    }

    const customerPhone = order.customer?.phone;
    if (!customerPhone) {
      return { success: false, error: 'Customer phone number missing' };
    }

    const customerName = order.customer?.fullName || 'Valued Patron';
    const orderRef = order.orderId;
    const itemsSummary = (order.items || [])
      .map((i: any) => {
        const prodName = i.productName || i.product?.name || 'Jewelry Piece';
        const color = i.colorName || i.selectedColor?.name || '';
        return color ? `${prodName} (${color})` : prodName;
      })
      .join(', ');

    const grandTotalFormatted = formatPrice(order.grandTotal ?? 0);
    const rawAddress = (order.customer?.address || '').trim().replace(/[\s,]+$/, '');
    const rawDistrict = (order.customer?.district || '').trim();
    const fullAddress =
      rawDistrict && !rawAddress.toLowerCase().includes(rawDistrict.toLowerCase())
        ? `${rawAddress}, ${rawDistrict}`
        : rawAddress || rawDistrict || 'Bangladesh';

    const templateName = process.env.WHATSAPP_TEMPLATE_NAME || 'order_verification';

    // 1. Try sending the official Meta template
    let result = await sendMetaWhatsAppTemplate({
      to: customerPhone,
      templateName,
      languageCode: 'en_US',
      parameters: [customerName, orderRef, itemsSummary, grandTotalFormatted, fullAddress],
    });

    // 2. If custom template failed (e.g. pending Meta approval), attempt fallback to pre-approved order template
    if (!result.success) {
      console.warn(`[WhatsApp] Template "${templateName}" failed (${result.error}). Attempting approved order confirmation template fallback.`);
      const fallbackTemplateRes = await sendMetaWhatsAppTemplate({
        to: customerPhone,
        templateName: 'jaspers_market_order_confirmation_v1',
        languageCode: 'en_US',
        parameters: [customerName, orderRef, `${fullAddress} (Total COD: ৳${grandTotalFormatted})`],
      });

      if (fallbackTemplateRes.success) {
        result = fallbackTemplateRes;
      } else {
        const fallbackText =
          `Hello ${customerName}! Greetings from Adorous Fashion.\n\n` +
          `We have received your Cash on Delivery order: ${orderRef}\n\n` +
          `Items: ${itemsSummary}\n\n` +
          `Total Amount: ৳${grandTotalFormatted}\n` +
          `Delivery Address: ${fullAddress}\n\n` +
          `Please confirm if this address is correct so we can package and dispatch your order today.`;

        const textRes = await sendMetaWhatsAppText({
          to: customerPhone,
          text: fallbackText,
        });

        if (textRes.success) {
          result = textRes;
        }
      }
    }

    // 3. If successfully delivered, record timestamp in order internal notes
    if (result.success) {
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const updatedNotes = order.internalNotes
        ? `${order.internalNotes} [WhatsApp Auto-Sent: ${timestamp}]`
        : `[WhatsApp Auto-Sent: ${timestamp}]`;

      await prisma.order.update({
        where: { orderId: order.orderId },
        data: {
          internalNotes: updatedNotes,
        },
      });
    }

    return result;
  } catch (err: any) {
    console.error('[sendWhatsAppOrderVerification] Exception:', err);
    return { success: false, error: err?.message || 'Unexpected error' };
  }
}

/**
 * Automatically sends the Draft Order Recovery WhatsApp message for an abandoned cart lead.
 */
export async function sendWhatsAppDraftRecovery(sessionIdOrDraft: string | any): Promise<WhatsAppSendResult> {
  try {
    let draft: any = null;

    if (typeof sessionIdOrDraft === 'string') {
      draft = await prisma.draftCheckout.findUnique({
        where: { sessionId: sessionIdOrDraft },
      });
    } else {
      draft = sessionIdOrDraft;
    }

    if (!draft || draft.status === 'converted') {
      return { success: false, error: 'Draft checkout not found or already converted to order' };
    }

    const customerPhone = draft.phone;
    if (!customerPhone) {
      return { success: false, error: 'Draft lead phone number missing' };
    }

    let cartItems: any[] = [];
    try {
      if (typeof draft.cartItemsJson === 'string') {
        cartItems = JSON.parse(draft.cartItemsJson);
      }
    } catch {}

    const itemsSummary = cartItems
      .map((i: any) => `${i.quantity || 1}x ${i.product?.name || 'Jewelry item'}`)
      .join(', ') || 'Fine jewellery pieces';

    const customerName = draft.fullName && draft.fullName !== 'Anonymous Visitor' ? draft.fullName : 'Customer';
    const grandTotalFormatted = formatPrice(draft.grandTotal ?? 0);

    const templateName = process.env.WHATSAPP_DRAFT_TEMPLATE_NAME || 'draft_order_recovery';

    // 1. Try sending the official Meta template
    let result = await sendMetaWhatsAppTemplate({
      to: customerPhone,
      templateName,
      languageCode: 'en_US',
      parameters: [customerName, itemsSummary, grandTotalFormatted],
    });

    // 2. If template failed, attempt direct text fallback
    if (!result.success) {
      console.warn(`[WhatsApp] Draft template "${templateName}" failed (${result.error}). Attempting direct text fallback.`);
      const fallbackText =
        `Hello ${customerName}, Assalamu Alaikum from Adorous Fashion!\n\n` +
        `We noticed you were selecting:\n` +
        `${itemsSummary}\n` +
        `Total: ৳${grandTotalFormatted}\n\n` +
        `Would you like any assistance completing your Cash on Delivery order, or would you like our team to confirm and dispatch this for you? Please let us know!`;

      const textRes = await sendMetaWhatsAppText({
        to: customerPhone,
        text: fallbackText,
      });

      if (textRes.success) {
        result = textRes;
      }
    }

    return result;
  } catch (err: any) {
    console.error('[sendWhatsAppDraftRecovery] Exception:', err);
    return { success: false, error: err?.message || 'Unexpected error' };
  }
}
