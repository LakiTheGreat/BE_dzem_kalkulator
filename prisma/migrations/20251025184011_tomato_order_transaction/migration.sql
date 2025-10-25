-- CreateTable
CREATE TABLE "TomatoOrderTransaction" (
    "id" SERIAL NOT NULL,
    "note" TEXT NOT NULL,
    "status" "TransactionStatus" NOT NULL,
    "cupTypeId" INTEGER NOT NULL,
    "numOfCups" INTEGER NOT NULL,
    "pricePerCup" INTEGER NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "TomatoOrderTransaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TomatoOrderTransaction" ADD CONSTRAINT "TomatoOrderTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TomatoOrderTransaction" ADD CONSTRAINT "TomatoOrderTransaction_cupTypeId_fkey" FOREIGN KEY ("cupTypeId") REFERENCES "TomatoCup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
