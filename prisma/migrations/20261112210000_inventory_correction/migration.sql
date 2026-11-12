-- CreateTable
CREATE TABLE "InventoryCorrection" (
    "id" SERIAL NOT NULL,
    "orderTypeId" INTEGER NOT NULL,
    "cupId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "InventoryCorrection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InventoryCorrection_userId_orderTypeId_idx" ON "InventoryCorrection"("userId", "orderTypeId");

-- AddForeignKey
ALTER TABLE "InventoryCorrection" ADD CONSTRAINT "InventoryCorrection_orderTypeId_fkey" FOREIGN KEY ("orderTypeId") REFERENCES "Fruit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryCorrection" ADD CONSTRAINT "InventoryCorrection_cupId_fkey" FOREIGN KEY ("cupId") REFERENCES "Cup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryCorrection" ADD CONSTRAINT "InventoryCorrection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
