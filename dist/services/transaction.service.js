import prisma from '../utils/db.js';
export const getTransactionsService = async (userId) => {
    const transactions = await prisma.transaction.findMany({
        where: {
            userId,
            isDeleted: false,
        },
        include: {
            orderType: {
                select: { label: true },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
    const allCupIds = transactions.flatMap((t) => t.cups.map((c) => c.cupId));
    const uniqueCupIds = [...new Set(allCupIds)];
    const cups = await prisma.cup.findMany({
        where: { id: { in: uniqueCupIds } },
        select: { id: true, label: true },
    });
    const cupMap = Object.fromEntries(cups.map((c) => [c.id, c.label]));
    return transactions.map((t) => ({
        id: t.id,
        orderType: t.orderType.label,
        cups: t.cups.map((c) => ({
            ...c,
            quantity: Math.abs(c.quantity), // returns positive quantity
            label: cupMap[c.cupId] || null,
        })),
        status: t.status,
        createdAt: t.createdAt,
        isDeleted: t.isDeleted,
    }));
};
export const createTransactionService = async (data) => {
    return prisma.transaction.create({
        data: {
            orderTypeId: data.orderTypeId,
            cups: data.cupData,
            status: data.status,
            userId: data.userId,
        },
        include: {
            orderType: true,
            user: true,
        },
    });
};
//# sourceMappingURL=transaction.service.js.map