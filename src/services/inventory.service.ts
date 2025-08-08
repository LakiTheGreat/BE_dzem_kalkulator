import prisma from '../utils/db.js';

export const getAllInventoryService = async (userId: number) => {
  const inventories = await prisma.inventory.findMany({
    where: { userId },
    select: { cupData: true },
  });

  return inventories;
};

export const getInventoryForFruitService = async (
  orderTypeId: number,
  userId: number
) => {
  const existingInventory = await prisma.inventory.findUnique({
    where: { orderTypeId, userId },
  });

  return existingInventory;
};

export const createInventoryService = async (
  orderTypeId: number,
  cupData: any,
  userId: number
) => {
  const created = await prisma.inventory.create({
    data: {
      orderTypeId,
      cupData,
      userId,
    },
  });
  return created;
};

export const updateInventoryService = async (
  orderTypeId: number,
  mergedCupData: any,
  userId: number
) => {
  const updated = await prisma.inventory.update({
    where: { orderTypeId, userId },
    data: {
      cupData: mergedCupData,
    },
  });
  return updated;
};
