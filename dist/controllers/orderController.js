import prisma from '../utils/db.js';
/**
 * @swagger
 * /api/orders:
 *   post:
 *     tags:
 *       - Orders
 *     summary: Create a new order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderTypeId
 *               - orderName
 *             properties:
 *               orderTypeId:
 *                 type: integer
 *               orderName:
 *                 type: string
 *               numberOfSmallCups:
 *                 type: integer
 *               numberOfLargeCups:
 *                 type: integer
 *               totalExpense:
 *                 type: integer
 *               totalValue:
 *                 type: integer
 *               profit:
 *                 type: integer
 *               profitMargin:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Order successfully created
 *
 */
export const createNewOrder = async (req, res) => {
    try {
        const { orderTypeId, orderName, numberOfSmallCups, numberOfLargeCups, totalExpense, totalValue, profit, profitMargin, } = req.body;
        if (!orderTypeId || !orderName) {
            res.status(400).json({ message: 'Missing required fields' });
        }
        const newOrder = await prisma.order.create({
            data: {
                orderTypeId,
                orderName,
                numberOfSmallCups,
                numberOfLargeCups,
                totalExpense,
                totalValue,
                profit,
                profitMargin,
            },
        });
        res.status(201).json(newOrder);
    }
    catch (error) {
        console.error('Error creating order:', error);
        res
            .status(500)
            .json({ message: 'Something went wrong while creating the order.' });
    }
};
//# sourceMappingURL=orderController.js.map