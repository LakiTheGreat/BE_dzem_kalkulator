import prisma from '../../utils/db.js';

export const getAllFruitsService = (userId: number) =>
  prisma.fruit.findMany({
    where: { isDeleted: false, userId },
    orderBy: { label: 'asc' },
  });
