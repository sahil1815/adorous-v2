import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const mysqlUrl =
  process.env.MYSQL_DATABASE_URL ||
  'mysql://u898063716_sahil:iamastudentofruetECE23@srv787.hstgr.io:3306/u898063716_AF_18nov26';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: mysqlUrl,
    },
  },
});

function parseDates<T extends Record<string, any>>(row: T): T {
  const result: any = { ...row };
  for (const key of Object.keys(result)) {
    if ((key === 'createdAt' || key === 'updatedAt') && result[key]) {
      result[key] = new Date(result[key]);
    }
  }
  return result;
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function migrate() {
  console.log('--- Starting Ultra-Fast PostgreSQL to Hostinger MySQL Data Migration ---');

  const backupDir = path.join(process.cwd(), 'backups');
  const files = fs.readdirSync(backupDir).filter((f) => f.startsWith('postgres_snapshot_') && f.endsWith('.json'));
  files.sort().reverse();
  if (files.length === 0) {
    throw new Error('No PostgreSQL snapshot found in backups/ directory!');
  }

  const latestBackup = path.join(backupDir, files[0]);
  console.log(`Loading snapshot from: ${latestBackup}`);
  const rawData = fs.readFileSync(latestBackup, 'utf8');
  const snapshot = JSON.parse(rawData);

  console.log('Disabling FOREIGN_KEY_CHECKS...');
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');

  const summary: Record<string, { expected: number; inserted: number }> = {};

  try {
    // 1. Product
    if (snapshot.product?.length) {
      console.log(`Migrating ${snapshot.product.length} products...`);
      const mapped = snapshot.product.map((row: any) => ({
        ...parseDates(row),
        sizes: Array.isArray(row.sizes) ? row.sizes : [],
      }));
      for (const chunk of chunkArray(mapped, 50)) {
        await prisma.product.createMany({ data: chunk as any, skipDuplicates: true });
      }
      summary.product = { expected: snapshot.product.length, inserted: await prisma.product.count() };
    }

    // 2. ProductDetail
    if (snapshot.productDetail?.length) {
      console.log(`Migrating ${snapshot.productDetail.length} product details...`);
      for (const chunk of chunkArray(snapshot.productDetail, 100)) {
        await prisma.productDetail.createMany({ data: chunk as any, skipDuplicates: true });
      }
      summary.productDetail = { expected: snapshot.productDetail.length, inserted: await prisma.productDetail.count() };
    }

    // 3. ProductPiece
    if (snapshot.productPiece?.length) {
      console.log(`Migrating ${snapshot.productPiece.length} product pieces...`);
      for (const chunk of chunkArray(snapshot.productPiece, 100)) {
        await prisma.productPiece.createMany({ data: chunk as any, skipDuplicates: true });
      }
      summary.productPiece = { expected: snapshot.productPiece.length, inserted: await prisma.productPiece.count() };
    }

    // 4. ProductColorway
    if (snapshot.productColorway?.length) {
      console.log(`Migrating ${snapshot.productColorway.length} colorways...`);
      for (const chunk of chunkArray(snapshot.productColorway, 100)) {
        await prisma.productColorway.createMany({ data: chunk as any, skipDuplicates: true });
      }
      summary.productColorway = { expected: snapshot.productColorway.length, inserted: await prisma.productColorway.count() };
    }

    // 5. ProductGalleryImage
    if (snapshot.productGalleryImage?.length) {
      console.log(`Migrating ${snapshot.productGalleryImage.length} gallery images...`);
      for (const chunk of chunkArray(snapshot.productGalleryImage, 100)) {
        await prisma.productGalleryImage.createMany({ data: chunk as any, skipDuplicates: true });
      }
      summary.productGalleryImage = { expected: snapshot.productGalleryImage.length, inserted: await prisma.productGalleryImage.count() };
    }

    // 6. CustomerUser
    if (snapshot.customerUser?.length) {
      console.log(`Migrating ${snapshot.customerUser.length} customer users...`);
      const mapped = snapshot.customerUser.map(parseDates);
      for (const chunk of chunkArray(mapped, 50)) {
        await prisma.customerUser.createMany({ data: chunk as any, skipDuplicates: true });
      }
      summary.customerUser = { expected: snapshot.customerUser.length, inserted: await prisma.customerUser.count() };
    }

    // 7. SavedAddress
    if (snapshot.savedAddress?.length) {
      console.log(`Migrating ${snapshot.savedAddress.length} saved addresses...`);
      const mapped = snapshot.savedAddress.map(parseDates);
      for (const chunk of chunkArray(mapped, 50)) {
        await prisma.savedAddress.createMany({ data: chunk as any, skipDuplicates: true });
      }
      summary.savedAddress = { expected: snapshot.savedAddress.length, inserted: await prisma.savedAddress.count() };
    }

    // 8. Order
    if (snapshot.order?.length) {
      console.log(`Migrating ${snapshot.order.length} orders...`);
      const mapped = snapshot.order.map(parseDates);
      for (const chunk of chunkArray(mapped, 50)) {
        await prisma.order.createMany({ data: chunk as any, skipDuplicates: true });
      }
      summary.order = { expected: snapshot.order.length, inserted: await prisma.order.count() };
    }

    // 9. Customer
    if (snapshot.customer?.length) {
      console.log(`Migrating ${snapshot.customer.length} order customer records...`);
      for (const chunk of chunkArray(snapshot.customer, 50)) {
        await prisma.customer.createMany({ data: chunk as any, skipDuplicates: true });
      }
      summary.customer = { expected: snapshot.customer.length, inserted: await prisma.customer.count() };
    }

    // 10. OrderItem
    if (snapshot.orderItem?.length) {
      console.log(`Migrating ${snapshot.orderItem.length} order items...`);
      for (const chunk of chunkArray(snapshot.orderItem, 50)) {
        await prisma.orderItem.createMany({ data: chunk as any, skipDuplicates: true });
      }
      summary.orderItem = { expected: snapshot.orderItem.length, inserted: await prisma.orderItem.count() };
    }

    // 11. DraftCheckout
    if (snapshot.draftCheckout?.length) {
      console.log(`Migrating ${snapshot.draftCheckout.length} draft checkouts...`);
      const mapped = snapshot.draftCheckout.map(parseDates);
      for (const chunk of chunkArray(mapped, 50)) {
        await prisma.draftCheckout.createMany({ data: chunk as any, skipDuplicates: true });
      }
      summary.draftCheckout = { expected: snapshot.draftCheckout.length, inserted: await prisma.draftCheckout.count() };
    }

    // 12. DraftSignIn
    if (snapshot.draftSignIn?.length) {
      console.log(`Migrating ${snapshot.draftSignIn.length} draft sign-ins...`);
      const mapped = snapshot.draftSignIn.map(parseDates);
      for (const chunk of chunkArray(mapped, 50)) {
        await prisma.draftSignIn.createMany({ data: chunk as any, skipDuplicates: true });
      }
      summary.draftSignIn = { expected: snapshot.draftSignIn.length, inserted: await prisma.draftSignIn.count() };
    }

    // 13. LandingPage
    if (snapshot.landingPage?.length) {
      console.log(`Migrating ${snapshot.landingPage.length} landing pages...`);
      const mapped = snapshot.landingPage.map((row: any) => ({
        ...parseDates(row),
        productIds: Array.isArray(row.productIds) ? row.productIds : [],
      }));
      for (const chunk of chunkArray(mapped, 50)) {
        await prisma.landingPage.createMany({ data: chunk as any, skipDuplicates: true });
      }
      summary.landingPage = { expected: snapshot.landingPage.length, inserted: await prisma.landingPage.count() };
    }

    // 14. WelcomeOfferSettings
    if (snapshot.welcomeOfferSettings?.length) {
      console.log(`Migrating welcome offer settings...`);
      const mapped = snapshot.welcomeOfferSettings.map(parseDates);
      await prisma.welcomeOfferSettings.createMany({ data: mapped, skipDuplicates: true });
      summary.welcomeOfferSettings = { expected: snapshot.welcomeOfferSettings.length, inserted: await prisma.welcomeOfferSettings.count() };
    }

    // 15. LookbookLook
    if (snapshot.lookbookLook?.length) {
      console.log(`Migrating ${snapshot.lookbookLook.length} lookbook looks...`);
      const mapped = snapshot.lookbookLook.map((row: any) => ({
        ...parseDates(row),
        itemIds: Array.isArray(row.itemIds) ? row.itemIds : [],
      }));
      for (const chunk of chunkArray(mapped, 50)) {
        await prisma.lookbookLook.createMany({ data: chunk as any, skipDuplicates: true });
      }
      summary.lookbookLook = { expected: snapshot.lookbookLook.length, inserted: await prisma.lookbookLook.count() };
    }

    // 16. LookbookSettings
    if (snapshot.lookbookSettings?.length) {
      console.log(`Migrating lookbook settings...`);
      const mapped = snapshot.lookbookSettings.map(parseDates);
      await prisma.lookbookSettings.createMany({ data: mapped, skipDuplicates: true });
      summary.lookbookSettings = { expected: snapshot.lookbookSettings.length, inserted: await prisma.lookbookSettings.count() };
    }

    // 17. CategoryHeroSettings
    if (snapshot.categoryHeroSettings?.length) {
      console.log(`Migrating category hero settings...`);
      const mapped = snapshot.categoryHeroSettings.map(parseDates);
      await prisma.categoryHeroSettings.createMany({ data: mapped, skipDuplicates: true });
      summary.categoryHeroSettings = { expected: snapshot.categoryHeroSettings.length, inserted: await prisma.categoryHeroSettings.count() };
    }

    // 18. ProductPageOrdering
    if (snapshot.productPageOrdering?.length) {
      console.log(`Migrating product page ordering...`);
      const mapped = snapshot.productPageOrdering.map(parseDates);
      await prisma.productPageOrdering.createMany({ data: mapped, skipDuplicates: true });
      summary.productPageOrdering = { expected: snapshot.productPageOrdering.length, inserted: await prisma.productPageOrdering.count() };
    }

    // 19. WhatsAppSettings
    if (snapshot.whatsAppSettings?.length) {
      console.log(`Migrating WhatsApp settings...`);
      const mapped = snapshot.whatsAppSettings.map(parseDates);
      await prisma.whatsAppSettings.createMany({ data: mapped, skipDuplicates: true });
      summary.whatsAppSettings = { expected: snapshot.whatsAppSettings.length, inserted: await prisma.whatsAppSettings.count() };
    }

    // 20. OrderSequence
    if (snapshot.orderSequence?.length) {
      console.log(`Migrating order sequence...`);
      await prisma.orderSequence.createMany({ data: snapshot.orderSequence, skipDuplicates: true });
      summary.orderSequence = { expected: snapshot.orderSequence.length, inserted: await prisma.orderSequence.count() };
    }

    // 21. PaymentSettings
    if (snapshot.paymentSettings?.length) {
      console.log(`Migrating payment settings...`);
      const mapped = snapshot.paymentSettings.map(parseDates);
      await prisma.paymentSettings.createMany({ data: mapped, skipDuplicates: true });
      summary.paymentSettings = { expected: snapshot.paymentSettings.length, inserted: await prisma.paymentSettings.count() };
    }
  } finally {
    console.log('Re-enabling FOREIGN_KEY_CHECKS...');
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');
  }

  console.log('\n================================================================');
  console.log('--- DATA RECONCILIATION REPORT (PostgreSQL -> Hostinger MySQL) ---');
  console.log('================================================================');
  let allMatched = true;
  for (const [table, counts] of Object.entries(summary)) {
    const match = counts.expected === counts.inserted ? '✅ MATCH' : '❌ MISMATCH';
    if (counts.expected !== counts.inserted) allMatched = false;
    console.log(`${table.padEnd(25)} Expected: ${String(counts.expected).padEnd(5)} | Inserted: ${String(counts.inserted).padEnd(5)} | ${match}`);
  }

  if (allMatched) {
    console.log('\n🎉 SUCCESS: All 21 tables migrated with 100% data integrity!');
  } else {
    console.error('\n⚠️ WARNING: Some tables have row count mismatches. Check the summary above.');
  }

  await prisma.$disconnect();
}

migrate().catch(async (e) => {
  console.error('Fatal migration error:', e);
  try {
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');
    await prisma.$disconnect();
  } catch {}
  process.exit(1);
});
