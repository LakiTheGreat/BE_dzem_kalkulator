import prisma from '../utils/db.js';
export async function getTomatoOrderByIdService(id, userId) {
    return prisma.tomatoOrder.findUnique({
        where: { id, userId },
    });
}
export async function getAllTomatoCupsService(whereClause) {
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
export async function createTomatoOrderService(data) {
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
export async function getAllTomatoOrdersService(whereClause) {
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
export async function updateTomatoOrderService(id, data, userId) {
    return prisma.tomatoOrder.update({
        where: { id, userId },
        data,
    });
}
export const deleteTomatoOrderService = async (id, userId) => {
    const order = await prisma.tomatoOrder.update({
        where: { id, userId },
        data: { isDeleted: true },
    });
    return order;
};
//# sourceMappingURL=tomato.service.js.map