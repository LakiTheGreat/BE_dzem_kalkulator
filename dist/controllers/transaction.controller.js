import status from 'http-status';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { getUserCupIdsService } from '../services/cup.service.js';
import { getFruitByIdService } from '../services/fruit.service.js';
import { createInventoryService, getInventoryForFruitService, updateInventoryService, } from '../services/inventory.service.js';
import { createTransactionService, getTransactionsService, } from '../services/transaction.service.js';
import AppError from '../utils/AppError.js';
/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         orderTypeId:
 *           type: integer
 *           example: 2
 *         orderType:
 *           $ref: '#/components/schemas/Fruit'
 *         cups:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               cupId:
 *                 type: integer
 *                 example: 1
 *               quantity:
 *                 type: integer
 *                 example: 3
 *         status:
 *           type: string
 *           enum: [CONSUMED, SOLD, GIVEN_AWAY, OTHER]
 *           example: SOLD
 *         userId:
 *           type: integer
 *           example: 1
 *         user:
 *           $ref: '#/components/schemas/User'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2025-08-10T12:34:56.000Z
 *
 *     Fruit:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         label:
 *           type: string
 *         isDeleted:
 *           type: boolean
 *
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 */
/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get all transactions for the given user
 *     tags: [Transactions]
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user whose transactions to fetch
 *     responses:
 *       200:
 *         description: List of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Missing or invalid user ID
 *       500:
 *         description: Internal server error
 */
export const getTransactions = asyncHandler(async (req, res) => {
    const userId = Number(req.header('x-user-id'));
    const transactions = await getTransactionsService(userId);
    res.status(status.OK).json(transactions);
});
/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create a new transaction
 *     tags: [Transactions]
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user creating the transaction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderTypeId
 *               - cupData
 *               - status
 *             properties:
 *               orderTypeId:
 *                 type: integer
 *                 example: 32
 *               status:
 *                 type: string
 *                 enum: [CONSUMED, SOLD, GIVEN_AWAY, OTHER]
 *                 example: SOLD
 *               cupData:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - cupId
 *                     - quantity
 *                   properties:
 *                     cupId:
 *                       type: integer
 *                       example: 9
 *                     quantity:
 *                       type: integer
 *                       example: 3
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
export const createTransaction = asyncHandler(async (req, res) => {
    const userId = Number(req.header('x-user-id'));
    const { orderTypeId, cupData, status: transactionStatus } = req.body;
    // Validate fruit exists
    const fruit = await getFruitByIdService(userId, orderTypeId);
    if (!fruit) {
        throw new AppError('Provided orderTypeId is invalid - not found', status.NOT_FOUND);
    }
    // Validate all cupIds belong to user
    const userCupIds = await getUserCupIdsService(userId);
    for (const item of cupData) {
        if (!userCupIds.includes(item.cupId)) {
            throw new AppError(`Invalid cupId ${item.cupId} for user ${userId}`, status.BAD_REQUEST);
        }
    }
    const transaction = await createTransactionService({
        orderTypeId,
        cupData,
        status: transactionStatus,
        userId,
    });
    // Fetch existing inventory if any
    const existingInventory = await getInventoryForFruitService(orderTypeId, userId);
    if (!existingInventory) {
        // No existing inventory, create new with cupData as is
        const createdInventory = await createInventoryService(orderTypeId, cupData, userId);
        res.status(status.CREATED).json(createdInventory);
    }
    else {
        // Merge existing cupData (array) with new cupData (array)
        const existingCupData = existingInventory.cupData ||
            [];
        // Merge quantities by cupId
        for (const { cupId, quantity } of cupData) {
            const existingCup = existingCupData.find((c) => c.cupId === cupId);
            if (existingCup) {
                existingCup.quantity += quantity;
            }
            else {
                existingCupData.push({ cupId, quantity });
            }
        }
        // Update inventory with merged cupData array
        const updated = await updateInventoryService(orderTypeId, existingCupData, userId);
        res.status(status.CREATED).json(transaction);
    }
});
//# sourceMappingURL=transaction.controller.js.map