import prisma from '../../utils/db.js';
import { periodToCreatedAt } from '../utils/period.js';
import {
  assertTomatoCupExists,
  withStockGuard,
} from './tomatoStock.service.js';

type OrderInput = {
  cupTypeId: number;
  totalExpenses: number;
  numOfCups: number;
};

export const getAllTomatoOrdersService = async (
  userId: number,
  year?: number,
  month?: number
) => {
  const orders = await prisma.tomatoOrder.findMany({
    where: { isDeleted: false, userId, createdAt: periodToCreatedAt(year, month) },
    include: { cupType: { select: { label: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return orders.map(({ cupType, ...rest }) => ({
    ...rest,
    label: cupType?.label ?? null,
  }));
};

export const getTomatoOrderByIdService = (id: number, userId: number) =>
  prisma.tomatoOrder.findFirst({ where: { id, userId, isDeleted: false } });

export const createTomatoOrderService = (data: OrderInput, userId: number) =>
  prisma.$transaction(async (tx) => {
    await assertTomatoCupExists(tx, data.cupTypeId, userId);

    return tx.tomatoOrder.create({ data: { ...data, userId } });
  });

export const updateTomatoOrderService = (
  id: number,
  data: OrderInput,
  userId: number
) =>
  prisma.$transaction(async (tx) => {
    const existing = await tx.tomatoOrder.findFirst({
      where: { id, userId, isDeleted: false },
    });

    if (!existing) return null;

    await assertTomatoCupExists(tx, data.cupTypeId, userId);

    return withStockGuard(
      tx,
      userId,
      [existing.cupTypeId, data.cupTypeId],
      () => tx.tomatoOrder.update({ where: { id }, data })
    );
  });

export const deleteTomatoOrderService = (id: number, userId: number) =>
  prisma.$transaction(async (tx) => {
    const existing = await tx.tomatoOrder.findFirst({
      where: { id, userId, isDeleted: false },
    });

    if (!existing) return null;

    return withStockGuard(tx, userId, [existing.cupTypeId], () =>
      tx.tomatoOrder.update({ where: { id }, data: { isDeleted: true } })
    );
  });
