/*
  Warnings:

  - Added the required column `orderTypeId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "orderTypeId" INTEGER NOT NULL;
