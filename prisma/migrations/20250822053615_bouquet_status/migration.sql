-- CreateEnum
CREATE TYPE "BouquetTransactionEnum" AS ENUM ('SOLD', 'GIVEN_AWAY', 'PROMOTION', 'OTHER');

-- AlterTable
ALTER TABLE "BouquetTransaction" ADD COLUMN     "status" "BouquetTransactionEnum" NOT NULL DEFAULT 'SOLD';
