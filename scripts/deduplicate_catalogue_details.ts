import { prisma } from '../src/lib/db';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('--- Cleaning up duplicate product details and gallery images ---');

  // 1. Deduplicate ProductDetail in Database
  const details = await prisma.productDetail.findMany({
    orderBy: { id: 'asc' },
  });
  const detailIdsToDelete: string[] = [];
  const seenDetailByProduct: Record<string, Set<string>> = {};

  for (const d of details) {
    seenDetailByProduct[d.productId] = seenDetailByProduct[d.productId] || new Set();
    const key = d.text.trim().toLowerCase();
    if (seenDetailByProduct[d.productId].has(key)) {
      detailIdsToDelete.push(d.id);
    } else {
      seenDetailByProduct[d.productId].add(key);
    }
  }

  if (detailIdsToDelete.length > 0) {
    console.log(`Deleting ${detailIdsToDelete.length} duplicate ProductDetail rows from DB...`);
    // Delete in chunks of 50 to avoid query limits
    for (let i = 0; i < detailIdsToDelete.length; i += 50) {
      const chunk = detailIdsToDelete.slice(i, i + 50);
      await prisma.productDetail.deleteMany({
        where: { id: { in: chunk } },
      });
    }
    console.log(`✅ Successfully deleted ${detailIdsToDelete.length} duplicate ProductDetail rows.`);
  } else {
    console.log('No duplicate ProductDetail rows found in DB.');
  }

  // 2. Deduplicate ProductGalleryImage in Database
  const images = await prisma.productGalleryImage.findMany({
    orderBy: { id: 'asc' },
  });
  const imageIdsToDelete: string[] = [];
  const seenImageByProduct: Record<string, Set<string>> = {};

  for (const img of images) {
    seenImageByProduct[img.productId] = seenImageByProduct[img.productId] || new Set();
    const key = img.url.trim().toLowerCase();
    if (seenImageByProduct[img.productId].has(key)) {
      imageIdsToDelete.push(img.id);
    } else {
      seenImageByProduct[img.productId].add(key);
    }
  }

  if (imageIdsToDelete.length > 0) {
    console.log(`Deleting ${imageIdsToDelete.length} duplicate ProductGalleryImage rows from DB...`);
    for (let i = 0; i < imageIdsToDelete.length; i += 50) {
      const chunk = imageIdsToDelete.slice(i, i + 50);
      await prisma.productGalleryImage.deleteMany({
        where: { id: { in: chunk } },
      });
    }
    console.log(`✅ Successfully deleted ${imageIdsToDelete.length} duplicate ProductGalleryImage rows.`);
  } else {
    console.log('No duplicate ProductGalleryImage rows found in DB.');
  }

  // 3. Deduplicate details in products_catalogue.json
  const jsonPath = path.join(process.cwd(), 'src', 'data', 'products_catalogue.json');
  const rawJson = fs.readFileSync(jsonPath, 'utf8');
  const products = JSON.parse(rawJson);

  let jsonDupsRemoved = 0;
  for (const p of products) {
    if (Array.isArray(p.details)) {
      const seen = new Set<string>();
      const uniqueDetails: string[] = [];
      for (const d of p.details) {
        const key = typeof d === 'string' ? d.trim().toLowerCase() : '';
        if (key && !seen.has(key)) {
          seen.add(key);
          uniqueDetails.push(d.trim());
        } else if (key) {
          jsonDupsRemoved++;
        }
      }
      p.details = uniqueDetails;
    }
  }

  fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2), 'utf8');
  console.log(`✅ Successfully cleaned up products_catalogue.json (removed ${jsonDupsRemoved} duplicate details).`);

  // Verification
  const remainingDetails = await prisma.productDetail.count();
  const remainingImages = await prisma.productGalleryImage.count();
  console.log(`\nVerification:`);
  console.log(`- Database ProductDetails remaining: ${remainingDetails}`);
  console.log(`- Database ProductGalleryImages remaining: ${remainingImages}`);
}

main()
  .catch((e) => {
    console.error('Error during cleanup:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
