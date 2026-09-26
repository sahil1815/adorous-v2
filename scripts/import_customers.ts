import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

function parseCSV(text: string) {
  const lines = text.trim().split('\n');
  const headers = parseCSVLine(lines[0]);
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseCSVLine(lines[i]);
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h.trim()] = (values[idx] || '').trim();
    });
    rows.push(obj);
  }
  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += c;
    }
  }
  result.push(current);
  return result;
}

function cleanBdPhone(raw: string): string {
  if (!raw) return '';
  let p = raw.replace(/^'/, '').trim();
  p = p.replace(/[^\d+]/g, '');
  if (p.startsWith('+880')) p = '0' + p.slice(4);
  else if (p.startsWith('880')) p = '0' + p.slice(3);
  if (p.length === 10 && p.startsWith('1')) p = '0' + p;
  return p;
}

function cleanName(first: string, last: string): string {
  const f = (first || '').trim();
  const l = (last || '').trim();
  if (!f && !l) return 'Valued Patron';
  if (f === '-' && l === '-') return 'Valued Patron';
  if (f === '-') return l;
  if (l === '-') return f;
  if (!f) return l;
  if (!l) return f;
  if (f.toLowerCase() === l.toLowerCase()) return f;
  return `${f} ${l}`;
}

async function main() {
  console.log('🚀 Starting customer data migration to Neon PostgreSQL...');
  
  const csvPath = path.join(process.cwd(), 'scratch_customers.csv');
  if (!fs.existsSync(csvPath)) {
    throw new Error('scratch_customers.csv not found');
  }

  const rows = parseCSV(fs.readFileSync(csvPath, 'utf-8'));
  console.log(`📋 Total CSV rows loaded: ${rows.length}`);

  const defaultPasswordHash = hashPassword('AdorousPatron2026!');

  let registeredInserted = 0;
  let guestOrdersInserted = 0;

  const seenRegisteredPhones = new Set<string>();
  const seenRegisteredEmails = new Set<string>();

  for (const r of rows) {
    const rawId = r['Customer ID'].replace(/^'/, '').trim();
    const rawFirst = r['First Name'];
    const rawLast = r['Last Name'];
    const name = cleanName(rawFirst, rawLast);
    const email = (r['Email'] || '').trim().toLowerCase() || null;
    const p1 = cleanBdPhone(r['Phone']);
    const p2 = cleanBdPhone(r['Default Address Phone']);
    const phone = p1 || p2 || null;
    const address1 = r['Default Address Address1'] || '';
    const address2 = r['Default Address Address2'] || '';
    const city = r['Default Address City'] || '';
    const address = [address1, address2].filter(Boolean).join(', ') || city || 'Bangladesh';
    const district = city || 'Dhaka';
    const spent = parseFloat(r['Total Spent'] || '0') || 0;
    const ordersCount = parseInt(r['Total Orders'] || '0', 10) || 0;
    const isShopLogin = (r['Tags'] || '').includes('Login with Shop');
    const acceptsWhatsApp =
      (r['Accepts WhatsApp Marketing'] || '').toLowerCase() === 'yes' ||
      (r['Accepts SMS Marketing'] || '').toLowerCase() === 'yes';

    // ──────────────────────────────────────────────
    // 1. REGISTERED PATRONS (Shop Login or 0-order Leads)
    // ──────────────────────────────────────────────
    if (isShopLogin || ordersCount === 0) {
      if (phone && seenRegisteredPhones.has(phone)) {
        console.log(`⚠️ Skipping duplicate registered phone: ${phone} (${name})`);
        continue;
      }
      if (email && seenRegisteredEmails.has(email)) {
        console.log(`⚠️ Skipping duplicate registered email: ${email} (${name})`);
        continue;
      }

      if (phone) seenRegisteredPhones.add(phone);
      if (email) seenRegisteredEmails.add(email);

      // Check if user already exists
      let user = await prisma.customerUser.findFirst({
        where: {
          OR: [
            ...(phone ? [{ phone }] : []),
            ...(email ? [{ email }] : []),
          ],
        },
      });

      if (!user) {
        user = await prisma.customerUser.create({
          data: {
            fullName: name,
            phone,
            email,
            passwordHash: defaultPasswordHash,
            district,
            address,
            whatsappUpdates: acceptsWhatsApp,
            savedAddresses: address && address !== 'Bangladesh' ? {
              create: [
                {
                  label: 'Home',
                  recipientName: name,
                  phone: phone || '01700000000',
                  district,
                  address,
                  isDefault: true,
                },
              ],
            } : undefined,
          },
        });
        registeredInserted++;
        console.log(`✅ Created Registered Patron: ${name} (${phone || email})`);
      } else {
        console.log(`ℹ️ Patron already exists: ${name} (${phone || email})`);
      }

      // If registered user also placed orders (e.g. Sahil)
      if (ordersCount > 0 && user) {
        const orderId = `AF-LEG-${rawId}`;
        const existingOrder = await prisma.order.findUnique({ where: { orderId } });
        if (!existingOrder) {
          await prisma.order.create({
            data: {
              orderId,
              status: 'delivered',
              paymentMethod: 'Cash on Delivery',
              subtotal: spent,
              shippingFee: 0,
              grandTotal: spent,
              internalNotes: `Migrated from previous platform. Legacy Customer ID: ${rawId}`,
              customerUserId: user.id,
              customer: {
                create: {
                  fullName: name,
                  phone: phone || '01602706931',
                  email,
                  address,
                  district,
                  whatsappUpdates: acceptsWhatsApp,
                },
              },
              items: {
                create: [
                  {
                    productName: 'Atelier Curated Piece (Previous Store)',
                    productImage: '/images/hero/hero-still-life.jpg',
                    price: spent,
                    quantity: 1,
                    colorName: 'Heritage',
                    colorHex: '#DDD6CB',
                  },
                ],
              },
            },
          });
          console.log(`📦 Created linked order for patron ${name}: ${orderId}`);
        }
      }
    } 
    // ──────────────────────────────────────────────
    // 2. GUEST BUYERS (Ordered without account)
    // ──────────────────────────────────────────────
    else {
      const contactPhone = phone || (email ? email : `GUEST-${rawId}`);

      if (ordersCount === 2) {
        // Customer placed 2 orders
        const part1 = Math.round(spent / 2);
        const part2 = spent - part1;

        for (let i = 1; i <= 2; i++) {
          const orderId = `AF-LEG-${rawId}-${i}`;
          const grandTotal = i === 1 ? part1 : part2;

          const existing = await prisma.order.findUnique({ where: { orderId } });
          if (!existing) {
            await prisma.order.create({
              data: {
                orderId,
                status: 'delivered',
                paymentMethod: 'Cash on Delivery',
                subtotal: grandTotal,
                shippingFee: 0,
                grandTotal,
                internalNotes: `Migrated previous guest order ${i} of 2. Legacy Customer ID: ${rawId}`,
                customerUserId: null,
                createdAt: i === 1 ? new Date('2026-08-10T12:00:00Z') : new Date('2026-09-02T12:00:00Z'),
                customer: {
                  create: {
                    fullName: name,
                    phone: contactPhone,
                    email,
                    address,
                    district,
                    whatsappUpdates: acceptsWhatsApp,
                  },
                },
                items: {
                  create: [
                    {
                      productName: 'Atelier Curated Piece (Previous Store)',
                      productImage: '/images/hero/hero-still-life.jpg',
                      price: grandTotal,
                      quantity: 1,
                      colorName: 'Heritage',
                      colorHex: '#DDD6CB',
                    },
                  ],
                },
              },
            });
            guestOrdersInserted++;
          }
        }
        console.log(`🛍️ Created 2 guest orders for: ${name} (Total: ৳${spent})`);
      } else {
        // Customer placed 1 order
        const orderId = `AF-LEG-${rawId}`;
        const existing = await prisma.order.findUnique({ where: { orderId } });
        if (!existing) {
          await prisma.order.create({
            data: {
              orderId,
              status: 'delivered',
              paymentMethod: 'Cash on Delivery',
              subtotal: spent,
              shippingFee: 0,
              grandTotal: spent,
              internalNotes: `Migrated previous guest order. Legacy Customer ID: ${rawId}`,
              customerUserId: null,
              createdAt: new Date('2026-08-25T14:30:00Z'),
              customer: {
                create: {
                  fullName: name,
                  phone: contactPhone,
                  email,
                  address,
                  district,
                  whatsappUpdates: acceptsWhatsApp,
                },
              },
              items: {
                create: [
                  {
                    productName: 'Atelier Curated Piece (Previous Store)',
                    productImage: '/images/hero/hero-still-life.jpg',
                    price: spent,
                    quantity: 1,
                    colorName: 'Heritage',
                    colorHex: '#DDD6CB',
                  },
                ],
              },
            },
          });
          guestOrdersInserted++;
        }
      }
    }
  }

  console.log('\n🎉 Migration complete!');
  console.log(` - Registered Patrons created: ${registeredInserted}`);
  console.log(` - Guest Orders created: ${guestOrdersInserted}`);
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
