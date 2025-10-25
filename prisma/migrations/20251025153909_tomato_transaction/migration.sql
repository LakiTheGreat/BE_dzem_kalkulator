/*
  Warnings:

  - You are about to drop the `TomatoTransaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TomatoTransaction" DROP CONSTRAINT "TomatoTransaction_cupTypeId_fkey";

-- DropForeignKey
ALTER TABLE "TomatoTransaction" DROP CONSTRAINT "TomatoTransaction_userId_fkey";

-- DropTable
DROP TABLE "TomatoTransaction";

-- CreateTable
CREATE TABLE "TomatoOrder" (
    "id" SERIAL NOT NULL,
    "cupTypeId" INTEGER NOT NULL,
    "totalExpenses" INTEGER NOT NULL,
    "numOfCups" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL DEFAULT 1,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TomatoOrder_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TomatoOrder" ADD CONSTRAINT "TomatoOrder_cupTypeId_fkey" FOREIGN KEY ("cupTypeId") REFERENCES "TomatoCup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TomatoOrder" ADD CONSTRAINT "TomatoOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
