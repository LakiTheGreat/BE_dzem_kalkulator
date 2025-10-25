import { TransactionStatus } from '@prisma/client';
import prisma from '../utils/db.js';

export async function getTomatoOrderByIdService(id: number, userId: number) {
  return prisma.tomatoOrder.findUnique({
    where: { id, userId },
  });
}

export async function getAllTomatoCupsService(whereClause: any) {
  return prisma.tomatoCup.findMany({
    where: {
      ...whereClause,
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      label: true,
    },
  });
}

export async function createTomatoOrderService(data: {
  cupType: number;
  totalExpenses: number;
  numOfCups: number;
  userId: number;
}) {
  const tomatoOrder = await prisma.tomatoOrder.create({
    data: {
      cupTypeId: data.cupType,
      totalExpenses: data.totalExpenses,
      numOfCups: data.numOfCups,
      userId: data.userId,
    },
  });
  return tomatoOrder;
}

export async function getAllTomatoOrdersService(whereClause: any) {
  const orders = await prisma.tomatoOrder.findMany({
    where: {
      ...whereClause,
    },
    include: {
      cupType: {
        select: {
          label: true,
        },
      },
    },

    orderBy: { createdAt: 'desc' },
  });

  // Flatten cupType.label into a top-level field
  return orders.map(({ cupType, ...rest }) => ({
    ...rest,
    label: cupType?.label ?? null, // move label to top level
  }));
}

export async function updateTomatoOrderService(
  id: number,
  data: {
    numOfCups: number;
    totalExpense: number;
  },
  userId: number
) {
  return prisma.tomatoOrder.update({
    where: { id, userId },
    data,
  });
}

export const deleteTomatoOrderService = async (id: number, userId: number) => {
  const order = await prisma.tomatoOrder.update({
    where: { id, userId },
    data: { isDeleted: true },
  });

  return order;
};

export async function getTomatoCupTotalsService(
  userId: number,
  whereClause: any = {}
) {
  const results = await prisma.tomatoOrder.groupBy({
    by: ['cupTypeId'],
    _sum: {
      numOfCups: true,
    },
    where: {
      ...whereClause,
      userId,
    },
  });

  // const calculatedResults = results - transakcije

  //TODO: od ovoga treba oduzeti broj teglica u transakcijama i onda tto novo mapirati

  const cupTypes = await prisma.tomatoCup.findMany({
    where: {
      id: { in: results.map((r) => r.cupTypeId) },
    },
    select: {
      id: true,
      label: true,
    },
  });

  const labelLookup = cupTypes.reduce((acc, cup) => {
    acc[cup.id] = cup.label;
    return acc;
  }, {} as Record<number, string>);

  return results.map((r) => ({
    cupTypeId: r.cupTypeId,
    label: labelLookup[r.cupTypeId] || 'Unknown',
    totalCups: r._sum.numOfCups || 0,
  }));
}
