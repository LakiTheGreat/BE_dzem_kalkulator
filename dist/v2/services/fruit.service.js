import prisma from '../../utils/db.js';
export const getAllFruitsService = (userId) => prisma.fruit.findMany({
    where: { isDeleted: false, userId },
    orderBy: { label: 'asc' },
});
//# sourceMappingURL=fruit.service.js.map