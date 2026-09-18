const { PrismaClient } = require('@prisma/client');
const { PRODUCTS } = require('../src/data/catalogue');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Clear existing data
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.productGalleryImage.deleteMany({});
  await prisma.productColorway.deleteMany({});
  await prisma.productPiece.deleteMany({});
  await prisma.productDetail.deleteMany({});
  await prisma.product.deleteMany({});
  
  console.log('Cleared existing data.');

  for (const product of PRODUCTS) {
    const createdProduct = await prisma.product.create({
      data: {
        id: product.id,
        slug: product.slug,
        name: product.name,
        category: product.category,
        categoryLabel: product.categoryLabel,
        tagline: product.tagline,
        price: product.price,
        originalPrice: product.originalPrice,
        description: product.description,
        featuredImage: product.featuredImage,
        badge: product.badge,
        inStock: product.inStock !== false,
        isNewDrop: product.isNewDrop || false,
        isGiftPick: product.isGiftPick || false,
        isBestseller: product.isBestseller || false,
        featuredRank: product.featuredRank,
        seoKeywords: (product.seoKeywords || []).join(','),
        
        details: {
          create: (product.details || []).map((text: string) => ({ text }))
        },
        piecesIncluded: {
          create: (product.piecesIncluded || []).map((text: string) => ({ text }))
        },
        colorways: {
          create: (product.colorways || []).map((color: any) => ({
            colorId: color.id,
            name: color.name,
            hex: color.hex,
            inStock: color.inStock !== false
          }))
        },
        galleryImages: {
          create: (product.galleryImages || []).map((url: string) => ({ url }))
        }
      }
    });
    console.log(`Created product: ${createdProduct.name}`);
  }
  
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
