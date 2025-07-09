import prisma from '../db.js';
export const createNewFruit = async (req, res) => {
    try {
        const fruit = await prisma.fruits.create({ data: req.body });
        res.status(201).json(fruit);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Something went wrong!!!!' });
    }
};
export const getAllFruits = async (req, res) => {
    try {
        const fruits = await prisma.fruits.findMany({
            orderBy: {
                menuItemLabel: 'asc',
            },
        });
        res.status(200).json(fruits);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Something went wrong!!!!' });
    }
};
export const deleteFruitById = async (req, res) => {
    const { id } = req.params;
    try {
        // Convert id to number because Prisma expects number type for Int id
        const fruitId = Number(id);
        if (isNaN(fruitId)) {
            res.status(400).json({ message: 'Invalid fruit ID' });
        }
        // Delete the fruit by ID
        await prisma.fruits.delete({
            where: { id: fruitId },
        });
        res.status(200).json({ message: 'Fruit deleted successfully' });
    }
    catch (e) {
        console.error(e);
        if (e.code === 'P2025') {
            // Prisma error code for "Record to delete does not exist."
            res.status(404).json({ message: 'Fruit not found' });
        }
        res.status(500).json({ message: 'Something went wrong!' });
    }
};
//# sourceMappingURL=fruits.js.map