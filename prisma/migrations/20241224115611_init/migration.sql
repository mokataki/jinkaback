/*
  Warnings:

  - A unique constraint covering the columns `[brandName]` on the table `Brand` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Brand_brandName_key" ON "Brand"("brandName");
