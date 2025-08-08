import prisma from '../utils/db.js';

export const getAllCupsWithDataService = async (userId: number) => {
  const cups = await prisma.cup.findMany({
    where: {
      isDeleted: false,
      userId,
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
  valueId: number,
  userId: number
) => {
  const cup = await prisma.cup.create({
    data: {
      label,
      cost: { connect: { id: costId } },
      sellingPrice: { connect: { id: valueId } },
      user: { connect: { id: userId } },
    },
    include: {
      cost: true,
      sellingPrice: true,
    },
  });

  return cup;
};

export const findCostCupService = async (costId: number, userId: number) => {
  const costCup = await prisma.cupCost.findFirst({
    where: { id: costId, isDeleted: false, userId },
  });

  return costCup;
};

export const findCostValueService = async (valueId: number, userId: number) => {
  const costValue = await prisma.cupValue.findFirst({
    where: { id: valueId, isDeleted: false, userId },
  });
  return costValue;
};

export const putCupService = async (
  cupId: number,
  label: string,
  costId: number,
  valueId: number,
  userId: number
) => {
  const updatedCup = await prisma.cup.update({
    where: { id: cupId },
    data: {
      label,
      cost: { connect: { id: costId } },
      sellingPrice: { connect: { id: valueId } },
      user: { connect: { id: userId } },
    },
    include: {
      cost: true,
      sellingPrice: true,
    },
  });

  return updatedCup;
};

export const deleteCupService = async (cupId: number, userId: number) => {
  const cup = await prisma.cup.update({
    where: { id: cupId, userId },
    data: { isDeleted: true },
  });

  return cup;
};

export const getUserCupIdsService = async (userId: number) => {
  const cups = await prisma.cup.findMany({
    where: { userId, isDeleted: false },
    select: { id: true },
  });

  return cups.map((cup) => cup.id);
};

export const getAllCupsService = async (userId: number) => {
  const cups = await prisma.cup.findMany({
    where: { userId, isDeleted: false },
  });

  return cups;
};
