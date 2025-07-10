/*
  Warnings:

  - You are about to drop the `Fruits` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Fruits";

-- CreateTable
CREATE TABLE "Fruit" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "menuItemLabel" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Fruit_pkey" PRIMARY KEY ("id")
);
