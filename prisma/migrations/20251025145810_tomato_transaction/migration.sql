/*
  Warnings:

  - You are about to drop the column `numOf` on the `TomatoTransaction` table. All the data in the column will be lost.
  - Added the required column `numOfCups` to the `TomatoTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TomatoTransaction" DROP COLUMN "numOf",
ADD COLUMN     "numOfCups" INTEGER NOT NULL;
