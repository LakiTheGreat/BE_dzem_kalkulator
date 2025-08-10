import prisma from '../utils/db.js';
export const getTransactionsService = async (userId) => {
    return prisma.transaction.findMany({
        where: {
            userId,
            isDeleted: false,
        },
        include: {
            orderType: true,
            user: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
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