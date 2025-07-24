import prisma from '../utils/db.js';
export const getAllCupCostsService = async (userId) => {
    const cupCosts = await prisma.cupCost.findMany({
        where: { isDeleted: false, userId },
        orderBy: { label: 'asc' },
    });
    return cupCosts;
};
export const createNewCupCostService = async (label, value, userId) => {
    const newCupCost = await prisma.cupCost.create({
        data: {
            label,
            value,
            isDeleted: false,
            userId,
        },
    });
    return newCupCost;
};
export const putCupCostService = async (cupCostId, label, value, userId) => {
    const updatedCupCost = await prisma.cupCost.update({
        where: { id: cupCostId, userId },
        data: {
            label,
            value,
        },
    });
    return updatedCupCost;
};
export const deleteCupCostService = async (cupCostId, userId) => {
    const deletedCupCost = await prisma.cupCost.update({
        where: { id: cupCostId, userId },
        data: { isDeleted: true },
    });
    return deletedCupCost;
};
//# sourceMappingURL=cupCost.service.js.map