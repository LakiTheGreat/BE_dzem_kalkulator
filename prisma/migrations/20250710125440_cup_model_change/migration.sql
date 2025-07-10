/*
  Warnings:

  - You are about to drop the column `cupId` on the `CupCost` table. All the data in the column will be lost.
  - You are about to drop the column `cupId` on the `CupValue` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[costId]` on the table `Cup` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[valueId]` on the table `Cup` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `costId` to the `Cup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valueId` to the `Cup` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CupCost" DROP CONSTRAINT "CupCost_cupId_fkey";

-- DropForeignKey
ALTER TABLE "CupValue" DROP CONSTRAINT "CupValue_cupId_fkey";

-- DropIndex
DROP INDEX "CupCost_cupId_key";

-- DropIndex
DROP INDEX "CupValue_cupId_key";

-- AlterTable
ALTER TABLE "Cup" ADD COLUMN     "costId" INTEGER NOT NULL,
ADD COLUMN     "valueId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "CupCost" DROP COLUMN "cupId";

-- AlterTable
ALTER TABLE "CupValue" DROP COLUMN "cupId";

-- CreateIndex
CREATE UNIQUE INDEX "Cup_costId_key" ON "Cup"("costId");

-- CreateIndex
CREATE UNIQUE INDEX "Cup_valueId_key" ON "Cup"("valueId");

-- AddForeignKey
ALTER TABLE "Cup" ADD CONSTRAINT "Cup_costId_fkey" FOREIGN KEY ("costId") REFERENCES "CupCost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cup" ADD CONSTRAINT "Cup_valueId_fkey" FOREIGN KEY ("valueId") REFERENCES "CupValue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
