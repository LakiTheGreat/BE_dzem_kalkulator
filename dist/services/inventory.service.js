import prisma from '../utils/db.js';
export const getAllInventoryService = async (userId) => {
    const inventories = await prisma.inventory.findMany({
        where: { userId },
        select: { cupData: true },
    });
    return inventories;
};
export const getInventoryForFruitService = async (orderTypeId, userId) => {
    const existingInventory = await prisma.inventory.findUnique({
        where: { orderTypeId, userId },
    });
    return existingInventory;
};
export const createInventoryService = async (orderTypeId, cupData, userId) => {
    const created = await prisma.inventory.create({
        data: {
            orderTypeId,
            cupData,
            userId,
        },
    });
    return created;
};
export const updateInventoryService = async (orderTypeId, mergedCupData, userId) => {
    const updated = await prisma.inventory.update({
        where: { orderTypeId, userId },
        data: {
            cupData: mergedCupData,
        },
    });
    return updated;
};
//# sourceMappingURL=inventory.service.js.map