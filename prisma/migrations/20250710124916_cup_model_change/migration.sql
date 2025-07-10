/*
  Warnings:

  - You are about to drop the column `cost` on the `Cup` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Cup" DROP COLUMN "cost";

-- CreateTable
CREATE TABLE "CupCost" (
    "id" SERIAL NOT NULL,
    "value" INTEGER NOT NULL,
    "cupId" INTEGER NOT NULL,

    CONSTRAINT "CupCost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CupValue" (
    "id" SERIAL NOT NULL,
    "value" INTEGER NOT NULL,
    "cupId" INTEGER NOT NULL,

    CONSTRAINT "CupValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CupCost_cupId_key" ON "CupCost"("cupId");

-- CreateIndex
CREATE UNIQUE INDEX "CupValue_cupId_key" ON "CupValue"("cupId");

-- AddForeignKey
ALTER TABLE "CupCost" ADD CONSTRAINT "CupCost_cupId_fkey" FOREIGN KEY ("cupId") REFERENCES "Cup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CupValue" ADD CONSTRAINT "CupValue_cupId_fkey" FOREIGN KEY ("cupId") REFERENCES "Cup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
