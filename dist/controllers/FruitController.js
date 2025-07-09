import prisma from '../utils/db.js';
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
/**
 * @swagger
 * components:
 *   schemas:
 *     Fruit:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         value:
 *           type: string
 *         menuItemLabel:
 *           type: string
 */
/**
 * @swagger
 * /api/fruits:
 *   get:
 *     tags:
 *       - Lookups
 *     summary: Get all fruits
 *     responses:
 *       200:
 *         description: List of fruits
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Fruit'
 */
/**
 * @swagger
 * /api/fruits:
 *   post:
 *     tags:
 *       - Lookups
 *     summary: Create a new fruit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - value
 *               - menuItemLabel
 *             properties:
 *               value:
 *                 type: string
 *                 example: "Apple"
 *               menuItemLabel:
 *                 type: string
 *                 example: "Red Apple"
 *     responses:
 *       201:
 *         description: The created fruit object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Fruit'

 */
/**
 * @swagger
 * /api/fruits/{id}:
 *   delete:
 *     tags:
 *       - Lookups
 *     summary: Delete a fruit by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the fruit to delete
 *     responses:
 *       200:
 *         description: Fruit deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Fruit deleted successfully
 *
 */
//# sourceMappingURL=FruitController.js.map