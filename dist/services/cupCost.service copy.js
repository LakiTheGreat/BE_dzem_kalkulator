import prisma from '../utils/db.js';
export const getAllCupCostsService = async () => {
    const cupCosts = await prisma.cupCost.findMany({
        where: { isDeleted: false },
        orderBy: { label: 'asc' },
    });
    return cupCosts;
};
export const createNewCupCostService = async (label, value) => {
    const newCupCost = await prisma.cupCost.create({
        data: {
            label,
            value,
            isDeleted: false,
        },
    });
    return newCupCost;
};
export const putCupCostService = async (cupCostId, label, value) => {
    const updatedCupCost = await prisma.cupCost.update({
        where: { id: cupCostId },
        data: {
            label,
            value,
        },
    });
    return updatedCupCost;
};
export const deleteCupCostService = async (cupCostId) => {
    const deletedCupCost = await prisma.cupCost.update({
        where: { id: cupCostId },
        data: { isDeleted: true },
    });
    return deletedCupCost;
};
//# sourceMappingURL=cupCost.service%20copy.js.map