/**
 * Standalone Reference Implementation: Universal WhatsApp Template Engine
 * 
 * Can be dropped directly into any TypeScript/JavaScript project.
 * Handles:
 *  - Dynamic placeholder replacements ({key} and {{key}}, case-insensitive)
 *  - Phone number normalization (E.164 without plus, Bangladesh 880 detection, international codes)
 *  - wa.me Click-to-chat URL building with proper UTF-8 URI encoding
 *  - Fallbacks so missing properties never render 'undefined' or crash the app
 */

export const DEFAULT_WHATSAPP_VERIFICATION_TEMPLATE = `Hello {customer_name}! Greetings from our store.

We have received your Cash on Delivery order: {order_id}

Items: {items}

Total Amount: ৳{total_amount}

Delivery Address: {delivery_address}

Please confirm if this address is correct so we can package and dispatch your order today.`;

export interface WhatsAppTemplatePreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  template: string;
}

export const WHATSAPP_TEMPLATE_PRESETS: WhatsAppTemplatePreset[] = [
  {
    id: 'standard-luxury',
    name: 'Standard Order Verification',
    badge: 'Recommended',
    description: 'Polite, clear, and comprehensive verification in English with full order breakdown.',
    template: DEFAULT_WHATSAPP_VERIFICATION_TEMPLATE,
  },
  {
    id: 'bilingual-local',
    name: 'Bilingual (Local Language & English)',
    badge: 'High Conversion',
    description: 'Local language greeting and instructions combined with English order identifiers for maximum trust.',
    template: `আসসালামু আলাইকুম {customer_name}! আপনার অর্ডারটি নিশ্চিত করতে যোগাযোগ করছি।

অর্ডার আইডি: {order_id}
আইটেম: {items}
মোট ক্যাশ অন ডেলিভারি: ৳{total_amount}
ডেলিভারি ঠিকানা: {delivery_address}

অর্ডারটি দ্রুত ডেলিভারি করার জন্য আপনার ঠিকানা ও ফোন নম্বর সঠিক থাকলে অনুগ্রহ করে 'Yes' লিখে রিপ্লাই দিন। ধন্যবাদ!`,
  },
  {
    id: 'concise-direct',
    name: 'Concise & Fast Dispatch',
    badge: 'Quick Action',
    description: 'Short and crisp message focused directly on rapid confirmation for busy patrons.',
    template: `Hello {customer_name}! Thank you for your order.

Your Order {order_id} (Total: ৳{total_amount}) is awaiting dispatch.
Items: {items}
Delivery: {delivery_address}

Please reply with "CONFIRM" to dispatch your package today!`,
  },
  {
    id: 'vip-atelier',
    name: 'VIP / Luxury Atelier',
    badge: 'Elevated Tone',
    description: 'Ultra-luxurious, handcrafted tone highlighting custom packaging and care.',
    template: `Dearest {customer_name},

We are delighted to prepare your order {order_id}.

Curated Pieces:
{items_detailed}

• Total Payable (COD): ৳{total_amount}
• Destination: {delivery_address}

Your package is being prepared with special care. Kindly confirm your delivery address to schedule priority dispatch today.`,
  },
];

export interface WhatsAppTemplateVariable {
  key: string;
  description: string;
  example: string;
}

export const AVAILABLE_TEMPLATE_VARIABLES: WhatsAppTemplateVariable[] = [
  { key: '{customer_name}', description: 'Customer full name (or fallback)', example: 'MD RIFAT MOZUMDER' },
  { key: '{order_id}', description: 'Order ID / reference number', example: 'AF-2026-10087' },
  { key: '{items}', description: 'Compact list of items and colors/sizes', example: 'Luxe Crystal Suite (Silver) x1' },
  { key: '{items_detailed}', description: 'Bulleted multi-line list of items with unit price', example: '• Luxe Crystal Suite (Silver) - Qty: 1 - ৳1,149' },
  { key: '{total_amount}', description: 'Formatted final grand total', example: '999.20' },
  { key: '{subtotal}', description: 'Formatted subtotal before delivery & discount', example: '1,149' },
  { key: '{shipping_fee}', description: 'Delivery / shipping charge', example: '80' },
  { key: '{discount}', description: 'Discount savings (if any)', example: '229.80' },
  { key: '{delivery_address}', description: 'Complete cleaned street address and district/city', example: '7/5, Bosir Uddin Road, Dhanmondi, Dhaka' },
  { key: '{district}', description: 'Delivery district / city / state', example: 'Dhaka (Metro & Greater)' },
  { key: '{customer_phone}', description: 'Customer phone number', example: '+8801854411797' },
  { key: '{date}', description: 'Formatted order placement date', example: 'Nov 16, 2026' },
];

/**
 * Sanitizes phone numbers for wa.me links.
 * Strips non-digits, normalizes local numbers to international format (e.g. Bangladesh 01XXXXXXXXX -> 8801XXXXXXXXX).
 */
