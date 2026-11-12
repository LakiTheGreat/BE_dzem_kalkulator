import { Prisma } from '@prisma/client';
import status from 'http-status';

import AppError from '../../utils/AppError.js';
import prisma from '../../utils/db.js';

export type Db = Prisma.TransactionClient;

type OrderCup = { id: number; numberOf: number | string };
type TransactionCup = { cupId: number; quantity: number };

// fruitId -> cupId -> number of jars
export type Stock = Map<number, Map<number, number>>;

const NOT_ENOUGH_MESSAGE = 'Nema dovoljno tegli na stanju';

const addTo = (stock: Stock, fruitId: number, cupId: number, quantity: number) => {
  const cups = stock.get(fruitId) ?? new Map<number, number>();
  cups.set(cupId, (cups.get(cupId) ?? 0) + quantity);
  stock.set(fruitId, cups);
};

// Stock is derived, never stored:
// SUM(order cups) - SUM(abs(transaction cups)) + SUM(corrections), non-deleted rows only.
export const getStock = async (
  db: Db,
  userId: number,
  fruitIds?: number[]
): Promise<Stock> => {
  const where = {
    userId,
    isDeleted: false,
    ...(fruitIds && { orderTypeId: { in: fruitIds } }),
  };

  const [orders, transactions, corrections] = await Promise.all([
    db.order.findMany({ where, select: { orderTypeId: true, cups: true } }),
    db.transaction.findMany({
      where,
      select: { orderTypeId: true, cups: true },
    }),
    db.inventoryCorrection.groupBy({
      by: ['orderTypeId', 'cupId'],
      where,
      _sum: { quantity: true },
    }),
  ]);

  const stock: Stock = new Map();

  orders.forEach((order) =>
    (order.cups as OrderCup[]).forEach((cup) =>
      addTo(stock, order.orderTypeId, Number(cup.id), Number(cup.numberOf))
    )
  );
  transactions.forEach((transaction) =>
    (transaction.cups as TransactionCup[]).forEach((cup) =>
      addTo(
        stock,
        transaction.orderTypeId,
        Number(cup.cupId),
        -Math.abs(Number(cup.quantity))
      )
    )
  );
  corrections.forEach((row) =>
    addTo(stock, row.orderTypeId, row.cupId, row._sum.quantity ?? 0)
  );

  return stock;
};

// Runs a change inside the caller's DB transaction and throws (rolling it back)
// if it would push the stock of an affected fruit/cup below zero.
// Stock that was already negative before the change is not blocked from recovering.
export const withStockGuard = async <T>(
  db: Db,
  userId: number,
  fruitIds: number[],
  change: () => Promise<T>
) => {
  const ids = [...new Set(fruitIds)];
  const before = await getStock(db, userId, ids);
  const result = await change();
  const after = await getStock(db, userId, ids);

  for (const [fruitId, cups] of after) {
    for (const [cupId, quantity] of cups) {
      const was = before.get(fruitId)?.get(cupId) ?? 0;

      if (quantity < 0 && quantity < was) {
        throw new AppError(NOT_ENOUGH_MESSAGE, status.BAD_REQUEST);
      }
    }
  }

  return result;
};

export const assertFruitExists = async (
  db: Db,
  fruitId: number,
  userId: number
) => {
  const fruit = await db.fruit.findFirst({
    where: { id: fruitId, userId, isDeleted: false },
    select: { id: true },
  });

  if (!fruit) {
    throw new AppError('Voće nije pronađeno', status.NOT_FOUND);
  }
};

export const assertCupsExist = async (
  db: Db,
  cupIds: number[],
  userId: number
) => {
  const ids = [...new Set(cupIds)];
  const count = await db.cup.count({
    where: { id: { in: ids }, userId, isDeleted: false },
  });

  if (count !== ids.length) {
    throw new AppError('Tegla nije pronađena', status.NOT_FOUND);
  }
};

export const assertFruitsExist = async (
  db: Db,
  fruitIds: number[],
  userId: number
) => {
  const ids = [...new Set(fruitIds)];
  const count = await db.fruit.count({
    where: { id: { in: ids }, userId, isDeleted: false },
  });

  if (count !== ids.length) {
    throw new AppError('Voće nije pronađeno', status.NOT_FOUND);
  }
};

export const getInventoryGroupedService = async (userId: number) => {
  const [stock, fruits, cups] = await Promise.all([
    getStock(prisma, userId),
    prisma.fruit.findMany({
      where: { userId, isDeleted: false },
      select: { id: true, label: true },
    }),
    prisma.cup.findMany({
      where: { userId, isDeleted: false },
      select: { id: true, label: true },
    }),
  ]);

  const fruitLabels = new Map(fruits.map((fruit) => [fruit.id, fruit.label]));
  const cupLabels = new Map(cups.map((cup) => [cup.id, cup.label]));

  return [...stock.entries()]
    .map(([orderTypeId, cupMap]) => ({
      orderTypeId,
      label: fruitLabels.get(orderTypeId) ?? null,
      cups: [...cupMap.entries()]
        .map(([cupId, numberOf]) => ({
          cupId,
          label: cupLabels.get(cupId) ?? null,
          numberOf,
        }))
        .sort((a, b) => labelNumber(a.label) - labelNumber(b.label)),
    }))
    .sort((a, b) => (a.label ?? '').localeCompare(b.label ?? ''));
};

export const getInventoryOverviewService = async (userId: number) => {
  const [stock, cups] = await Promise.all([
    getStock(prisma, userId),
    prisma.cup.findMany({
      where: { userId, isDeleted: false },
      select: { id: true, label: true },
    }),
  ]);

  const totals = new Map<number, number>();
  stock.forEach((cupMap) =>
    cupMap.forEach((quantity, cupId) =>
      totals.set(cupId, (totals.get(cupId) ?? 0) + quantity)
    )
  );

  return cups
    .map((cup) => ({ label: cup.label, numberOf: totals.get(cup.id) ?? 0 }))
    .sort((a, b) => labelNumber(a.label) - labelNumber(b.label));
};

// Labels look like "212ml"; a label without a number sorts last.
const labelNumber = (label: string | null) => {
  const value = parseInt(label ?? '', 10);

  return Number.isNaN(value) ? Number.MAX_SAFE_INTEGER : value;
};

export type CorrectionInput = {
  orderTypeId: number;
  cupData: { cupId: number; quantity: number }[];
};

export const createCorrectionsService = (
  data: CorrectionInput,
  userId: number
) =>
  prisma.$transaction(async (tx) => {
    await assertFruitExists(tx, data.orderTypeId, userId);
    await assertCupsExist(
      tx,
      data.cupData.map((item) => item.cupId),
      userId
    );

    return withStockGuard(tx, userId, [data.orderTypeId], () =>
      Promise.all(
        data.cupData.map((item) =>
          tx.inventoryCorrection.create({
            data: {
              orderTypeId: data.orderTypeId,
              cupId: item.cupId,
              quantity: item.quantity,
              userId,
            },
            select: {
              id: true,
              orderTypeId: true,
              cupId: true,
              quantity: true,
              createdAt: true,
            },
          })
        )
      )
    );
  });
