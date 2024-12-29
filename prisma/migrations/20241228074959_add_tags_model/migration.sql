/*
  Warnings:

  - You are about to drop the column `tagsId` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "tagsId",
ADD COLUMN     "tagIds" INTEGER;
