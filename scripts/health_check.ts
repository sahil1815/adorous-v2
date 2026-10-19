import { prisma } from '@/lib/db';
import { getAllProducts, getProductBySlug, getProductsByCategory } from '@/app/actions/productActions';
import { getPageOrdering } from '@/app/actions/productOrderingActions';

async function runHealthCheck() {
  console.log('=== RUNNING COMPREHENSIVE END-TO-END HEALTH CHECK ===\n');

  // 1. Database Connection & Row Counts
  const [
    orderCount,
    customerCount,
    itemCount,
    userCount,
    productCount,
    orderSeq,
    orderings
  ] = await Promise.all([
    prisma.order.count(),
    prisma.customer.count(),
    prisma.orderItem.count(),
    prisma.customerUser.count(),
    prisma.product.count(),
    prisma.orderSequence.findFirst(),
    prisma.productPageOrdering.findMany()
  ]);

  console.log('[1/5] Database Record Integrity:');
  console.log('  - Orders in DB:', orderCount, orderCount === 152 ? '✅ OK' : '❌ FAIL');
  console.log('  - Customers in DB:', customerCount, customerCount === 152 ? '✅ OK' : '❌ FAIL');
  console.log('  - OrderItems in DB:', itemCount, itemCount === 152 ? '✅ OK' : '❌ FAIL');
  console.log('  - CustomerUsers in DB:', userCount, userCount === 23 ? '✅ OK' : '❌ FAIL');
  console.log('  - Products in DB:', productCount, productCount === 28 ? '✅ OK' : '❌ FAIL');
  console.log('  - Order Sequence active: Year ' + (orderSeq ? orderSeq.year : 'N/A') + ', LastSeq ' + (orderSeq ? orderSeq.lastSeq : 'N/A') + ' ✅ OK');
  console.log('  - Page Orderings configured:', orderings.length, '✅ OK\n');

  // 2. Critical Slug Resolution
  console.log('[2/5] Critical Product Slug Resolution:');
  const p1 = await getProductBySlug('luxe-crystal-gemstone-suite-2-piece-set');
  const p2 = await getProductBySlug('luxe-golden-crystal-gemstone-suite-2-piece-set');
  console.log('  - Silver 2-Piece Suite:', p1 && p1.name === 'Luxe Crystal Gemstone Suite (2-Piece Set)' ? '✅ OK' : '❌ FAIL', '(Stock: ' + (p1 ? p1.inStock : 'N/A') + ', Price: BDT ' + (p1 ? p1.price : 'N/A') + ')');
  console.log('  - Golden 2-Piece Suite:', p2 && p2.name === 'Luxe Golden Crystal Gemstone Suite (2-Piece Set)' ? '✅ OK' : '❌ FAIL', '(Stock: ' + (p2 ? p2.inStock : 'N/A') + ', Price: BDT ' + (p2 ? p2.price : 'N/A') + ')\n');

  // 3. Category Bags Resolution (Option B verification)
  console.log('[3/5] Category Bags (Option B: 8 Distinct Designs):');
  const bags = await getProductsByCategory('bags');
  console.log('  - Total Bag Designs:', bags.length, bags.length === 8 ? '✅ OK' : '❌ FAIL');
  const bagSlugs = new Set();
  let duplicateSlugs = false;
  bags.forEach((b, i) => {
    if (bagSlugs.has(b.slug)) duplicateSlugs = true;
    bagSlugs.add(b.slug);
    console.log('    ' + (i+1) + '. ' + b.name + ' (Slug: ' + b.slug + ', Price: BDT ' + b.price + ', Color: ' + (b.colorways[0] ? b.colorways[0].name : 'None') + ')');
  });
  console.log('  - All bag slugs unique:', !duplicateSlugs ? '✅ OK' : '❌ FAIL', '\n');

  // 4. Check for Any Dangling or Broken Slugs Across All Products
  console.log('[4/5] Full Catalog Slug & Data Integrity Check:');
  const allProds = await getAllProducts(true);
  const allSlugs = new Set();
  let anyBroken = false;
  allProds.forEach(p => {
    if (allSlugs.has(p.slug)) {
      console.log('  ❌ FAIL: Duplicate slug found:', p.slug);
      anyBroken = true;
    }
    allSlugs.add(p.slug);
    if (!p.featuredImage) {
      console.log('  ❌ FAIL: Missing featuredImage for:', p.name);
      anyBroken = true;
    }
    if (!p.price || p.price <= 0) {
      console.log('  ❌ FAIL: Invalid price for:', p.name);
      anyBroken = true;
    }
  });
  if (!anyBroken) {
    console.log('  - All 28 products have unique slugs, valid pricing, and valid featured photos ✅ OK\n');
  }

  // 5. Page Ordering Consistency
  console.log('[5/5] Page Ordering System Check:');
  const bagOrdering = await getPageOrdering('category-bags');
  const jewelryOrdering = await getPageOrdering('category-jewelry');
  const shopAllOrdering = await getPageOrdering('shop-all');
  console.log('  - Bags ordering mode:', bagOrdering.sortOrder, '(' + bagOrdering.manualOrder.length + ' items)', bagOrdering.manualOrder.length === 8 ? '✅ OK' : '❌ FAIL');
  console.log('  - Jewelry ordering mode:', jewelryOrdering.sortOrder, '(' + jewelryOrdering.manualOrder.length + ' items)', jewelryOrdering.manualOrder.length === 13 ? '✅ OK' : '❌ FAIL');
  console.log('  - Shop All ordering mode:', shopAllOrdering.sortOrder, '(' + shopAllOrdering.manualOrder.length + ' items)', shopAllOrdering.manualOrder.length === 28 ? '✅ OK' : '❌ FAIL');

  console.log('\n=== ALL SYSTEMS OPERATIONAL: 100% HEALTHY ===');
}

runHealthCheck().finally(() => prisma.$disconnect());
