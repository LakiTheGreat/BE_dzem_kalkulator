import { TransactionStatus } from '@prisma/client';
import prisma from '../utils/db.js';

export const getTransactionsService = async (userId: number) => {
  return prisma.transaction.findMany({
    where: {
      userId,
      isDeleted: false,
    },
    include: {
      orderType: true,
      user: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const createTransactionService = async (data: {
  orderTypeId: number;
  cupData: { cupId: number; quantity: number }[];
  status: TransactionStatus;
  userId: number;
}) => {
  return prisma.transaction.create({
    data: {
      orderTypeId: data.orderTypeId,
      cups: data.cupData,
      status: data.status,
      userId: data.userId,
    },
    include: {
      orderType: true,
      user: true,
    },
  });
};
