import prisma from '../utils/db.js';
export async function createBouquetTransactionService(data) {
    const bouquetTransaction = await prisma.bouquetTransaction.create({
        data: {
            note: data.note || '',
            userId: data.userId || 1,
            totalExpense: data.totalExpense,
            income: data.income,
            profit: data.profit,
            profitMargin: data.profitMargin,
            status: data.status,
        },
    });
    return bouquetTransaction;
}
export async function getBouquetTransactionByIdService(id, userId) {
    return prisma.bouquetTransaction.findUnique({
        where: { id, userId },
        select: {
            id: true,
            note: true,
            totalExpense: true,
            income: true,
            profit: true,
            isDeleted: true,
            createdAt: true,
            profitMargin: true,
            status: true,
            // userId  excluded
        },
    });
}
export async function getAllBouquetTransactionsService(userId) {
    return prisma.bouquetTransaction.findMany({
        where: { isDeleted: false, userId },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            note: true,
            totalExpense: true,
            income: true,
            profit: true,
            isDeleted: true,
            createdAt: true,
            profitMargin: true,
            status: true,
            // userId excluded
        },
    });
}
export async function updateBouquetTransactionService(id, data, userId) {
    return prisma.bouquetTransaction.update({
        where: { id, userId },
        data,
        select: {
            id: true,
            note: true,
            totalExpense: true,
            income: true,
            profit: true,
            isDeleted: true,
            createdAt: true,
            profitMargin: true,
        },
    });
}
//# sourceMappingURL=bouquet.service.js.map