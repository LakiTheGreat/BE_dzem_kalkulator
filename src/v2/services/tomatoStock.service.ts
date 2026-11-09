import { Prisma } from '@prisma/client';
import status from 'http-status';

import AppError from '../../utils/AppError.js';
import prisma from '../../utils/db.js';

export type Db = Prisma.TransactionClient;

export const getTomatoCupsService = (userId: number) =>
  prisma.tomatoCup.findMany({
    where: { isDeleted: false, userId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, label: true },
  });

export const assertTomatoCupExists = async (
  db: Db,
  cupTypeId: number,
  userId: number
) => {
  const cup = await db.tomatoCup.findFirst({
    where: { id: cupTypeId, userId, isDeleted: false },
    select: { id: true },
  });

  if (!cup) {
    throw new AppError('Tegla nije pronađena', status.NOT_FOUND);
  }
};

// Stock is derived, never stored: SUM(orders) - SUM(transactions), non-deleted rows only.
const getStock = async (db: Db, userId: number, cupTypeIds?: number[]) => {
  const where = {
    userId,
    isDeleted: false,
    ...(cupTypeIds && { cupTypeId: { in: cupTypeIds } }),
  };

  const [orders, transactions] = await Promise.all([
    db.tomatoOrder.groupBy({
      by: ['cupTypeId'],
      where,
      _sum: { numOfCups: true },
    }),
    db.tomatoOrderTransaction.groupBy({
      by: ['cupTypeId'],
      where,
      _sum: { numOfCups: true },
    }),
  ]);

  const stock = new Map<number, { ordered: number; used: number }>();
  const entry = (id: number) => {
    if (!stock.has(id)) stock.set(id, { ordered: 0, used: 0 });
    return stock.get(id)!;
  };

  orders.forEach((o) => (entry(o.cupTypeId).ordered = o._sum.numOfCups ?? 0));
  transactions.forEach(
    (t) => (entry(t.cupTypeId).used = t._sum.numOfCups ?? 0)
  );

  return stock;
};

export const getTomatoTotalsService = async (userId: number) => {
  const stock = await getStock(prisma, userId);

  const cups = await prisma.tomatoCup.findMany({
    where: { userId, id: { in: [...stock.keys()] } },
    select: { id: true, label: true },
  });
  const labels = new Map(cups.map((cup) => [cup.id, cup.label]));

  return [...stock.entries()]
    .sort(([a], [b]) => a - b)
    .map(([cupTypeId, { ordered, used }]) => ({
      cupTypeId,
      label: labels.get(cupTypeId) ?? 'Unknown',
      totalOrdered: ordered,
      totalUsedInTransactions: used,
      totalCups: ordered - used,
    }));
};

// Runs a change inside the caller's DB transaction and throws (rolling it back)
// if it would push the stock of an affected cup type below zero.
// Stock that was already negative before the change is not blocked from recovering.
export const withStockGuard = async <T>(
  db: Db,
  userId: number,
  cupTypeIds: number[],
  change: () => Promise<T>
) => {
  const ids = [...new Set(cupTypeIds)];
  const before = await getStock(db, userId, ids);
  const result = await change();
  const after = await getStock(db, userId, ids);

  for (const id of ids) {
    const left = after.get(id);
    const was = before.get(id);
    const afterTotal = left ? left.ordered - left.used : 0;
    const beforeTotal = was ? was.ordered - was.used : 0;

    if (afterTotal < 0 && afterTotal < beforeTotal) {
      throw new AppError('Nema dovoljno tegli na stanju', status.BAD_REQUEST);
    }
  }

  return result;
};
