/*
  Warnings:

  - The primary key for the `Inventory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cupId` on the `Inventory` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Inventory` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Inventory` table. All the data in the column will be lost.
  - Added the required column `cupData` to the `Inventory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_cupId_fkey";

-- DropIndex
DROP INDEX "Inventory_orderTypeId_cupId_userId_key";

-- AlterTable
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_pkey",
DROP COLUMN "cupId",
DROP COLUMN "id",
DROP COLUMN "quantity",
ADD COLUMN     "cupData" JSONB NOT NULL,
ADD CONSTRAINT "Inventory_pkey" PRIMARY KEY ("orderTypeId");
