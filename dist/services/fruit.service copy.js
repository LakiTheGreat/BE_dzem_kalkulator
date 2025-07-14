import prisma from '../utils/db.js';
export const getAllFruitsService = async () => {
    const fruits = await prisma.fruit.findMany({
        where: {
            isDeleted: false,
        },
        orderBy: {
            label: 'asc',
        },
    });
    return fruits;
};
export const getAlLFruitsWithSameNameService = async (baseName) => {
    const existingFruits = await prisma.fruit.findMany({
        where: {
            label: {
                startsWith: baseName,
            },
        },
    });
    return existingFruits;
};
export const createNewFruitService = async (name) => {
    const newFruit = await prisma.fruit.create({
        data: {
            label: name,
        },
    });
    return newFruit;
};
export const patchFruitService = async (fruitId, label) => {
    const updatedFruit = await prisma.fruit.update({
        where: { id: fruitId },
        data: { label },
    });
    return updatedFruit;
};
export const deleteFruitService = async (fruitId) => {
    const fruit = await prisma.fruit.update({
        where: { id: fruitId },
        data: { isDeleted: true },
    });
    return fruit;
};
//# sourceMappingURL=fruit.service%20copy.js.map