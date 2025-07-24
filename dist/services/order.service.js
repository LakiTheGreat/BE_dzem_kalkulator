import prisma from '../utils/db.js';
export const getAllOrdersService = async (whereClause) => {
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
export const getOrderByIdService = async (id, userId) => {
    const order = await prisma.order.findUnique({
        where: { id, isDeleted: false, userId },
        include: { orderType: true },
    });
    return order;
};
export const createNewOrderService = async ({ baseFruitIsFree, orderTypeId, orderName, fruits, cups, otherExpensesMargin, userId, }) => {
    const newOrder = await prisma.order.create({
        data: {
            baseFruitIsFree,
            orderTypeId,
            orderName,
            fruits,
            cups,
            otherExpensesMargin,
            userId, // <-- add userId here
        },
    });
    return newOrder;
};
export const deleteOrderService = async (id, userId) => {
    const order = await prisma.order.update({
        where: { id, userId },
        data: { isDeleted: true },
    });
    return order;
};
export const putOrderService = async (id, data, userId) => {
    const updatedOrder = await prisma.order.update({
        where: { id, userId },
        data: {
            orderName: data.orderName,
            orderTypeId: data.orderTypeId,
            baseFruitIsFree: data.baseFruitIsFree,
            otherExpensesMargin: data.otherExpensesMargin,
            cups: data.cups,
            fruits: data.fruits,
        },
    });
    return updatedOrder;
};
//# sourceMappingURL=order.service.js.map