import prisma from '../utils/db.js';

export const getAllFruitsService = async (userId: number) => {
  const fruits = await prisma.fruit.findMany({
    where: {
      isDeleted: false,
      userId,
    },
    orderBy: {
      label: 'asc',
    },
  });

  return fruits;
};

export const getAlLFruitsWithSameNameService = async (
  baseName: string,
  userId: number
) => {
  const existingFruits = await prisma.fruit.findMany({
    where: {
      userId,
      label: {
        startsWith: baseName,
      },
    },
  });

  return existingFruits;
};

export const createNewFruitService = async (name: string, userId: number) => {
  const newFruit = await prisma.fruit.create({
    data: {
      label: name,
      userId,
    },
  });

  return newFruit;
};

export const patchFruitService = async (
  fruitId: number,
  label: string,
  userId: number
) => {
  const updatedFruit = await prisma.fruit.update({
    where: { id: fruitId, userId },
    data: { label },
  });

  return updatedFruit;
};

export const deleteFruitService = async (fruitId: number, userId: number) => {
  const fruit = await prisma.fruit.update({
    where: { id: fruitId, userId },
    data: { isDeleted: true },
  });

  return fruit;
};
