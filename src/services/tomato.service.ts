import { TransactionStatus } from '@prisma/client';
import prisma from '../utils/db.js';

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
