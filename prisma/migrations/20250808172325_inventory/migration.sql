-- CreateTable
CREATE TABLE "Inventory" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "orderTypeId" INTEGER NOT NULL,
    "cupId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_orderTypeId_cupId_userId_key" ON "Inventory"("orderTypeId", "cupId", "userId");

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_orderTypeId_fkey" FOREIGN KEY ("orderTypeId") REFERENCES "Fruit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_cupId_fkey" FOREIGN KEY ("cupId") REFERENCES "Cup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
