import status from 'http-status';

import AppError from '../../utils/AppError.js';
import prisma from '../../utils/db.js';

export const getAllCupCostsService = (userId: number) =>
  prisma.cupCost.findMany({
    where: { isDeleted: false, userId },
    orderBy: { label: 'asc' },
  });

export const createCupCostService = (
  label: string,
  value: number,
  userId: number
) => prisma.cupCost.create({ data: { label, value, userId } });

// Returns null when the cost does not exist, is deleted or belongs to another user.
export const putCupCostService = async (
  id: number,
  label: string,
  value: number,
  userId: number
) => {
  const { count } = await prisma.cupCost.updateMany({
    where: { id, userId, isDeleted: false },
    data: { label, value },
  });
  if (count === 0) return null;

  return prisma.cupCost.findUniqueOrThrow({ where: { id } });
};

// Soft delete. Returns null when the cost does not exist, is already deleted or
// belongs to another user. Rejected while a non-deleted cup still uses it.
export const deleteCupCostService = async (id: number, userId: number) => {
  const inUse = await prisma.cup.count({
    where: { costId: id, userId, isDeleted: false },
  });
  if (inUse > 0) {
    throw new AppError(
      'Trošak se koristi u aktivnim teglama',
      status.BAD_REQUEST
    );
  }

  const { count } = await prisma.cupCost.updateMany({
    where: { id, userId, isDeleted: false },
    data: { isDeleted: true },
  });
  if (count === 0) return null;

  return prisma.cupCost.findUniqueOrThrow({ where: { id } });
};
