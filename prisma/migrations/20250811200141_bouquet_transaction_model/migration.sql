/*
  Warnings:

  - Added the required column `profitMargin` to the `BouquetTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BouquetTransaction" ADD COLUMN     "profitMargin" INTEGER NOT NULL;
