/*
  Warnings:

  - You are about to drop the column `createdId` on the `Transaction` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_createdId_fkey";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "createdId",
ADD COLUMN     "userId" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
