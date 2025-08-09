import { CupData } from '../types/inventory.js';
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
  mergedCupData: CupData[],
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

export const getInventoryGroupedByFruitService = async (userId: number) => {
  // 1. Fetch all inventories for this user
  const inventories = await prisma.inventory.findMany({
    where: { userId },
    select: {
      orderTypeId: true,
      cupData: true,
    },
  });

  if (!inventories.length) return [];

  // 2. Fetch all cups for mapping labels
  const cups = await prisma.cup.findMany({
    where: { userId, isDeleted: false },
    select: { id: true, label: true },
  });
  const cupLabelMap = new Map(cups.map((cup) => [cup.id, cup.label]));

  // 3. Fetch all fruits for mapping fruit labels
  const fruits = await prisma.fruit.findMany({
    where: { userId, isDeleted: false },
    select: { id: true, label: true }, // assuming 'value' holds the fruit label
  });
  const fruitLabelMap = new Map(fruits.map((fruit) => [fruit.id, fruit.label]));

  // 4. Group by orderTypeId
  const fruitMap = new Map<
    number,
    Map<number, number> // cupId → quantity
  >();

  for (const inv of inventories) {
    const fruitCups =
      fruitMap.get(inv.orderTypeId) || new Map<number, number>();

    for (const entry of inv.cupData as { cupId: number; quantity: number }[]) {
      const currentQty = fruitCups.get(entry.cupId) || 0;
      fruitCups.set(entry.cupId, currentQty + entry.quantity);
    }

    fruitMap.set(inv.orderTypeId, fruitCups);
  }

  // 5. Transform into desired output format
  const result = Array.from(fruitMap.entries())
    .map(([orderTypeId, cupMap]) => ({
      orderTypeId,
      label: fruitLabelMap.get(orderTypeId) || null,
      cups: Array.from(cupMap.entries())
        .map(([cupId, numberOf]) => ({
          cupId,
          label: cupLabelMap.get(cupId) || null,
          numberOf,
        }))
        .sort((a, b) => {
          // Extract numeric part from labels like "212ml"
          const numA = parseInt(a.label || '0', 10);
          const numB = parseInt(b.label || '0', 10);
          return numA - numB;
        }),
    }))
    .sort((a, b) => (a.label || '').localeCompare(b.label || ''));

  return result;
};
