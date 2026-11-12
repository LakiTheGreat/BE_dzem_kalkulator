import status from 'http-status';

import AppError from '../../utils/AppError.js';
import prisma from '../../utils/db.js';

export const getAllCupValuesService = (userId: number) =>
  prisma.cupValue.findMany({
    where: { isDeleted: false, userId },
    orderBy: { label: 'asc' },
  });

export const createCupValueService = (
  label: string,
  value: number,
  userId: number
) => prisma.cupValue.create({ data: { label, value, userId } });

// Returns null when the price does not exist, is deleted or belongs to another user.
export const putCupValueService = async (
  id: number,
  label: string,
  value: number,
  userId: number
) => {
  const { count } = await prisma.cupValue.updateMany({
    where: { id, userId, isDeleted: false },
    data: { label, value },
  });
  if (count === 0) return null;

  return prisma.cupValue.findUniqueOrThrow({ where: { id } });
};

// Soft delete. Returns null when the price does not exist, is already deleted or
// belongs to another user. Rejected while a non-deleted cup still uses it.
export const deleteCupValueService = async (id: number, userId: number) => {
  const inUse = await prisma.cup.count({
    where: { valueId: id, userId, isDeleted: false },
  });
  if (inUse > 0) {
    throw new AppError(
      'Cena se koristi u aktivnim teglama',
      status.BAD_REQUEST
    );
  }

  const { count } = await prisma.cupValue.updateMany({
    where: { id, userId, isDeleted: false },
    data: { isDeleted: true },
  });
  if (count === 0) return null;

  return prisma.cupValue.findUniqueOrThrow({ where: { id } });
};
