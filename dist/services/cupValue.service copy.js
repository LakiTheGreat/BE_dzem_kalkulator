import prisma from '../utils/db.js';
export const getAllCupValuesService = async () => {
    const cupValues = await prisma.cupValue.findMany({
        where: { isDeleted: false },
        orderBy: { label: 'asc' },
    });
    return cupValues;
};
export const createCupValueService = async (label, value) => {
    const newCup = await prisma.cupValue.create({
        data: {
            label,
            value,
            isDeleted: false,
        },
    });
    return newCup;
};
export const putCupValueService = async (cupValueId, label, value) => {
    const updatedCupValue = await prisma.cupValue.update({
        where: { id: cupValueId },
        data: {
            label,
            value,
        },
    });
    return updatedCupValue;
};
export const deleteCupValueService = async (cupValueId) => {
    const deletedCupValue = await prisma.cupValue.update({
        where: { id: cupValueId },
        data: { isDeleted: true },
    });
    return deletedCupValue;
};
//# sourceMappingURL=cupValue.service%20copy.js.map