-- CreateTable
CREATE TABLE "TomatoTransaction" (
    "id" SERIAL NOT NULL,
    "cupTypeId" INTEGER NOT NULL,
    "totalExpenses" INTEGER NOT NULL,
    "numOf" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL DEFAULT 1,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TomatoTransaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TomatoTransaction" ADD CONSTRAINT "TomatoTransaction_cupTypeId_fkey" FOREIGN KEY ("cupTypeId") REFERENCES "TomatoCup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TomatoTransaction" ADD CONSTRAINT "TomatoTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
