-- CreateTable
CREATE TABLE "BouquetTransaction" (
    "id" SERIAL NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "userId" INTEGER NOT NULL DEFAULT 1,
    "totalExpense" INTEGER NOT NULL,
    "income" INTEGER NOT NULL,
    "profit" INTEGER NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BouquetTransaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BouquetTransaction" ADD CONSTRAINT "BouquetTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
