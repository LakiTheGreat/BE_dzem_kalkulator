/*
  Warnings:

  - You are about to drop the `Cups` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Cups";

-- CreateTable
CREATE TABLE "Cup" (
    "id" SERIAL NOT NULL,
    "value" INTEGER NOT NULL,
    "menuItemLabel" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Cup_pkey" PRIMARY KEY ("id")
);
