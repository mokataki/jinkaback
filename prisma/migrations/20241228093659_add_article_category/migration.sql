-- AlterTable
ALTER TABLE "Color" ADD COLUMN     "articleId" INTEGER;

-- CreateTable
CREATE TABLE "_ArticleToColor" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ArticleToColor_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ArticleToColor_B_index" ON "_ArticleToColor"("B");

-- AddForeignKey
ALTER TABLE "_ArticleToColor" ADD CONSTRAINT "_ArticleToColor_A_fkey" FOREIGN KEY ("A") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArticleToColor" ADD CONSTRAINT "_ArticleToColor_B_fkey" FOREIGN KEY ("B") REFERENCES "Color"("id") ON DELETE CASCADE ON UPDATE CASCADE;
