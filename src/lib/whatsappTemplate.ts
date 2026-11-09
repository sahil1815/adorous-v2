import { formatPrice } from './formatPrice';

export const DEFAULT_WHATSAPP_VERIFICATION_TEMPLATE = `Hello {customer_name}! Greetings from Adorous Fashion.

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
    name: 'Adorous Standard (Default)',
    badge: 'Recommended',
    description: 'Polite, clear, and comprehensive verification in English with full order breakdown.',
    template: DEFAULT_WHATSAPP_VERIFICATION_TEMPLATE,
  },
  {
    id: 'bilingual-bangla',
    name: 'Bilingual (Bangla & English)',
    badge: 'High Conversion',
    description: 'Friendly Bangla greeting and instructions with English identifiers for high local trust.',
    template: `আসসালামু আলাইকুম {customer_name}! Adorous Fashion থেকে আপনার অর্ডারটি কনফার্ম করতে যোগাযোগ করছি।

অর্ডার আইডি: {order_id}
আইটেম: {items}
মোট ক্যাশ অন ডেলিভারি: ৳{total_amount}
ডেলিভারি ঠিকানা: {delivery_address}

অর্ডারটি দ্রুত প্যাকেজিং ও পাঠানোর জন্য আপনার ঠিকানা ও ফোন নম্বর সঠিক থাকলে অনুগ্রহ করে 'Yes' লিখে রিপ্লাই দিন। ধন্যবাদ!`,
  },
  {
    id: 'concise-direct',
    name: 'Concise & Fast Dispatch',
    badge: 'Quick Action',
    description: 'Short and crisp message focused directly on confirmation for busy patrons.',
    template: `Hello {customer_name}! Thank you for ordering from Adorous Fashion.

Your Order {order_id} (Total: ৳{total_amount}) is awaiting dispatch.
Items: {items}
Delivery: {delivery_address}

Please reply with "CONFIRM" to dispatch your package today!`,
  },
  {
    id: 'vip-atelier',
    name: 'VIP Atelier Luxury',
    badge: 'Elevated Tone',
    description: 'Ultra-luxurious, handcrafted tone highlighting keepsake packaging and care.',
    template: `Dearest {customer_name},

Greetings from the Adorous Fashion Atelier. We are delighted to prepare your order {order_id}.

Curated Pieces:
{items_detailed}

• Total Payable (COD): ৳{total_amount}
• Destination: {delivery_address}

