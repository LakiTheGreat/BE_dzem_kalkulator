import prisma from '../utils/db.js';

export const getAllCupCostsService = async () => {
  const cupCosts = await prisma.cupCost.findMany({
    where: { isDeleted: false },
    orderBy: { label: 'asc' },
  });

  return cupCosts;
};

export const createNewCupCostService = async (label: string, value: number) => {
  const newCupCost = await prisma.cupCost.create({
    data: {
      label,
      value,
      isDeleted: false,
    },
  });

  return newCupCost;
};

export const putCupCostService = async (
  cupCostId: number,
  label: string,
  value: number
) => {
  const updatedCupCost = await prisma.cupCost.update({
    where: { id: cupCostId },
    data: {
      label,
      value,
    },
  });

  return updatedCupCost;
};

export const deleteCupCostService = async (cupCostId: number) => {
  const deletedCupCost = await prisma.cupCost.update({
    where: { id: cupCostId },
    data: { isDeleted: true },
  });

  return deletedCupCost;
};
