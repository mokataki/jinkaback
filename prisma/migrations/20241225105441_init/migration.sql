-- DropForeignKey
ALTER TABLE "Photo" DROP CONSTRAINT "Photo_productId_fkey";

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
