-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_orderTypeId_fkey" FOREIGN KEY ("orderTypeId") REFERENCES "Fruit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
