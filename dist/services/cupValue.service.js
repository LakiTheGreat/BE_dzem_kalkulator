import prisma from '../utils/db.js';
export const getAllCupValuesService = async (userId) => {
    const cupValues = await prisma.cupValue.findMany({
        where: { isDeleted: false, userId },
        orderBy: { label: 'asc' },
    });
    return cupValues;
};
export const createCupValueService = async (label, value, userId) => {
    const newCup = await prisma.cupValue.create({
        data: {
            label,
            value,
            userId,
            isDeleted: false,
        },
    });
    return newCup;
};
export const putCupValueService = async (cupValueId, label, value, userId) => {
    const updatedCupValue = await prisma.cupValue.update({
        where: { id: cupValueId, userId },
        data: {
            label,
            value,
        },
    });
    return updatedCupValue;
};
export const deleteCupValueService = async (cupValueId, userId) => {
    const deletedCupValue = await prisma.cupValue.update({
        where: { id: cupValueId, userId },
        data: { isDeleted: true },
    });
    return deletedCupValue;
};
//# sourceMappingURL=cupValue.service.js.map