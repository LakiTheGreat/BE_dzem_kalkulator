import status from 'http-status';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { getUserCupIdsService } from '../services/cup.service.js';
import { getFruitByIdService } from '../services/fruit.service.js';
import { createInventoryService, getInventoryForFruitService, updateInventoryService, } from '../services/inventory.service.js';
import { adjustInventoryForTransactionUpdate, createTransactionService, getTransactionByIdService, getTransactionsService, updateTransactionService, } from '../services/transaction.service.js';
import AppError from '../utils/AppError.js';
import prisma from '../utils/db.js';
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
    const orderTypeId = req.query.orderTypeId
        ? Number(req.query.orderTypeId)
        : undefined;
    const transactionStatus = req.query.transactionStatus !== undefined
        ? String(req.query.transactionStatus)
        : undefined;
    if (orderTypeId !== undefined && (isNaN(orderTypeId) || orderTypeId <= 0)) {
        throw new AppError('Invalid orderTypeId query parameter', status.BAD_REQUEST);
    }
    const whereClause = { isDeleted: false, userId };
    if (orderTypeId !== undefined) {
        whereClause.orderTypeId = orderTypeId;
    }
    if (transactionStatus !== undefined) {
        whereClause.status = transactionStatus;
    }
    const transactions = await getTransactionsService(userId, whereClause);
    res.status(status.OK).json(transactions);
});
/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Get a transaction by ID
 *     description: Returns a transaction by its ID for the authenticated user.
 *     tags:
 *       - Transactions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the transaction to retrieve
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the authenticated user
 *     responses:
 *       200:
 *         description: Transaction found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *             example:
 *               id: 8
 *               orderTypeId: 32
 *               cups:
 *                 - cupId: 6
 *                   quantity: -3
 *                 - cupId: 7
 *                   quantity: 1
 *               status: SOLD
 *               userId: 1
 *               isDeleted: false
 *               createdAt: "2025-08-10T16:34:34.971Z"
 *               orderType:
 *                 label: "Jagoda"
 *               cupsDetails:
 *                 - cupId: 6
 *                   label: "212ml"
 *                 - cupId: 7
 *                   label: "500ml"
 *       404:
 *         description: Transaction not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Transaction not found
 */
export const getTransactionById = asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const userId = Number(req.header('x-user-id'));
    const transaction = await getTransactionByIdService(id, userId);
    if (!transaction) {
        throw new AppError('Transaction not found', status.NOT_FOUND);
    }
    res.status(status.OK).json(transaction);
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
 *                       example: -3
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
/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     summary: Update a transaction by ID
 *     tags:
 *       - Transactions
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user making the request
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Transaction ID to update
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
 *                       example: -3
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionUpdateResponse'
 *       400:
 *         description: Bad request (e.g. missing ID or invalid payload)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Transaction not found or not authorized
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     summary: Soft delete transaction
 *     tags:
 *       - Transactions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Transaction ID to update
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user performing the update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isDeleted:
 *                 type: boolean
 *                 description: If true, marks the transaction as soft deleted
 *     responses:
 *       200:
 *         description: Transaction updated or soft deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               id: 123
 *               orderTypeId: 32
 *               status: SOLD
 *               cupData:
 *                 - cupId: 9
 *                   quantity: -3
 *               isDeleted: false
 *               createdAt: "2025-08-10T16:34:34.971Z"
 *       400:
 *         description: Bad request (e.g., invalid cupId or inventory constraints)
 *       404:
 *         description: Transaction or inventory not found
 */
