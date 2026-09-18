-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "categoryLabel" TEXT NOT NULL,
    "tagline" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "originalPrice" DOUBLE PRECISION,
    "description" TEXT,
    "featuredImage" TEXT NOT NULL,
    "badge" TEXT,
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "isNewDrop" BOOLEAN NOT NULL DEFAULT false,
    "isGiftPick" BOOLEAN NOT NULL DEFAULT false,
    "isBestseller" BOOLEAN NOT NULL DEFAULT false,
    "featuredRank" INTEGER,
    "seoKeywords" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductDetail" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "ProductDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductPiece" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "ProductPiece_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductColorway" (
    "id" TEXT NOT NULL,
    "colorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hex" TEXT NOT NULL,
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "productId" TEXT NOT NULL,

    CONSTRAINT "ProductColorway_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductGalleryImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "ProductGalleryImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "courierPartner" TEXT,
    "consignmentId" TEXT,
    "paymentMethod" TEXT NOT NULL DEFAULT 'Cash on Delivery',
    "subtotal" DOUBLE PRECISION NOT NULL,
    "shippingFee" DOUBLE PRECISION NOT NULL,
    "discountAmount" DOUBLE PRECISION,
    "couponCode" TEXT,
    "grandTotal" DOUBLE PRECISION NOT NULL,
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "giftNote" TEXT,
    "whatsappUpdates" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "productName" TEXT NOT NULL,
    "productImage" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "colorName" TEXT NOT NULL,
    "colorHex" TEXT NOT NULL,
    "selectedSize" TEXT,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderId_key" ON "Order"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_orderId_key" ON "Customer"("orderId");

-- AddForeignKey
ALTER TABLE "ProductDetail" ADD CONSTRAINT "ProductDetail_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPiece" ADD CONSTRAINT "ProductPiece_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductColorway" ADD CONSTRAINT "ProductColorway_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductGalleryImage" ADD CONSTRAINT "ProductGalleryImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
