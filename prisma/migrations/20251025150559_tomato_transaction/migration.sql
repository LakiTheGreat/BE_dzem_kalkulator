/*
  Warnings:

  - Added the required column `status` to the `TomatoTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TomatoTransaction" ADD COLUMN     "status" "TransactionStatus" NOT NULL;
