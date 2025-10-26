import prisma from '../utils/db.js';
export async function getTomatoOrderByIdService(id, userId) {
    return prisma.tomatoOrder.findUnique({
        where: { id, userId },
    });
}
export async function getTomatoTransactionByIdService(id, userId) {
    return prisma.tomatoOrderTransaction.findUnique({
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
export async function updateTomatoTransactionService(id, data, userId) {
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
export const deleteTomatoTransactionService = async (id, userId) => {
    const order = await prisma.tomatoOrderTransaction.update({
        where: { id, userId },
        data: { isDeleted: true },
    });
    return order;
};
export async function getTomatoCupTotalsService(userId, whereClause = {}) {
    // 1️⃣ Get total cups grouped by cupTypeId from TomatoOrder
    const orderResults = await prisma.tomatoOrder.groupBy({
        by: ['cupTypeId'],
        _sum: {
            numOfCups: true,
        },
        where: {
            ...whereClause,
            userId,
            isDeleted: false,
        },
    });
    // 2️⃣ Get total cups used in transactions grouped by cupTypeId
    const transactionResults = await prisma.tomatoOrderTransaction.groupBy({
        by: ['cupTypeId'],
        _sum: {
            numOfCups: true,
        },
        where: {
            userId,
            isDeleted: false,
        },
    });
    // 3️⃣ Build lookup for transaction totals
    const transactionLookup = transactionResults.reduce((acc, t) => {
        acc[t.cupTypeId] = t._sum.numOfCups || 0;
        return acc;
    }, {});
    // 4️⃣ Get cup type labels
    const cupTypes = await prisma.tomatoCup.findMany({
        where: {
            id: { in: orderResults.map((r) => r.cupTypeId) },
        },
        select: {
            id: true,
            label: true,
        },
    });
    const labelLookup = cupTypes.reduce((acc, cup) => {
        acc[cup.id] = cup.label;
        return acc;
    }, {});
    // 5️⃣ Calculate remaining cups = orders - transactions
    const result = orderResults.map((order) => {
        const totalFromOrders = order._sum.numOfCups || 0;
        const totalFromTransactions = transactionLookup[order.cupTypeId] || 0;
        const remaining = totalFromOrders - totalFromTransactions;
        return {
            cupTypeId: order.cupTypeId,
            label: labelLookup[order.cupTypeId] || 'Unknown',
            totalOrdered: totalFromOrders,
            totalUsedInTransactions: totalFromTransactions,
            totalCups: remaining,
        };
    });
    return result;
}
export async function createTomatoTransactionService(data) {
    const createdTransaction = await prisma.tomatoOrderTransaction.create({
        data: {
            note: data.note || '',
            status: data.transactionStatus || 'SOLD',
            cupTypeId: data.cupTypeId,
            numOfCups: data.numOfCups,
            pricePerCup: data.pricePerCup,
            userId: data.userId,
        },
        include: {
            user: true,
            cupType: {
                select: { label: true },
            },
        },
    });
    return {
        id: createdTransaction.id,
        note: createdTransaction.note,
        status: createdTransaction.status,
        cupTypeId: createdTransaction.cupTypeId,
        cupTypeLabel: createdTransaction.cupType.label,
        numOfCups: createdTransaction.numOfCups,
        pricePerCup: createdTransaction.pricePerCup,
        userId: createdTransaction.userId,
        createdAt: createdTransaction.createdAt,
        isDeleted: createdTransaction.isDeleted,
    };
}
export async function getAllTomatoTransactionsService(whereClause) {
    const transactions = await prisma.tomatoOrderTransaction.findMany({
        where: {
            ...whereClause,
        },
        orderBy: { createdAt: 'desc' },
        include: {
            cupType: {
                select: {
                    label: true,
                },
            },
        },
    });
    // Map results so cupType label is returned as "label"
    return transactions.map((tx) => ({
        ...tx,
        label: tx.cupType?.label ?? 'Unknown',
        cupType: undefined, // remove original cupType object if needed
    }));
}
//# sourceMappingURL=tomato.service.js.map