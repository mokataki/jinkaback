-- DropForeignKey
ALTER TABLE "Photo" DROP CONSTRAINT "Photo_articleId_fkey";

-- AlterTable
ALTER TABLE "Photo" ALTER COLUMN "productId" DROP NOT NULL,
ALTER COLUMN "articleId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;
