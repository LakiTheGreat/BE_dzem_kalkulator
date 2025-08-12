import prisma from '../utils/db.js';

export async function createBouquetTransactionService(data: {
  note?: string;
  userId?: number;
  totalExpense: number;
  income: number;
  profit: number;
  profitMargin: number;
}) {
  const bouquetTransaction = await prisma.bouquetTransaction.create({
    data: {
      note: data.note || '',
      userId: data.userId || 1,
      totalExpense: data.totalExpense,
      income: data.income,
      profit: data.profit,
      profitMargin: data.profitMargin,
    },
  });
  return bouquetTransaction;
}

export async function getBouquetTransactionByIdService(id: number) {
  return prisma.bouquetTransaction.findUnique({
    where: { id },
    select: {
      id: true,
      note: true,
      totalExpense: true,
      income: true,
      profit: true,
      isDeleted: true,
      createdAt: true,
      profitMargin: true,
      // userId  excluded
    },
  });
}

export async function getAllBouquetTransactionsService() {
  return prisma.bouquetTransaction.findMany({
    where: { isDeleted: false },
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
  }
) {
  return prisma.bouquetTransaction.update({
    where: { id },
    data,
    select: {
      id: true,
      note: true,
      totalExpense: true,
      income: true,
      profit: true,
      isDeleted: true,
      createdAt: true,
    },
  });
}
