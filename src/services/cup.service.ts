import prisma from '../utils/db.js';

export const getAllCupsWithDataService = async () => {
  const cups = await prisma.cup.findMany({
    where: {
      isDeleted: false,
    },
    orderBy: {
      label: 'asc',
    },
    include: {
      cost: true,
      sellingPrice: true,
    },
  });

  return cups;
};

export const createNewCupService = async (
  label: string,
  costId: number,
  valueId: number
) => {
  const cup = await prisma.cup.create({
    data: {
      label,
      cost: { connect: { id: costId } },
      sellingPrice: { connect: { id: valueId } },
    },
    include: {
      cost: true,
      sellingPrice: true,
    },
  });

  return cup;
};

export const findCostCupService = async (costId: number) => {
  const costCup = await prisma.cupCost.findFirst({
    where: { id: costId, isDeleted: false },
  });

  return costCup;
};

export const findCostValueService = async (valueId: number) => {
  const costValue = await prisma.cupValue.findFirst({
    where: { id: valueId, isDeleted: false },
  });
  return costValue;
};

export const putCupService = async (
  cupId: number,
  label: string,
  costId: number,
  valueId: number
) => {
  const updatedCup = await prisma.cup.update({
    where: { id: cupId },
    data: {
      label,
      cost: { connect: { id: costId } },
      sellingPrice: { connect: { id: valueId } },
    },
    include: {
      cost: true,
      sellingPrice: true,
    },
  });

  return updatedCup;
};

export const deleteCupService = async (cupId: number) => {
  const cup = await prisma.cup.update({
    where: { id: cupId },
    data: { isDeleted: true },
  });

  return cup;
};
