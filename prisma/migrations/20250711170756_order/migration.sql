-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "orderName" TEXT NOT NULL,
    "numberOfSmallCups" INTEGER NOT NULL,
    "numberOfLargeCups" INTEGER NOT NULL,
    "totalExpense" INTEGER NOT NULL,
    "totalValue" INTEGER NOT NULL,
    "profit" INTEGER NOT NULL,
    "profitMargin" INTEGER NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);
