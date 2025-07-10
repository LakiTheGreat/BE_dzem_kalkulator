/*
  Warnings:

  - You are about to drop the column `menuItemLabel` on the `Cup` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `Cup` table. All the data in the column will be lost.
  - You are about to drop the column `menuItemLabel` on the `Fruit` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `Fruit` table. All the data in the column will be lost.
  - Added the required column `cost` to the `Cup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `label` to the `Cup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `label` to the `Fruit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cup" DROP COLUMN "menuItemLabel",
DROP COLUMN "value",
ADD COLUMN     "cost" INTEGER NOT NULL,
ADD COLUMN     "label" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Fruit" DROP COLUMN "menuItemLabel",
DROP COLUMN "value",
ADD COLUMN     "label" TEXT NOT NULL;
