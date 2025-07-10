-- CreateTable
CREATE TABLE "Cups" (
    "id" SERIAL NOT NULL,
    "value" INTEGER NOT NULL,
    "menuItemLabel" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Cups_pkey" PRIMARY KEY ("id")
);
