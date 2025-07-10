/*
  Warnings:

  - Added the required column `label` to the `CupValue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CupCost" ADD COLUMN     "label" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "CupValue" ADD COLUMN     "label" TEXT NOT NULL;
