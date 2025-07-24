import prisma from '../utils/db.js';

export const getAllCupCostsService = async (userId: number) => {
  const cupCosts = await prisma.cupCost.findMany({
    where: { isDeleted: false, userId },
    orderBy: { label: 'asc' },
  });

  return cupCosts;
};

export const createNewCupCostService = async (
  label: string,
  value: number,
  userId: number
) => {
  const newCupCost = await prisma.cupCost.create({
    data: {
      label,
      value,
      isDeleted: false,
      userId,
    },
  });

  return newCupCost;
};

export const putCupCostService = async (
  cupCostId: number,
  label: string,
  value: number,
  userId: number
) => {
  const updatedCupCost = await prisma.cupCost.update({
    where: { id: cupCostId, userId },
    data: {
      label,
      value,
    },
  });

  return updatedCupCost;
};

export const deleteCupCostService = async (
  cupCostId: number,
  userId: number
) => {
  const deletedCupCost = await prisma.cupCost.update({
    where: { id: cupCostId, userId },
    data: { isDeleted: true },
  });

  return deletedCupCost;
};
