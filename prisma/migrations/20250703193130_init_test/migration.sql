-- CreateTable
CREATE TABLE "Lookup" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "menuItemLabel" TEXT NOT NULL,

    CONSTRAINT "Lookup_pkey" PRIMARY KEY ("id")
);
