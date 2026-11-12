import status from 'http-status';

import AppError from '../../utils/AppError.js';
import prisma from '../../utils/db.js';

const withPrices = { cost: true, sellingPrice: true } as const;

// GET /cups response: prices flattened to numbers.
export const getAllCupsService = async (userId: number) => {
  const cups = await prisma.cup.findMany({
    where: { isDeleted: false, userId },
    orderBy: { label: 'asc' },
    include: withPrices,
  });

  return cups.map((cup) => ({
    id: cup.id,
    label: cup.label,
    isDeleted: cup.isDeleted,
    cost: cup.cost.value,
    sellingPrice: cup.sellingPrice.value,
  }));
};

// The cost and the price must exist, be non-deleted and belong to the user.
const assertCostAndValueExist = async (
  costId: number,
  valueId: number,
  userId: number
) => {
  const [cost, value] = await Promise.all([
    prisma.cupCost.findFirst({
      where: { id: costId, userId, isDeleted: false },
      select: { id: true },
    }),
    prisma.cupValue.findFirst({
      where: { id: valueId, userId, isDeleted: false },
      select: { id: true },
    }),
  ]);

  if (!cost) {
    throw new AppError('Trošak tegle nije pronađen', status.NOT_FOUND);
  }
  if (!value) {
    throw new AppError('Cena tegle nije pronađena', status.NOT_FOUND);
  }
};

export const createCupService = async (
  label: string,
  costId: number,
  valueId: number,
  userId: number
) => {
  await assertCostAndValueExist(costId, valueId, userId);

  return prisma.cup.create({
    data: { label, costId, valueId, userId },
    include: withPrices,
  });
};

// Returns null when the cup does not exist, is deleted or belongs to another user.
export const putCupService = async (
  id: number,
  label: string,
  costId: number,
  valueId: number,
  userId: number
) => {
  const cup = await prisma.cup.findFirst({
    where: { id, userId, isDeleted: false },
    select: { id: true },
  });
  if (!cup) return null;

  await assertCostAndValueExist(costId, valueId, userId);

  return prisma.cup.update({
    where: { id },
    data: { label, costId, valueId },
    include: withPrices,
  });
};

// Soft delete. Returns null when the cup does not exist, is already deleted
// or belongs to another user.
export const deleteCupService = async (id: number, userId: number) => {
  const { count } = await prisma.cup.updateMany({
    where: { id, userId, isDeleted: false },
    data: { isDeleted: true },
  });
  if (count === 0) return null;

  return prisma.cup.findUniqueOrThrow({ where: { id } });
};
