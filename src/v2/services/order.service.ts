import { Prisma } from '@prisma/client';

import prisma from '../../utils/db.js';
import { periodToCreatedAt } from '../utils/period.js';
import {
  assertCupsExist,
  assertFruitExists,
  assertFruitsExist,
  withStockGuard,
} from './jamStock.service.js';

export type OrderCupInput = {
  id: number;
  label: string;
  numberOf: number;
  cost: number;
  sellingPrice: number;
  total: number;
};

export type OrderFruitInput = {
  grams: string;
  price: string;
  total: string;
  fruitId: number;
};

export type OrderInput = {
  orderName?: string;
  orderTypeId: number;
  baseFruitIsFree: boolean;
  otherExpensesMargin: number;
  cups: OrderCupInput[];
  fruits: OrderFruitInput[];
};

// Same response shape for create, update and delete (userId is never exposed).
const orderSelect = {
  id: true,
  orderName: true,
  orderTypeId: true,
  createdAt: true,
  isDeleted: true,
  baseFruitIsFree: true,
  cups: true,
  fruits: true,
  otherExpensesMargin: true,
} as const;

type StoredCup = {
  label: string;
  numberOf: number | string;
  cost: number | string;
  sellingPrice: number | string;
  total: number | string;
};

type StoredFruit = {
  grams: string;
  price: number | string;
  total: number | string;
  fruitId: number;
};

type ListFilters = {
  orderTypeId?: number;
  priceStatus?: number;
  year?: number;
  month?: number;
};

export const getAllOrdersService = async (
  userId: number,
  filters: ListFilters
) => {
  const [orders, fruits] = await Promise.all([
    prisma.order.findMany({
      where: {
        userId,
        isDeleted: false,
        createdAt: periodToCreatedAt(filters.year, filters.month),
        ...(filters.orderTypeId && { orderTypeId: filters.orderTypeId }),
        ...(filters.priceStatus && {
          baseFruitIsFree: filters.priceStatus === 1,
        }),
      },
      include: { orderType: { select: { label: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    // Deleted fruits are included so old orders keep their fruit names.
    prisma.fruit.findMany({
      where: { userId },
      select: { id: true, label: true },
    }),
  ]);

  const fruitLabels = new Map(fruits.map((fruit) => [fruit.id, fruit.label]));

  let totalValue = 0;
  let totalCost = 0;
  let totalProfit = 0;
  const cupTotalsByLabel = new Map<string, number>();

  const formattedOrders = orders.map((order) => {
    const orderFruits = (order.fruits as StoredFruit[]).map((fruit) => ({
      grams: fruit.grams,
      price: Number(fruit.price),
      total: Number(fruit.total),
      fruitId: fruit.fruitId,
      fruitName: fruitLabels.get(Number(fruit.fruitId)) ?? 'Unknown',
    }));

    const cups = (order.cups as StoredCup[]).map((cup) => {
      const numberOf = Number(cup.numberOf);
      cupTotalsByLabel.set(
        cup.label,
        (cupTotalsByLabel.get(cup.label) ?? 0) + numberOf
      );

      return {
        label: cup.label,
        numberOf,
        cost: Number(cup.cost),
        sellingPrice: Number(cup.sellingPrice),
        total: Number(cup.total),
      };
    });

    const cupsCost = cups.reduce((sum, cup) => sum + cup.total, 0);
    const fruitsCost = orderFruits.reduce((sum, fruit) => sum + fruit.total, 0);
    const baseCost = cupsCost + fruitsCost;
    const orderExpense = Math.round(
      baseCost + baseCost * (order.otherExpensesMargin / 100)
    );
    const orderValue = cups.reduce(
      (sum, cup) => sum + cup.sellingPrice * cup.numberOf,
      0
    );
    const orderProfit = orderValue - orderExpense;
    const profitMargin =
      orderExpense > 0 ? Math.round((orderProfit / orderExpense) * 100) : 0;

    totalCost += orderExpense;
    totalValue += orderValue;
    totalProfit += orderProfit;

    return {
      id: order.id,
      orderName: order.orderName,
      orderTypeId: order.orderTypeId,
      orderTypeName: order.orderType?.label || '',
      createdAt: order.createdAt,
      isDeleted: order.isDeleted,
      baseFruitIsFree: order.baseFruitIsFree,
      cups,
      fruits: orderFruits,
      orderValue,
      orderExpense,
      orderProfit,
      profitMargin: `${profitMargin}%`,
    };
  });

  return {
    orders: formattedOrders,
    totalValue: Math.round(totalValue),
    totalExpense: Math.round(totalCost),
    totalProfit: Math.round(totalProfit),
    totalCups: [...cupTotalsByLabel.entries()].map(([label, numberOf]) => ({
      label,
      numberOf,
    })),
  };
};

// Returns null when the order does not exist, is deleted or belongs to another user.
export const getOrderByIdService = (id: number, userId: number) =>
  prisma.order.findFirst({
    where: { id, userId, isDeleted: false },
    select: {
      ...orderSelect,
      orderType: { select: { id: true, label: true, isDeleted: true } },
    },
  });

const assertReferencesExist = async (
  db: Prisma.TransactionClient,
  data: OrderInput,
  userId: number
) => {
  await assertFruitExists(db, data.orderTypeId, userId);
  await assertCupsExist(
    db,
    data.cups.map((cup) => cup.id),
    userId
  );
  await assertFruitsExist(
    db,
    data.fruits.map((fruit) => fruit.fruitId),
    userId
  );
};

const orderData = (data: OrderInput) => ({
  orderName: data.orderName ?? '',
  orderTypeId: data.orderTypeId,
  baseFruitIsFree: data.baseFruitIsFree,
  cups: data.cups as unknown as Prisma.InputJsonValue[],
  fruits: data.fruits as unknown as Prisma.InputJsonValue[],
});

// Creating an order only adds jars to the stock, so no stock check is needed.
export const createOrderService = (data: OrderInput, userId: number) =>
  prisma.$transaction(async (tx) => {
    await assertReferencesExist(tx, data, userId);

    return tx.order.create({
      data: {
        ...orderData(data),
        otherExpensesMargin: data.otherExpensesMargin,
        userId,
      },
      select: orderSelect,
    });
  });

// Returns null when the order does not exist, is deleted or belongs to another user.
// otherExpensesMargin is never changed after creation, so old orders keep their profit.
export const updateOrderService = (
  id: number,
  data: OrderInput,
  userId: number
) =>
  prisma.$transaction(async (tx) => {
    const existing = await tx.order.findFirst({
      where: { id, userId, isDeleted: false },
      select: { orderTypeId: true },
    });

    if (!existing) return null;

    await assertReferencesExist(tx, data, userId);

    return withStockGuard(
      tx,
      userId,
      [existing.orderTypeId, data.orderTypeId],
      async () => {
        const { count } = await tx.order.updateMany({
          where: { id, userId, isDeleted: false },
          data: orderData(data),
        });

        if (count === 0) return null;

        return tx.order.findUniqueOrThrow({
          where: { id },
          select: orderSelect,
        });
      }
    );
  });

// Returns false when the order does not exist, is deleted or belongs to another user.
export const deleteOrderService = (id: number, userId: number) =>
  prisma.$transaction(async (tx) => {
    const existing = await tx.order.findFirst({
      where: { id, userId, isDeleted: false },
      select: { orderTypeId: true },
    });

    if (!existing) return false;

    return withStockGuard(tx, userId, [existing.orderTypeId], async () => {
      const { count } = await tx.order.updateMany({
        where: { id, userId, isDeleted: false },
        data: { isDeleted: true },
      });

      return count > 0;
    });
  });
