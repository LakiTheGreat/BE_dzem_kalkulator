import { BouquetTransactionEnum } from '@prisma/client';

import prisma from '../../utils/db.js';

// Same response shape for every endpoint (userId is never exposed).
const bouquetSelect = {
  id: true,
  note: true,
  status: true,
  totalExpense: true,
  income: true,
  profit: true,
  profitMargin: true,
  isDeleted: true,
  createdAt: true,
} as const;

export type BouquetInput = {
  note?: string;
  status: BouquetTransactionEnum;
  totalExpense: number;
  income: number;
  profit: number;
  profitMargin: number;
};

export const getAllBouquetsService = (
  userId: number,
  status?: BouquetTransactionEnum
) =>
  prisma.bouquetTransaction.findMany({
    where: { userId, isDeleted: false, ...(status && { status }) },
    orderBy: { createdAt: 'desc' },
    select: bouquetSelect,
  });

// Returns null when the row does not exist, is deleted or belongs to another user.
export const getBouquetByIdService = (id: number, userId: number) =>
  prisma.bouquetTransaction.findFirst({
    where: { id, userId, isDeleted: false },
    select: bouquetSelect,
  });

export const createBouquetService = (data: BouquetInput, userId: number) =>
  prisma.bouquetTransaction.create({
    data: { ...data, userId },
    select: bouquetSelect,
  });

// Returns null when the row does not exist, is deleted or belongs to another user.
// `isDeleted: true` is how the UI soft-deletes a row.
export const updateBouquetService = async (
  id: number,
  data: BouquetInput & { isDeleted?: boolean },
  userId: number
) => {
  const { count } = await prisma.bouquetTransaction.updateMany({
    where: { id, userId, isDeleted: false },
    data,
  });
  if (count === 0) return null;

  return prisma.bouquetTransaction.findUniqueOrThrow({
    where: { id },
    select: bouquetSelect,
  });
};
