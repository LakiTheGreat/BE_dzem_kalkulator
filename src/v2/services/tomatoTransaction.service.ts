import { TransactionStatus } from '@prisma/client';

import prisma from '../../utils/db.js';
import { periodToCreatedAt } from '../utils/period.js';
import {
  assertTomatoCupExists,
  withStockGuard,
} from './tomatoStock.service.js';

type TransactionInput = {
  note: string;
  status: TransactionStatus;
  cupTypeId: number;
  numOfCups: number;
  pricePerCup: number;
};

export const getAllTomatoTransactionsService = async (
  userId: number,
  filters: { year?: number; month?: number; status?: TransactionStatus }
) => {
  const transactions = await prisma.tomatoOrderTransaction.findMany({
    where: {
      isDeleted: false,
      userId,
      createdAt: periodToCreatedAt(filters.year, filters.month),
      ...(filters.status && { status: filters.status }),
    },
    include: { cupType: { select: { label: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return transactions.map(({ cupType, ...rest }) => ({
    ...rest,
    label: cupType?.label ?? 'Unknown',
  }));
};

export const getTomatoTransactionByIdService = (id: number, userId: number) =>
  prisma.tomatoOrderTransaction.findFirst({
    where: { id, userId, isDeleted: false },
  });

export const createTomatoTransactionService = (
  data: TransactionInput,
  userId: number
) =>
  prisma.$transaction(async (tx) => {
    await assertTomatoCupExists(tx, data.cupTypeId, userId);

    const created = await withStockGuard(
      tx,
      userId,
      [data.cupTypeId],
      () =>
        tx.tomatoOrderTransaction.create({
          data: { ...data, userId },
          include: { cupType: { select: { label: true } } },
        })
    );

    return {
      id: created.id,
      note: created.note,
      status: created.status,
      cupTypeId: created.cupTypeId,
      cupTypeLabel: created.cupType.label,
      numOfCups: created.numOfCups,
      pricePerCup: created.pricePerCup,
      userId: created.userId,
      createdAt: created.createdAt,
      isDeleted: created.isDeleted,
    };
  });

export const updateTomatoTransactionService = (
  id: number,
  data: TransactionInput,
  userId: number
) =>
  prisma.$transaction(async (tx) => {
    const existing = await tx.tomatoOrderTransaction.findFirst({
      where: { id, userId, isDeleted: false },
    });

    if (!existing) return null;

    await assertTomatoCupExists(tx, data.cupTypeId, userId);

    return withStockGuard(
      tx,
      userId,
      [existing.cupTypeId, data.cupTypeId],
      () => tx.tomatoOrderTransaction.update({ where: { id }, data })
    );
  });

// Deleting a transaction only returns cups to stock, so no stock check is needed.
export const deleteTomatoTransactionService = async (
  id: number,
  userId: number
) => {
  const { count } = await prisma.tomatoOrderTransaction.updateMany({
    where: { id, userId, isDeleted: false },
    data: { isDeleted: true },
  });

  if (count === 0) return null;

  return prisma.tomatoOrderTransaction.findUnique({ where: { id } });
};
