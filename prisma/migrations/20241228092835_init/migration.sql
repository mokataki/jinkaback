/*
  Warnings:

  - Made the column `articleId` on table `Photo` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Photo" DROP CONSTRAINT "Photo_articleId_fkey";

-- AlterTable
ALTER TABLE "Photo" ALTER COLUMN "articleId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
