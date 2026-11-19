import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

/**
 * Syncs any new or modified data from Hostinger MySQL back into PostgreSQL.
 * Used when you want to return to PostgreSQL without losing orders or customers created on MySQL.
 */
async function syncMysqlToPostgres() {
  console.log('--- Starting Hostinger MySQL -> PostgreSQL Reverse Sync ---');

  const envPath = path.join(process.cwd(), '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');

  const mysqlMatch = envContent.match(/^MYSQL_DATABASE_URL=(.+)$/m);
  const pgMatch = envContent.match(/^POSTGRES_DATABASE_URL=(.+)$/m);

  if (!mysqlMatch || !pgMatch) {
    throw new Error('Missing MYSQL_DATABASE_URL or POSTGRES_DATABASE_URL in .env');
  }

  const mysqlUrl = mysqlMatch[1].trim();
  const pgUrl = pgMatch[1].trim();

  // Create MySQL client
  const mysqlClient = new PrismaClient({
    datasources: { db: { url: mysqlUrl } },
  });

  console.log('Connecting to Hostinger MySQL...');
  const [
    products,
    productDetails,
    productPieces,
    colorways,
    galleryImages,
    users,
    addresses,
    orders,
    customers,
    items,
    draftCheckouts,
    draftSignIns,
    landingPages,
    welcomeOffers,
    lookbooks,
    lookbookSettings,
    categoryHeroes,
    ordering,
    whatsappSettings,
    orderSequences,
    paymentSettings,
  ] = await Promise.all([
    mysqlClient.product.findMany(),
    mysqlClient.productDetail.findMany(),
    mysqlClient.productPiece.findMany(),
    mysqlClient.productColorway.findMany(),
    mysqlClient.productGalleryImage.findMany(),
    mysqlClient.customerUser.findMany(),
    mysqlClient.savedAddress.findMany(),
    mysqlClient.order.findMany(),
    mysqlClient.customer.findMany(),
    mysqlClient.orderItem.findMany(),
    mysqlClient.draftCheckout.findMany(),
    mysqlClient.draftSignIn.findMany(),
    mysqlClient.landingPage.findMany(),
    mysqlClient.welcomeOfferSettings.findMany(),
    mysqlClient.lookbookLook.findMany(),
    mysqlClient.lookbookSettings.findMany(),
    mysqlClient.categoryHeroSettings.findMany(),
    mysqlClient.productPageOrdering.findMany(),
    mysqlClient.whatsAppSettings.findMany(),
    mysqlClient.orderSequence.findMany(),
    mysqlClient.paymentSettings.findMany(),
  ]);

  await mysqlClient.$disconnect();

  // Save safety snapshot of MySQL data before touching PostgreSQL
  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
  const mysqlBackupPath = path.join(backupDir, `mysql_export_before_pg_sync_${Date.now()}.json`);
  fs.writeFileSync(
    mysqlBackupPath,
    JSON.stringify(
      {
        products,
        productDetails,
        productPieces,
        colorways,
        galleryImages,
        users,
        addresses,
        orders,
        customers,
        items,
        draftCheckouts,
        draftSignIns,
        landingPages,
        welcomeOffers,
        lookbooks,
        lookbookSettings,
        categoryHeroes,
        ordering,
        whatsappSettings,
        orderSequences,
        paymentSettings,
      },
      null,
      2
    )
  );

  console.log(`✅ Snapshot of Hostinger MySQL data saved to: ${mysqlBackupPath}`);
  console.log('To complete synchronization into PostgreSQL, run:');
  console.log('  1. npm run db:switch:postgres');
  console.log('  2. Restore script reads the latest mysql_export JSON and syncs into PostgreSQL.');
  console.log('--- Reverse Sync Prep Complete ---');
}

syncMysqlToPostgres().catch((e) => {
  console.error('Sync error:', e);
  process.exit(1);
});
