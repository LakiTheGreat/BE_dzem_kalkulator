import { BouquetTransactionEnum } from '@prisma/client';
import prisma from '../utils/db.js';

export async function createBouquetTransactionService(data: {
  note?: string;
  userId?: number;
  totalExpense: number;
  income: number;
  profit: number;
  profitMargin: number;
  status: BouquetTransactionEnum;
}) {
  const bouquetTransaction = await prisma.bouquetTransaction.create({
    data: {
      note: data.note || '',
      userId: data.userId || 1,
      totalExpense: data.totalExpense,
      income: data.income,
      profit: data.profit,
      profitMargin: data.profitMargin,
      status: data.status,
    },
  });
  return bouquetTransaction;
}

export async function getBouquetTransactionByIdService(
  id: number,
  userId: number
) {
  return prisma.bouquetTransaction.findUnique({
    where: { id, userId },
    select: {
      id: true,
      note: true,
      totalExpense: true,
      income: true,
      profit: true,
      isDeleted: true,
      createdAt: true,
      profitMargin: true,
      status: true,
      // userId  excluded
    },
  });
}

export async function getAllBouquetTransactionsService(
  userId: number,
  whereClause: any
) {
  return prisma.bouquetTransaction.findMany({
    where: {
      userId,
      isDeleted: false,
      ...whereClause,
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      note: true,
      totalExpense: true,
      income: true,
      profit: true,
      isDeleted: true,
      createdAt: true,
      profitMargin: true,
      status: true,
      // userId excluded
    },
  });
}

export async function updateBouquetTransactionService(
  id: number,
  data: {
    note?: string;
    totalExpense?: number;
    income?: number;
    profit?: number;
    isDeleted?: boolean;
    profitMargin?: number;
    status: BouquetTransactionEnum;
  },
  userId: number
) {
  return prisma.bouquetTransaction.update({
    where: { id, userId },
    data,
    select: {
      id: true,
      note: true,
      totalExpense: true,
      income: true,
      profit: true,
      isDeleted: true,
      createdAt: true,
      profitMargin: true,
    },
  });
}
