-- CreateTable
CREATE TABLE "ConfigConstant" (
    "id" SERIAL NOT NULL,
    "value" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ConfigConstant_pkey" PRIMARY KEY ("id")
);
