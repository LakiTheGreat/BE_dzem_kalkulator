/*
  Warnings:

  - You are about to drop the column `fruitOrders` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "fruitOrders",
ADD COLUMN     "fruits" JSONB[],
ADD COLUMN     "orderName" TEXT NOT NULL DEFAULT '';
