import { TransactionStatus } from '@prisma/client';
import status from 'http-status';

import { CupData } from '../types/inventory.js';
import AppError from '../utils/AppError.js';
import prisma from '../utils/db.js';

export const getTransactionsService = async (
  userId: number,
  whereClause: any
) => {
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      isDeleted: false,
      ...whereClause,
    },
    include: {
      orderType: {
        select: { label: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const allCupIds = transactions.flatMap((t) =>
    (t.cups as CupData[]).map((c) => c.cupId)
  );
  const uniqueCupIds = [...new Set(allCupIds)];

  const cups = await prisma.cup.findMany({
    where: { id: { in: uniqueCupIds } },
    select: { id: true, label: true },
  });
  const cupMap = Object.fromEntries(cups.map((c) => [c.id, c.label]));

  return transactions.map((t) => ({
    id: t.id,
    orderType: t.orderType.label,
    cups: (t.cups as CupData[]).map((c) => ({
      ...c,
      quantity: Math.abs(c.quantity), // returns positive quantity
      label: cupMap[c.cupId] || null,
    })),
    status: t.status,
    createdAt: t.createdAt,
    isDeleted: t.isDeleted,
    note: t.note,
  }));
};

export const createTransactionService = async (data: {
  orderTypeId: number;
  cupData: { cupId: number; quantity: number }[];
  status: TransactionStatus;
  userId: number;
  note: string;
}) => {
  return prisma.transaction.create({
    data: {
      orderTypeId: data.orderTypeId,
      cups: data.cupData,
      status: data.status,
      userId: data.userId,
      note: data.note,
    },
    include: {
      orderType: true,
      user: true,
    },
  });
};

export const updateTransactionService = async (
  id: number,
  userId: number,
  data: {
    orderTypeId: number;
    status: TransactionStatus;
    cupData: { cupId: number; quantity: number }[];
    note: string;
  }
) => {
  return prisma.transaction.update({
    where: {
      id,
      userId,
      isDeleted: false,
    },
    data: {
      orderTypeId: data.orderTypeId,
      status: data.status,
      cups: data.cupData,
      note: data.note,
    },
  });
};

export const getTransactionByIdService = async (id: number, userId: number) => {
  const order = await prisma.transaction.findUnique({
    where: { id, userId },
  });

  return order;
};

export const adjustInventoryForTransactionUpdate = async (
  oldCupData: CupData[],
  newCupData: CupData[],
  inventoryCupData: CupData[]
) => {
  const oldMap = new Map<number, number>();
  oldCupData.forEach((c) => oldMap.set(c.cupId, c.quantity));

  // Collect all cupIds from old and new data
  const allCupIds = new Set<number>();
  oldCupData.forEach((c) => allCupIds.add(c.cupId));
  newCupData.forEach((c) => allCupIds.add(c.cupId));

  // Calculate differences and update inventoryCupData in place
  for (const cupId of allCupIds) {
    const oldQty = oldMap.get(cupId) ?? 0;
    const newQtyObj = newCupData.find((c) => c.cupId === cupId);
    const newQty = newQtyObj ? newQtyObj.quantity : 0;

    const diff = newQty - oldQty;
    if (diff === 0) continue;

    const idx = inventoryCupData.findIndex((c) => c.cupId === cupId);
    if (idx === -1) {
      throw new AppError(
        `CupId ${cupId} not found in inventory`,
        status.NOT_FOUND
      );
    }

    // Since quantities in transaction are negative removals, add diff to inventory
    inventoryCupData[idx].quantity += diff;

    if (inventoryCupData[idx].quantity < 0) {
      throw new AppError(
        `Inventory quantity for cupId ${cupId} cannot be negative`,
        status.BAD_REQUEST
      );
    }
  }

  return inventoryCupData;
};

export const softDeleteTransactionService = async (
  transactionId: number,
  userId: number
) => {
  // Find transaction with its cups
  const transaction = await getTransactionByIdService(transactionId, userId);

  if (!transaction) {
    throw new AppError('Transaction not found', status.NOT_FOUND);
  }

  // Soft delete transaction
  const updatedTransaction = await prisma.transaction.update({
    where: { id: transactionId },
    data: { isDeleted: true },
  });

  if (!updatedTransaction) {
    throw new AppError('Failed to soft delete transaction', status.BAD_REQUEST);
  }

  return updatedTransaction;
};
