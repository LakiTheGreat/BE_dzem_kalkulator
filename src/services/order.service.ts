import { OrderReq } from '../types/orders.js';
import prisma from '../utils/db.js';

export const getAllOrdersService = async (whereClause: any) => {
  const orders = await prisma.order.findMany({
    where: whereClause,
    include: {
      orderType: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return orders;
};

export const getOrderByIdService = async (id: number) => {
  const order = await prisma.order.findUnique({
    where: { id, isDeleted: false },
    include: { orderType: true },
  });

  return order;
};

export const createNewOrderService = async ({
  baseFruitIsFree,
  orderTypeId,
  orderName,
  fruits,
  cups,
  profitMargin,
}: OrderReq) => {
  const newOrder = await prisma.order.create({
    data: {
      baseFruitIsFree,
      orderTypeId,
      orderName,
      fruits,
      cups,
      profitMargin,
    },
  });

  return newOrder;
};

export const deleteOrderService = async (id: number) => {
  const order = await prisma.order.update({
    where: { id },
    data: { isDeleted: true },
  });

  return order;
};
