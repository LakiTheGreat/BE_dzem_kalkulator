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
        const fruits = await prisma.fruits.findMany();
        res.status(200).json(fruits);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Something went wrong!!!!' });
    }
};
//# sourceMappingURL=fruits.js.map