export const updateTransaction = asyncHandler(async (req, res) => {
    const userId = Number(req.header('x-user-id'));
    const id = Number(req.params.id);
    const { orderTypeId, cupData, isDeleted } = req.body;
    const transactionStatus = req.body.status;
    // Validate fruit exists (only if not deleting)
    if (!isDeleted) {
        const fruit = await getFruitByIdService(userId, orderTypeId);
        if (!fruit) {
            throw new AppError('Provided orderTypeId is invalid - not found', status.NOT_FOUND);
        }
    }
    // Validate cupIds belong to user (only if not deleting)
    if (!isDeleted) {
        const userCupIds = await getUserCupIdsService(userId);
        for (const item of cupData) {
            if (!userCupIds.includes(item.cupId)) {
                throw new AppError(`Invalid cupId ${item.cupId} for user ${userId}`, status.BAD_REQUEST);
            }
        }
    }
    // Fetch existing transaction
    const existingTransaction = await getTransactionByIdService(id, userId);
    if (!existingTransaction) {
        throw new AppError('Transaction not found', status.NOT_FOUND);
    }
    // Soft delete case
    if (isDeleted === true && existingTransaction.isDeleted === false) {
        // Soft delete transaction directly
        await prisma.transaction.update({
            where: { id },
            data: { isDeleted: true },
        });
        // Fetch inventory for the transaction's orderTypeId
        const inventory = await getInventoryForFruitService(existingTransaction.orderTypeId, userId);
        if (!inventory) {
            throw new AppError('Inventory not found for this order type', status.NOT_FOUND);
        }
        const cupDataInventory = inventory.cupData;
        const transactionCups = existingTransaction.cups;
        cupDataInventory.forEach((invCup) => {
            const transactionCup = transactionCups.find((c) => c.cupId === invCup.cupId);
            if (transactionCup) {
                invCup.quantity += Math.abs(transactionCup.quantity);
            }
        });
        await updateInventoryService(existingTransaction.orderTypeId, cupDataInventory, userId);
        res.status(status.OK).json({ message: 'Transaction soft deleted' });
    }
    // Normal update path
    const oldCupData = existingTransaction.cups;
    const inventory = await getInventoryForFruitService(orderTypeId, userId);
    if (!inventory) {
        throw new AppError('Inventory not found for this order type', status.NOT_FOUND);
    }
    const cupDataInventory = inventory.cupData;
    const updatedInventoryCupData = await adjustInventoryForTransactionUpdate(oldCupData, cupData, cupDataInventory);
    const updatedInventor = await updateInventoryService(orderTypeId, updatedInventoryCupData, userId);
    const updated = await updateTransactionService(id, userId, {
        orderTypeId: Number(orderTypeId),
        status: transactionStatus,
        cupData,
    });
    if (!updated) {
        return res
            .status(status.BAD_REQUEST)
            .json({ message: 'Transaction was not updated' });
    }
    res.status(status.OK).json(updated);
});
export const deleteTransaction = asyncHandler(async (req, res) => {
    const userId = Number(req.header('x-user-id'));
    const id = Number(req.params.id);
    const { orderTypeId, cupData } = req.body;
    const transactionStatus = req.body.status;
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
    // Fetch existing transaction
    const existingTransaction = await getTransactionByIdService(id, userId);
    if (!existingTransaction) {
        throw new AppError('Transaction not found', status.NOT_FOUND);
    }
    const oldCupData = existingTransaction.cups;
    // Fetch inventory for the transaction's orderTypeId
    const inventory = await getInventoryForFruitService(orderTypeId, userId);
    if (!inventory) {
        throw new AppError('Inventory not found for this order type', status.NOT_FOUND);
    }
    const cupDataInventory = inventory.cupData;
    // Use the service to adjust inventory cup quantities
    const updatedInventoryCupData = await adjustInventoryForTransactionUpdate(oldCupData, cupData, cupDataInventory);
    // Save updated inventory
    await updateInventoryService(orderTypeId, updatedInventoryCupData, userId);
    // Update transaction
    const updated = await updateTransactionService(id, userId, {
        orderTypeId: Number(orderTypeId),
        status: transactionStatus,
        cupData,
    });
    if (!updated) {
        return res
            .status(status.BAD_REQUEST)
            .json({ message: 'Transaction was not updated' });
    }
    res.status(status.OK).json(updated);
});
//# sourceMappingURL=transaction.controller.js.map