import prisma from '../utils/db.js';
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
//# sourceMappingURL=tomato.service.js.map