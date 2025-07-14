/*
  Warnings:

  - You are about to drop the column `numberOfLargeCups` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `numberOfSmallCups` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `orderName` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `profit` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `profitMargin` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `totalExpense` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `totalValue` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "numberOfLargeCups",
DROP COLUMN "numberOfSmallCups",
DROP COLUMN "orderName",
DROP COLUMN "profit",
DROP COLUMN "profitMargin",
DROP COLUMN "totalExpense",
DROP COLUMN "totalValue",
ADD COLUMN     "cups" JSONB[],
ADD COLUMN     "fruitOrders" JSONB[];
