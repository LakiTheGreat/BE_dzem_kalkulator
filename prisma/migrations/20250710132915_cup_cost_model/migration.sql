-- AlterTable
ALTER TABLE "CupCost" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "CupValue" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;
