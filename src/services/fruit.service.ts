import prisma from '../utils/db.js';

export const getAllFruitsService = async () => {
  const fruits = await prisma.fruit.findMany({
    where: {
      isDeleted: false,
    },
    orderBy: {
      label: 'asc',
    },
  });

  return fruits;
};

export const getAlLFruitsWithSameNameService = async (baseName: string) => {
  const existingFruits = await prisma.fruit.findMany({
    where: {
      label: {
        startsWith: baseName,
      },
    },
  });

  return existingFruits;
};

export const createNewFruitService = async (name: string) => {
  const newFruit = await prisma.fruit.create({
    data: {
      label: name,
    },
  });

  return newFruit;
};

export const patchFruitService = async (fruitId: number, label: string) => {
  const updatedFruit = await prisma.fruit.update({
    where: { id: fruitId },
    data: { label },
  });

  return updatedFruit;
};

export const deleteFruitService = async (fruitId: number) => {
  const fruit = await prisma.fruit.update({
    where: { id: fruitId },
    data: { isDeleted: true },
  });

  return fruit;
};
