import prisma from '../utils/db.js';
export const getAllFruitsService = async (userId) => {
    const fruits = await prisma.fruit.findMany({
        where: {
            isDeleted: false,
            userId,
        },
        orderBy: {
            label: 'asc',
        },
    });
    return fruits;
};
export const getFruitByIdService = async (userId, id) => {
    const fruit = await prisma.fruit.findFirst({
        where: {
            id,
            isDeleted: false,
            userId,
        },
    });
    return fruit;
};
export const getAlLFruitsWithSameNameService = async (baseName, userId) => {
    const existingFruits = await prisma.fruit.findMany({
        where: {
            userId,
            label: {
                startsWith: baseName,
            },
        },
    });
    return existingFruits;
};
export const createNewFruitService = async (name, userId) => {
    const newFruit = await prisma.fruit.create({
        data: {
            label: name,
            userId,
        },
    });
    return newFruit;
};
export const patchFruitService = async (fruitId, label, userId) => {
    const updatedFruit = await prisma.fruit.update({
        where: { id: fruitId, userId },
        data: { label },
    });
    return updatedFruit;
};
export const deleteFruitService = async (fruitId, userId) => {
    const fruit = await prisma.fruit.update({
        where: { id: fruitId, userId },
        data: { isDeleted: true },
    });
    return fruit;
};
//# sourceMappingURL=fruit.service.js.map