Your jewelry is being packaged in our signature keepsake box. Kindly confirm your delivery address to schedule priority dispatch today.`,
  },
];

export interface WhatsAppTemplateVariable {
  key: string;
  description: string;
  example: string;
}

export const AVAILABLE_TEMPLATE_VARIABLES: WhatsAppTemplateVariable[] = [
  { key: '{customer_name}', description: 'Customer full name (or fallback)', example: 'MD RIFAT MOZUMDER' },
  { key: '{order_id}', description: 'Order ID reference', example: 'AF-2026-10087' },
  { key: '{items}', description: 'Compact list of items and colors', example: 'Luxe Crystal Gemstone Suite (Silver White) x1' },
  { key: '{items_detailed}', description: 'Bulleted list of items with unit price and color', example: '• Luxe Crystal Gemstone Suite (Silver White) - Qty: 1 - ৳1,149' },
  { key: '{total_amount}', description: 'Formatted final payable amount (without currency symbol)', example: '999' },
  { key: '{subtotal}', description: 'Formatted subtotal before delivery & discount', example: '1,149' },
  { key: '{shipping_fee}', description: 'Delivery charge amount', example: '80' },
  { key: '{discount}', description: 'Discount / voucher savings (if applicable)', example: '230' },
  { key: '{delivery_address}', description: 'Complete cleaned street address and district', example: '7/5, bosir uddin road, kalabagan, North Dhanmondi, Dhaka (Metro & Greater)' },
  { key: '{district}', description: 'Delivery district / city', example: 'Dhaka (Metro & Greater)' },
  { key: '{customer_phone}', description: 'Customer contact phone number', example: '+8801854411797' },
  { key: '{date}', description: 'Formatted order placement date', example: 'Nov 1, 2026' },
];

/**
 * Normalizes customer address by appending district if not already included.
 */
export function formatFullDeliveryAddress(rawAddress?: string | null, rawDistrict?: string | null): string {
  const cleanAddress = (rawAddress || '').trim().replace(/[\s,]+$/, '');
  const cleanDistrict = (rawDistrict || '').trim();

  if (!cleanAddress && !cleanDistrict) return 'Bangladesh';
  if (!cleanAddress) return cleanDistrict;
  if (!cleanDistrict) return cleanAddress;

  if (cleanAddress.toLowerCase().includes(cleanDistrict.toLowerCase())) {
    return cleanAddress;
  }
  return `${cleanAddress}, ${cleanDistrict}`;
}

/**
 * Formats a phone number for WhatsApp wa.me links, ensuring Bangladesh country code (880).
 */
export function sanitizeWhatsAppPhone(phone?: string | null): string {
  if (!phone) return '';
  let digits = phone.replace(/[^0-9]/g, '');
  if (digits.startsWith('01') && digits.length === 11) {
    digits = '88' + digits;
  }
  return digits;
}

/**
 * Builds the wa.me click-to-chat URL with properly encoded message text.
 */
export function buildWhatsAppChatUrl(phone: string, text: string): string {
  const cleanPhone = sanitizeWhatsAppPhone(phone);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Renders a verification template using the provided order entity.
 * Supports both {key} and {{key}} formatting, case-insensitively.
 */
export function renderWhatsAppVerificationMessage(template: string | null | undefined, order: any): string {
  const rawTemplate = (template && template.trim().length > 0)
    ? template
    : DEFAULT_WHATSAPP_VERIFICATION_TEMPLATE;

  if (!order) return rawTemplate;

  const customerName = order.customer?.fullName || 'Valued Patron';
  const orderId = order.orderId || 'Order';
  const phone = order.customer?.phone || '';
  const district = order.customer?.district || '';
  const deliveryAddress = formatFullDeliveryAddress(order.customer?.address, order.customer?.district);
  
  const grandTotal = formatPrice(order.grandTotal ?? 0);
  const subtotal = formatPrice(order.subtotal ?? 0);
  const shippingFee = formatPrice(order.shippingFee ?? 0);
  const discount = order.discountAmount ? formatPrice(order.discountAmount) : '0';

  // Format compact items string
  const items = (order.items || [])
    .map((item: any) => {
      const name = item.product?.name || item.productName || 'Item';
      const color = item.selectedColor?.name || item.colorName || '';
      const size = item.selectedSize ? ` [${item.selectedSize}]` : '';
      const note = item.customNote ? ` (Note: ${item.customNote})` : '';
      const qty = item.quantity ? ` x${item.quantity}` : '';
      const variant = color ? ` (${color}${size})` : (size ? ` (${size})` : '');
      return `${name}${variant}${note}${qty}`;
    })
    .join(', ') || 'Pieces from Adorous Fashion';

  // Format detailed items list
  const itemsDetailed = (order.items || [])
    .map((item: any) => {
      const name = item.product?.name || item.productName || 'Item';
      const color = item.selectedColor?.name || item.colorName || '';
      const size = item.selectedSize ? ` - Size: ${item.selectedSize}` : '';
      const note = item.customNote ? ` - Note: "${item.customNote}"` : '';
      const qty = item.quantity ?? 1;
      const unitPrice = item.product?.price || item.price ? `৳${formatPrice(item.product?.price || item.price)}` : '';
      const variant = color ? ` (${color})` : '';
      return `• ${name}${variant}${size} - Qty: ${qty}${unitPrice ? ` - ${unitPrice}` : ''}${note}`;
    })
    .join('\n') || `• ${items}`;

  // Format date
  let formattedDate = 'Recent';
  try {
    if (order.createdAt) {
      formattedDate = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(order.createdAt));
    }
  } catch {
    formattedDate = 'Recent';
  }

  // Replacements map
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

  // Replace each placeholder: supports both {var} and {{var}} with whitespace flexibility
  for (const [key, val] of Object.entries(replacements)) {
    const pattern = new RegExp(`\\{\\{?\\s*${key}\\s*\\}?}`, 'gi');
    rendered = rendered.replace(pattern, val);
  }

  return rendered;
}

export const SAMPLE_PREVIEW_ORDER = {
  orderId: 'AF-2026-10087',
  createdAt: new Date().toISOString(),
  status: 'pending',
  customer: {
    fullName: 'MD RIFAT MOZUMDER',
    phone: '+8801854411797',
    address: '7/5, bosir uddin road, kalabagan, North Dhanmondi',
    district: 'Dhaka (Metro & Greater)',
    whatsappUpdates: true,
  },
  items: [
    {
      product: {
        id: 'sample-piece-1',
        name: 'Luxe Crystal Gemstone Suite (2-Piece Set)',
        category: 'jewelry',
        slug: 'luxe-crystal-gemstone-suite',
        price: 1149,
        featuredImage: '/images/products/jewelry-zari-choker.jpg',
      },
      selectedColor: {
        name: 'Silver White',
        hex: '#E5E7EB',
      },
      quantity: 1,
    },
  ],
  subtotal: 1149,
  shippingFee: 80,
  discountAmount: 230,
  couponCode: 'NEW_VISITOR',
  grandTotal: 999,
};
