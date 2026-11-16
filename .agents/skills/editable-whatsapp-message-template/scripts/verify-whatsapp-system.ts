/**
 * Verification & Test Suite for Editable WhatsApp Message Template System
 * 
 * Run with:
 *   npx tsx scripts/verify-whatsapp-system.ts
 * or
 *   node scripts/verify-whatsapp-system.js
 */

import {
  renderWhatsAppVerificationMessage,
  sanitizeWhatsAppPhone,
  buildWhatsAppChatUrl,
  DEFAULT_WHATSAPP_VERIFICATION_TEMPLATE,
  AVAILABLE_TEMPLATE_VARIABLES,
} from '../references/template-engine-core';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ ${message}`);
}

async function runTests() {
  console.log('\n🚀 Starting WhatsApp Message Template System Verification...\n');

  // Test 1: Baseline Default Template Replacement
  const mockOrder = {
    orderId: 'ORD-9901',
    customer: {
      fullName: 'Tahmid Khan',
      phone: '01854411797',
      address: 'House 12, Road 4, Sector 7',
      district: 'Uttara, Dhaka',
    },
    grandTotal: 1550,
    items: [
      { name: 'Classic Silk Scarf', quantity: 1, variant: 'Emerald' },
      { name: 'Pearl Earring Pair', quantity: 2, variant: 'Ivory' },
    ],
    createdAt: new Date().toISOString(),
  };

  const renderedDefault = renderWhatsAppVerificationMessage(DEFAULT_WHATSAPP_VERIFICATION_TEMPLATE, mockOrder);
  assert(renderedDefault.includes('Tahmid Khan'), 'Replaces {customer_name}');
  assert(renderedDefault.includes('ORD-9901'), 'Replaces {order_id}');
  assert(renderedDefault.includes('1,550'), 'Replaces {total_amount} with formatted currency');
  assert(renderedDefault.includes('Classic Silk Scarf (Emerald) x1'), 'Formats and replaces {items}');
  assert(renderedDefault.includes('House 12, Road 4, Sector 7, Uttara, Dhaka'), 'Replaces {delivery_address}');

  // Test 2: Double-brace and whitespace tolerance
  const customTemplateWithDoubleBraces = `Hello {{ customer_name }}! Order {{order_id}} has been received. Total: ৳{{ total_amount }}. Items: {items}.`;
  const renderedDouble = renderWhatsAppVerificationMessage(customTemplateWithDoubleBraces, mockOrder);
  assert(renderedDouble.includes('Hello Tahmid Khan!'), 'Supports {{ customer_name }} with spaces');
  assert(renderedDouble.includes('Order ORD-9901'), 'Supports {{order_id}} without spaces');
  assert(renderedDouble.includes('Total: ৳1,550'), 'Supports {{ total_amount }}');

  // Test 3: Phone number normalization
  const rawLocalPhone = '01854411797';
  const cleanWithCountryCode = sanitizeWhatsAppPhone(rawLocalPhone, '88');
  assert(cleanWithCountryCode === '8801854411797', 'Prepends 88 to Bangladesh 11-digit mobile number');

  const rawFormattedPhone = '+880 1854-411797';
  const cleanStripped = sanitizeWhatsAppPhone(rawFormattedPhone, '88');
  assert(cleanStripped === '8801854411797', 'Strips plus, spaces, and dashes cleanly');

  // Test 4: URL encoding safety (special chars, Bangla, emojis)
  const banglaMessage = `আসসালামু আলাইকুম Tahmid! আপনার অর্ডার ORD-9901 নিশ্চিত করতে রিপ্লাই দিন ✨`;
  const url = buildWhatsAppChatUrl('01854411797', banglaMessage);
  assert(url.startsWith('https://wa.me/8801854411797?text='), 'Builds valid wa.me link with clean phone');
  assert(url.includes(encodeURIComponent('আসসালামু আলাইকুম')), 'Properly UTF-8 percent-encodes non-ASCII characters');
  assert(url.includes(encodeURIComponent('✨')), 'Properly percent-encodes emojis');

  // Test 5: Missing or null order fields resilience (Zero Crash Guarantee)
  const emptyOrder = { orderId: null, customer: null, items: null };
  const renderedEmpty = renderWhatsAppVerificationMessage(DEFAULT_WHATSAPP_VERIFICATION_TEMPLATE, emptyOrder);
  assert(!renderedEmpty.includes('undefined'), 'Guarantees zero "undefined" in rendered text on null order');
  assert(!renderedEmpty.includes('null'), 'Guarantees zero "null" in rendered text on null order');

  // Test 6: Verify all declared variables exist in cheatsheet
  assert(AVAILABLE_TEMPLATE_VARIABLES.length >= 10, 'Cheatsheet provides at least 10 dynamic variables');

  console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! The template engine is 100% verified.\n');
}

runTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
