-- CreateTable
CREATE TABLE "TomatoCup" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TomatoCup_pkey" PRIMARY KEY ("id")
);
