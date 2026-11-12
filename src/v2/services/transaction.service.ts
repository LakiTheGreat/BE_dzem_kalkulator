import { Prisma, TransactionStatus } from '@prisma/client';

import prisma from '../../utils/db.js';
import { periodToCreatedAt } from '../utils/period.js';
import {
  assertCupsExist,
  assertFruitExists,
  withStockGuard,
} from './jamStock.service.js';

export type TransactionInput = {
  orderTypeId: number;
  status: TransactionStatus;
  note?: string;
  cupData: { cupId: number; quantity: number }[];
};

// Same response shape for get-by-id, create and update (userId is never exposed).
const transactionSelect = {
  id: true,
  orderTypeId: true,
  note: true,
  cups: true,
  status: true,
  isDeleted: true,
  createdAt: true,
} as const;

type StoredCup = { cupId: number; quantity: number };

// A transaction always takes jars out of the stock, whatever sign the client sent.
const transactionData = (data: TransactionInput) => ({
  orderTypeId: data.orderTypeId,
  status: data.status,
  note: data.note ?? '',
  cups: data.cupData.map((cup) => ({
    cupId: cup.cupId,
    quantity: -Math.abs(cup.quantity),
  })) as Prisma.InputJsonValue[],
});

export const getAllTransactionsService = async (
  userId: number,
  filters: {
    orderTypeId?: number;
    status?: TransactionStatus;
    year?: number;
    month?: number;
  }
) => {
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      isDeleted: false,
      createdAt: periodToCreatedAt(filters.year, filters.month),
      ...(filters.orderTypeId && { orderTypeId: filters.orderTypeId }),
      ...(filters.status && { status: filters.status }),
    },
    include: { orderType: { select: { label: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const cupIds = [
    ...new Set(
      transactions.flatMap((t) => (t.cups as StoredCup[]).map((c) => c.cupId))
    ),
  ];
  const cups = await prisma.cup.findMany({
    where: { id: { in: cupIds }, userId },
    select: { id: true, label: true },
  });
  const cupLabels = new Map(cups.map((cup) => [cup.id, cup.label]));

  return transactions.map((t) => ({
    id: t.id,
    orderType: t.orderType.label,
    cups: (t.cups as StoredCup[]).map((cup) => ({
      ...cup,
      quantity: Math.abs(cup.quantity),
      label: cupLabels.get(cup.cupId) ?? null,
    })),
    status: t.status,
    createdAt: t.createdAt,
    isDeleted: t.isDeleted,
    note: t.note,
  }));
};

// Returns null when the row does not exist, is deleted or belongs to another user.
export const getTransactionByIdService = (id: number, userId: number) =>
  prisma.transaction.findFirst({
    where: { id, userId, isDeleted: false },
    select: transactionSelect,
  });

export const createTransactionService = (
  data: TransactionInput,
  userId: number
) =>
  prisma.$transaction(async (tx) => {
    await assertFruitExists(tx, data.orderTypeId, userId);
    await assertCupsExist(
      tx,
      data.cupData.map((cup) => cup.cupId),
      userId
    );

    return withStockGuard(tx, userId, [data.orderTypeId], () =>
      tx.transaction.create({
        data: { ...transactionData(data), userId },
        select: transactionSelect,
      })
    );
  });

// Returns null when the row does not exist, is deleted or belongs to another user.
// Stock is derived, so the old fruit gets its jars back automatically.
export const updateTransactionService = (
  id: number,
  data: TransactionInput,
  userId: number
) =>
  prisma.$transaction(async (tx) => {
    const existing = await tx.transaction.findFirst({
      where: { id, userId, isDeleted: false },
      select: { orderTypeId: true },
    });

    if (!existing) return null;

    await assertFruitExists(tx, data.orderTypeId, userId);
    await assertCupsExist(
      tx,
      data.cupData.map((cup) => cup.cupId),
      userId
    );

    return withStockGuard(
      tx,
      userId,
      [existing.orderTypeId, data.orderTypeId],
      async () => {
        const { count } = await tx.transaction.updateMany({
          where: { id, userId, isDeleted: false },
          data: transactionData(data),
        });

        if (count === 0) return null;

        return tx.transaction.findUniqueOrThrow({
          where: { id },
          select: transactionSelect,
        });
      }
    );
  });

// Deleting a transaction only returns jars to the stock, so no stock check is needed.
// Returns false when the row does not exist, is deleted or belongs to another user.
export const deleteTransactionService = async (id: number, userId: number) => {
  const { count } = await prisma.transaction.updateMany({
    where: { id, userId, isDeleted: false },
    data: { isDeleted: true },
  });

  return count > 0;
};
