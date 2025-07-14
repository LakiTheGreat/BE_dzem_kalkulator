/*
  Warnings:

  - You are about to drop the column `profitMargin` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "profitMargin",
ADD COLUMN     "otherExpensesMargin" INTEGER NOT NULL DEFAULT 25;
