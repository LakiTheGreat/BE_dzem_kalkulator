-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('CONSUMED', 'SOLD', 'GIVEN_AWAY', 'OTHER');

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "orderTypeId" INTEGER NOT NULL,
    "createdId" INTEGER NOT NULL,
    "cups" JSONB[],
    "status" "TransactionStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_orderTypeId_fkey" FOREIGN KEY ("orderTypeId") REFERENCES "Fruit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_createdId_fkey" FOREIGN KEY ("createdId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
