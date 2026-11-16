/**
 * Backend Storage Adapters for Editable WhatsApp Message Template System
 * 
 * Pick the adapter matching the target project's tech stack.
 */

/* ==========================================================================
   1. PRISMA ORM ADAPTER (PostgreSQL, MySQL, SQLite)
   ========================================================================== */

// schema.prisma snippet:
/*
model WhatsAppSettings {
  id                   String   @id @default("default")
  verificationTemplate String   @default("Hello {customer_name}! Greetings from our store.\n\nWe have received your Cash on Delivery order: {order_id}\n\nItems: {items}\n\nTotal Amount: ৳{total_amount}\n\nDelivery Address: {delivery_address}\n\nPlease confirm if this address is correct so we can package and dispatch your order today.")
  updatedAt            DateTime @updatedAt
  createdAt            DateTime @default(now())
}
*/

export async function prismaGetTemplate(prisma: any, defaultTemplate: string): Promise<string> {
  try {
    if (!prisma.whatsAppSettings) return defaultTemplate;
    const settings = await prisma.whatsAppSettings.findUnique({ where: { id: 'default' } });
    return settings?.verificationTemplate || defaultTemplate;
  } catch (error) {
    console.warn('[WhatsAppSettings] DB read error, using default:', error);
    return defaultTemplate;
  }
}

export async function prismaSaveTemplate(prisma: any, template: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.whatsAppSettings.upsert({
      where: { id: 'default' },
      update: { verificationTemplate: template.trim() },
      create: { id: 'default', verificationTemplate: template.trim() },
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to save template' };
  }
}

/* ==========================================================================
   2. DRIZZLE ORM ADAPTER (Postgres / MySQL)
   ========================================================================== */

/*
// schema.ts
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const whatsAppSettings = pgTable('whatsapp_settings', {
  id: text('id').primaryKey().default('default'),
  verificationTemplate: text('verification_template').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
*/

export async function drizzleGetTemplate(db: any, table: any, defaultTemplate: string): Promise<string> {
  try {
    const res = await db.select().from(table).limit(1);
    return res[0]?.verificationTemplate || defaultTemplate;
  } catch {
    return defaultTemplate;
  }
}

/* ==========================================================================
   3. MONGOOSE / MONGODB ADAPTER
   ========================================================================== */

/*
// models/WhatsAppSettings.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IWhatsAppSettings extends Document {
  id: string;
  verificationTemplate: string;
}

const WhatsAppSettingsSchema = new Schema({
  _id: { type: String, default: 'default' },
  verificationTemplate: { type: String, required: true },
}, { timestamps: true });

export const WhatsAppSettingsModel = mongoose.models.WhatsAppSettings || 
  mongoose.model<IWhatsAppSettings>('WhatsAppSettings', WhatsAppSettingsSchema);
*/

export async function mongooseGetTemplate(Model: any, defaultTemplate: string): Promise<string> {
  try {
    const doc = await Model.findById('default');
    return doc?.verificationTemplate || defaultTemplate;
  } catch {
    return defaultTemplate;
  }
}

export async function mongooseSaveTemplate(Model: any, template: string): Promise<{ success: boolean; error?: string }> {
  try {
    await Model.findByIdAndUpdate(
      'default',
      { verificationTemplate: template.trim() },
      { upsert: true, new: true }
    );
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/* ==========================================================================
   4. JSON FLAT-FILE / LOCAL STORAGE ADAPTER (Fallback without DB)
   ========================================================================== */

import fs from 'fs';
import path from 'path';

const FILE_STORAGE_PATH = path.join(process.cwd(), 'data', 'whatsapp-settings.json');

export function fileGetTemplate(defaultTemplate: string): string {
  try {
    if (fs.existsSync(FILE_STORAGE_PATH)) {
      const data = JSON.parse(fs.readFileSync(FILE_STORAGE_PATH, 'utf-8'));
      return data.verificationTemplate || defaultTemplate;
    }
  } catch (err) {
    console.warn('[WhatsAppSettings] File read error:', err);
  }
  return defaultTemplate;
}

export function fileSaveTemplate(template: string): { success: boolean; error?: string } {
  try {
    const dir = path.dirname(FILE_STORAGE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(FILE_STORAGE_PATH, JSON.stringify({
      verificationTemplate: template.trim(),
      updatedAt: new Date().toISOString()
    }, null, 2));
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}
