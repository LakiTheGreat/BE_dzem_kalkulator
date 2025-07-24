import prisma from '../utils/db.js';

export const getAllCupValuesService = async (userId: number) => {
  const cupValues = await prisma.cupValue.findMany({
    where: { isDeleted: false, userId },
    orderBy: { label: 'asc' },
  });

  return cupValues;
};

export const createCupValueService = async (
  label: string,
  value: number,
  userId: number
) => {
  const newCup = await prisma.cupValue.create({
    data: {
      label,
      value,
      userId,
      isDeleted: false,
    },
  });

  return newCup;
};

export const putCupValueService = async (
  cupValueId: number,
  label: string,
  value: number,
  userId: number
) => {
  const updatedCupValue = await prisma.cupValue.update({
    where: { id: cupValueId, userId },
    data: {
      label,
      value,
    },
  });

  return updatedCupValue;
};

export const deleteCupValueService = async (
  cupValueId: number,
  userId: number
) => {
  const deletedCupValue = await prisma.cupValue.update({
    where: { id: cupValueId, userId },
    data: { isDeleted: true },
  });

  return deletedCupValue;
};
