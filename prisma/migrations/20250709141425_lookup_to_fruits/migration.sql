/*
  Warnings:

  - You are about to drop the `Lookup` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Lookup";

-- CreateTable
CREATE TABLE "Fruits" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "menuItemLabel" TEXT NOT NULL,

    CONSTRAINT "Fruits_pkey" PRIMARY KEY ("id")
);