export function sanitizeWhatsAppPhone(phone?: string | null, defaultCountryPrefix: string = '88'): string {
  if (!phone) return '';
  let digits = String(phone).replace(/[^0-9]/g, '');
  
  // Specific country prefix normalization (e.g., Bangladesh local 11-digit numbers starting with 01)
  if (defaultCountryPrefix === '88' && digits.startsWith('01') && digits.length === 11) {
    digits = '88' + digits;
  }
  return digits;
}

/**
 * Generates the WhatsApp Click-to-Chat URL safely.
 */
export function buildWhatsAppChatUrl(phone: string, text: string, defaultCountryPrefix: string = '88'): string {
  const cleanPhone = sanitizeWhatsAppPhone(phone, defaultCountryPrefix);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Formats a currency number with comma separation and clean decimal handling.
 */
export function formatCurrencyValue(val: number | string | null | undefined): string {
  const num = Number(val);
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Normalizes customer address by combining address line and city/district cleanly.
 */
export function formatFullDeliveryAddress(rawAddress?: string | null, rawDistrict?: string | null): string {
  const cleanAddress = (rawAddress || '').trim().replace(/[\s,]+$/, '');
  const cleanDistrict = (rawDistrict || '').trim();

  if (!cleanAddress && !cleanDistrict) return 'Customer Address';
  if (!cleanAddress) return cleanDistrict;
  if (!cleanDistrict) return cleanAddress;

  if (cleanAddress.toLowerCase().includes(cleanDistrict.toLowerCase())) {
    return cleanAddress;
  }
  return `${cleanAddress}, ${cleanDistrict}`;
}

/**
 * Core Universal Template Renderer.
 * Supports:
 *  - Both {key} and {{key}} syntax
 *  - Whitespace tolerance e.g. { customer_name }
 *  - Case-insensitivity e.g. {Customer_Name}
 *  - Zero crash guarantee on null/undefined input
 */
export function renderWhatsAppVerificationMessage(template: string | null | undefined, order: any): string {
  const rawTemplate = (template && template.trim().length > 0)
    ? template
    : DEFAULT_WHATSAPP_VERIFICATION_TEMPLATE;

  if (!order) return rawTemplate;

  const customerName = order.customer?.fullName || order.customer?.name || order.customerName || 'Valued Patron';
  const orderId = order.orderId || order.id || 'Order';
  const phone = order.customer?.phone || order.phone || '';
  const district = order.customer?.district || order.customer?.city || order.district || '';
  const deliveryAddress = formatFullDeliveryAddress(
    order.customer?.address || order.address,
    order.customer?.district || order.customer?.city || order.district
  );
  
  const grandTotal = formatCurrencyValue(order.grandTotal ?? order.total ?? order.totalAmount ?? 0);
  const subtotal = formatCurrencyValue(order.subtotal ?? 0);
  const shippingFee = formatCurrencyValue(order.shippingFee ?? order.shippingCharge ?? order.deliveryFee ?? 0);
  const discount = order.discountAmount ? formatCurrencyValue(order.discountAmount) : '0';

  // Compact items string
  const rawItems = order.items || order.orderItems || [];
  const items = (rawItems.length > 0)
    ? rawItems.map((item: any) => {
        const name = item.product?.name || item.productName || item.name || 'Item';
        const variant = item.selectedColor?.name || item.colorName || item.variant || item.color || '';
        const qty = item.quantity ? ` x${item.quantity}` : '';
        return variant ? `${name} (${variant})${qty}` : `${name}${qty}`;
      }).join(', ')
    : 'Ordered Pieces';

  // Detailed items list
  const itemsDetailed = (rawItems.length > 0)
    ? rawItems.map((item: any) => {
        const name = item.product?.name || item.productName || item.name || 'Item';
        const variant = item.selectedColor?.name || item.colorName || item.variant || item.color || '';
        const qty = item.quantity ?? 1;
        const price = item.product?.price || item.price;
        const formattedPrice = price ? ` - ৳${formatCurrencyValue(price)}` : '';
        const variantText = variant ? ` (${variant})` : '';
        return `• ${name}${variantText} - Qty: ${qty}${formattedPrice}`;
      }).join('\n')
    : `• ${items}`;

  // Formatted date
  let formattedDate = 'Recent';
  try {
    const rawDate = order.createdAt || order.date;
    if (rawDate) {
      formattedDate = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(rawDate));
    }
  } catch {
    formattedDate = 'Recent';
  }

  const replacements: Record<string, string> = {
    customer_name: customerName,
    order_id: orderId,
    items: items,
    items_detailed: itemsDetailed,
    total_amount: grandTotal,
    subtotal: subtotal,
    shipping_fee: shippingFee,
    discount: discount,
    delivery_address: deliveryAddress,
    district: district,
    customer_phone: phone,
    phone: phone,
    date: formattedDate,
  };

  let rendered = rawTemplate;

  for (const [key, val] of Object.entries(replacements)) {
    // Matches {key}, {{key}}, { key }, {{ key }} case-insensitively
    const pattern = new RegExp(`\\{\\{?\\s*${key}\\s*\\}?}`, 'gi');
    rendered = rendered.replace(pattern, val);
  }

  return rendered;
}
