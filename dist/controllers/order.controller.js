import status from 'http-status';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { getUserCupIdsService } from '../services/cup.service.js';
import { getAllFruitsService, getFruitByIdService, } from '../services/fruit.service.js';
import { createInventoryService, getInventoryForFruitService, updateInventoryService, } from '../services/inventory.service.js';
import { createNewOrderService, deleteOrderService, getAllOrdersService, getOrderByIdService, putOrderService, } from '../services/order.service.js';
import AppError from '../utils/AppError.js';
/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         orderName:
 *           type: string
 *         orderTypeName:
 *           type: string
 *           description: Label of the fruit (linked from Fruit model)
 *         numberOfSmallCups:
 *           type: integer
 *         numberOfLargeCups:
 *           type: integer
 *         totalExpense:
 *           type: number
 *         totalValue:
 *           type: number
 *         profit:
 *           type: number
 *         profitMargin:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 */
/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders, optionally filtered by orderTypeId and priceStatus
 *     tags: [Orders]
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         schema:
 *           type: integer
 *           minimum: 1
 *         required: true
 *         description: User ID for authentication / filtering
 *       - in: query
 *         name: orderTypeId
 *         schema:
 *           type: integer
 *           minimum: 1
 *         required: false
 *         description: Filter orders by orderTypeId
 *       - in: query
 *         name: priceStatus
 *         schema:
 *           type: string
 *           enum: [1, 2]
 *         required: false
 *         description: Filter orders by price status (e.g., profitable, loss, or all)
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   orderName:
 *                     type: string
 *                   orderTypeName:
 *                     type: string
 *                   numberOfSmallCups:
 *                     type: integer
 *                   numberOfLargeCups:
 *                     type: integer
 *                   totalExpense:
 *                     type: number
 *                   totalValue:
 *                     type: number
 *                   profit:
 *                     type: number
 *                   profitMargin:
 *                     type: number
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 */
export const getAllOrders = asyncHandler(async (req, res) => {
    const userId = Number(req.header('x-user-id'));
    const orderTypeId = req.query.orderTypeId
        ? Number(req.query.orderTypeId)
        : undefined;
    const priceStatus = req.query.priceStatus !== undefined
        ? Number(req.query.priceStatus)
        : undefined;
    const year = req.query.year ? Number(req.query.year) : undefined;
    const month = req.query.month ? Number(req.query.month) : undefined;
    if (orderTypeId !== undefined && (isNaN(orderTypeId) || orderTypeId <= 0)) {
        throw new AppError('Invalid orderTypeId query parameter', status.BAD_REQUEST);
    }
    if (priceStatus !== undefined && ![1, 2].includes(priceStatus)) {
        throw new AppError('Invalid priceStatus query parameter', status.BAD_REQUEST);
    }
    if (year !== undefined && (isNaN(year) || year < 2000 || year > 2100)) {
        throw new AppError('Invalid year query parameter', status.BAD_REQUEST);
    }
    if (month !== undefined && (isNaN(month) || month < 1 || month > 12)) {
        throw new AppError('Invalid month query parameter', status.BAD_REQUEST);
    }
    const whereClause = { isDeleted: false, userId };
    if (orderTypeId) {
        whereClause.orderTypeId = orderTypeId;
    }
    if (priceStatus === 1) {
        whereClause.baseFruitIsFree = true;
    }
    else if (priceStatus === 2) {
        whereClause.baseFruitIsFree = false;
    }
    if (year || month) {
        const startDate = new Date(year ?? new Date().getFullYear(), month ? month - 1 : 0, 1);
        const endDate = new Date(year ?? new Date().getFullYear(), month ? month : 12, 0, 23, 59, 59);
        whereClause.createdAt = {
            gte: startDate,
            lte: endDate,
        };
    }
    const orders = await getAllOrdersService(whereClause);
    const allFruits = await getAllFruitsService(userId);
    const fruitLookup = allFruits.reduce((acc, fruit) => {
        acc[fruit.id] = fruit.label;
        return acc;
    }, {});
    // Totals
    let totalValue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    const cupTotalsByLabel = {};
    const formattedOrders = orders.map((order) => {
        const fruits = (order.fruits || []).map((fruit) => ({
            grams: fruit.grams,
            price: Number(fruit.price),
            total: Number(fruit.total),
            fruitId: fruit.fruitId,
            fruitName: fruitLookup[fruit.fruitId] || 'Unknown',
        }));
        const cups = (order.cups || []).map((cup) => {
            const label = cup.label;
            const numberOf = Number(cup.numberOf);
            // Update global cup totals per label
            if (cupTotalsByLabel[label]) {
                cupTotalsByLabel[label] += numberOf;
            }
            else {
                cupTotalsByLabel[label] = numberOf;
            }
            return {
                label,
                numberOf,
                cost: Number(cup.cost),
                sellingPrice: Number(cup.sellingPrice),
                total: Number(cup.total),
            };
        });
        const totalCupsCost = cups.reduce((acc, c) => acc + c.total, 0);
        const totalFruitsCost = fruits.reduce((acc, f) => acc + f.total, 0);
        const orderTotalCost = totalCupsCost + totalFruitsCost;
        const calculatedTotalCost = Math.round(orderTotalCost + orderTotalCost * (order.otherExpensesMargin / 100));
        const calculatedTotalValue = cups.reduce((acc, f) => acc + f.sellingPrice * f.numberOf, 0);
        const profit = calculatedTotalValue - calculatedTotalCost;
        const calculatedProfitMargin = Number(calculatedTotalCost) > 0
            ? Math.round((profit / Number(calculatedTotalCost)) * 100)
            : 0;
        // Accumulate totals
        totalCost += calculatedTotalCost;
        totalValue += calculatedTotalValue;
        totalProfit += profit;
        return {
            id: order.id,
            orderName: order.orderName,
            orderTypeId: order.orderTypeId,
            orderTypeName: order.orderType?.label || '',
            createdAt: order.createdAt,
            isDeleted: order.isDeleted,
            baseFruitIsFree: order.baseFruitIsFree,
            cups,
            fruits,
            orderValue: calculatedTotalValue,
            orderExpense: calculatedTotalCost,
            orderProfit: profit,
            profitMargin: `${calculatedProfitMargin}%`,
        };
    });
    res.status(status.OK).json({
        orders: formattedOrders,
        totalValue: Math.round(totalValue),
        totalExpense: Math.round(totalCost),
        totalProfit: Math.round(totalProfit),
        totalCups: Object.entries(cupTotalsByLabel).map(([label, numberOf]) => ({
            label,
            numberOf,
        })),
    });
});
/**
 * @swagger
 * tags:
 *   - name: Orders
 *
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID (only for the authenticated user)
 *     tags: [Orders]
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         schema:
 *           type: integer
 *           minimum: 1
 *         required: true
 *         description: User ID for authentication / authorization
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *           minimum: 1
 *         required: true
 *         description: Numeric ID of the order to get
 *     responses:
 *       200:
 *         description: Order found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               # you can define schema properties here or reference a model
 *       400:
 *         description: Invalid order ID
 *       401:
 *         description: Missing or invalid user ID header
 *       404:
 *         description: Order not found or does not belong to user
 *       500:
 *         description: Internal server error
 */
export const getOrderById = asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const userId = Number(req.header('x-user-id'));
    if (isNaN(id) || id <= 0) {
        throw new AppError('Invalid order ID', status.BAD_REQUEST);
    }
    const order = await getOrderByIdService(id, userId);
    if (!order) {
        throw new AppError('Order not found', status.NOT_FOUND);
    }
    res.status(status.OK).json(order);
});
/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         schema:
 *           type: integer
 *           minimum: 1
 *         required: true
 *         description: User ID for authentication / ownership of order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fruits:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     grams:
 *                       type: string
 *                       example: "233"
 *                     price:
 *                       type: string
 *                       example: "222"
 *                     total:
 *                       type: string
 *                       example: "52"
 *                     fruitId:
 *                       type: integer
 *                       example: 23
 *               cups:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: "6"
 *                     label:
 *                       type: string
 *                       example: "212ml"
 *                     numberOf:
 *                       oneOf:
 *                         - type: string
 *                         - type: integer
 *                       example: "4"
 *                     cost:
 *                       type: integer
 *                       example: 35
 *                     sellingPrice:
 *                       type: integer
 *                       example: 350
 *                     total:
 *                       type: integer
 *                       example: 140
 *               orderTypeId:
 *                 type: integer
 *                 example: 35
 *               baseFruitIsFree:
 *                 type: boolean
 *                 example: true
 *               otherExpensesMargin:
 *                 type: integer
 *                 example: 25
 *             required:
 *               - orderTypeId
 *               - cups
 *               - profitMargin
 *     responses:
 *       201:
 *         description: Order successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 orderName:
 *                   type: string
 *                   example: "Some order note"
 *                 orderTypeId:
 *                   type: integer
 *                   example: 23
 *                 baseFruitIsFree:
 *                   type: boolean
 *                   example: true
 *                 cups:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       label:
 *                         type: string
 *                         example: "212ml "
 *                       numberOf:
 *                         type: integer
 *                         example: 4
 *                       cost:
 *                         type: integer
 *                         example: 35
 *                       sellingPrice:
 *                         type: integer
 *                         example: 350
 *                       total:
 *                         type: integer
 *                         example: 140
 *                 fruits:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       grams:
 *                         type: string
 *                         example: "233"
 *                       price:
 *                         type: string
 *                         example: "222"
 *                       total:
 *                         type: string
 *                         example: "52"
 *                       fruitId:
 *                         type: integer
 *                         example: 23
 */
export const createNewOrder = asyncHandler(async (req, res) => {
    const userId = Number(req.header('x-user-id'));
    const requiredFields = [
        req.body.fruits,
        req.body.cups,
        req.body.orderTypeId,
        req.body.baseFruitIsFree,
        req.body.otherExpensesMargin,
    ];
    const orderTypeId = req.body.orderTypeId;
    const cupData = [
        ...req.body.cups.map((cup) => ({
            cupId: cup.id,
            quantity: cup.numberOf,
        })),
    ];
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
    if (requiredFields.some((field) => field === undefined || field === null)) {
        throw new AppError('Missing required fields', status.BAD_REQUEST);
    }
    const newOrder = await createNewOrderService({
        ...req.body,
        userId,
    });
    if (!newOrder) {
        throw new AppError('Order not created', status.INTERNAL_SERVER_ERROR);
    }
    const existingInventory = await getInventoryForFruitService(orderTypeId, userId);
    if (!existingInventory) {
        // No existing inventory, create new with cupData as is
        const createdInventory = await createInventoryService(orderTypeId, cupData, userId);
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
    }
    res.status(status.CREATED).json(newOrder);
});
/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     summary: Update an existing order (only for the authenticated user)
 *     tags: [Orders]
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         schema:
 *           type: integer
 *           minimum: 1
 *         required: true
 *         description: User ID for authentication / authorization
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the order to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fruits:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     grams:
 *                       type: string
 *                     price:
 *                       type: string
 *                     total:
 *                       type: string
 *                     fruitId:
 *                       type: integer
 *               cups:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                     label:
 *                       type: string
 *                     numberOf:
 *                       type: integer
 *                     cost:
 *                       type: integer
 *                     sellingPrice:
 *                       type: integer
 *                     total:
 *                       type: integer
 *               orderTypeId:
 *                 type: integer
 *               baseFruitIsFree:
 *                 type: boolean
 *               otherExpensesMargin:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Missing or invalid user ID header
 *       404:
 *         description: Order not found or does not belong to user
 *       500:
 *         description: Failed to update order
 */
export const putOrder = asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const userId = Number(req.header('x-user-id'));
    const orderTypeId = req.body.orderTypeId;
    const cupData = [
        ...req.body.cups.map((cup) => ({
            cupId: cup.id,
            quantity: cup.numberOf,
        })),
    ];
    if (isNaN(id) || id <= 0) {
        throw new AppError('Invalid order ID', status.BAD_REQUEST);
    }
    const existingOrder = await getOrderByIdService(id, userId);
    if (!existingOrder) {
        throw new AppError('Order not found', status.NOT_FOUND);
    }
    // Validate fruit exists
    const fruit = await getFruitByIdService(userId, orderTypeId);
    if (!fruit) {
        throw new AppError('Provided orderTypeId is invalid - not found', status.NOT_FOUND);
    }
    // Validate all cupIds belong to user
    const userCupIds = await getUserCupIdsService(userId);
    for (const item of cupData) {
        if (!userCupIds.includes(item.cupId)) {
            throw new AppError(`Invalid cupId ${item.cupId} for user ${userId} - putOrder`, status.BAD_REQUEST);
        }
    }
    // Compare old and new cups to get differences
    const oldCups = existingOrder.cups || [];
    const cupDiffs = [];
    for (const newCup of cupData) {
        const oldCup = oldCups.find((c) => c.id === newCup.cupId);
        const oldQty = oldCup?.numberOf || 0;
        const diff = newCup.quantity - oldQty;
        if (diff !== 0) {
            cupDiffs.push({ cupId: newCup.cupId, quantity: diff });
        }
    }
    // Only update inventory if something changed
    if (cupDiffs.length > 0) {
        const existingInventory = await getInventoryForFruitService(orderTypeId, userId);
        if (!existingInventory) {
            // Create new inventory record with differences
            const createdInventory = await createInventoryService(orderTypeId, cupDiffs, userId);
        }
        else {
            const existingCupData = existingInventory.cupData ||
                [];
            for (const { cupId, quantity } of cupDiffs) {
                const existingCup = existingCupData.find((c) => c.cupId === cupId);
                if (existingCup) {
                    existingCup.quantity += quantity;
                    if (existingCup.quantity < 0)
                        existingCup.quantity = 0; // no negative inventory
                }
                else {
                    existingCupData.push({ cupId, quantity });
                }
            }
            const updated = await updateInventoryService(orderTypeId, existingCupData, userId);
        }
    }
    // Update the order itself
    const updatedOrder = await putOrderService(id, req.body, userId);
    if (!updatedOrder) {
        throw new AppError('Failed to update order', status.INTERNAL_SERVER_ERROR);
    }
    res.status(status.OK).json(updatedOrder);
});
/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Soft-delete an order by ID (only if it belongs to the user)
 *     tags: [Orders]
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID of the authenticated user
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the order to delete
 *     responses:
 *       200:
 *         description: Order successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order deleted successfully
 *       401:
 *         description: Missing or invalid user ID
 *       404:
 *         description: Order not found or does not belong to user
 *       500:
 *         description: Failed to delete order
 */
export const deleteOrder = asyncHandler(async (req, res) => {
    const userId = Number(req.header('x-user-id'));
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
        throw new AppError('Invalid order ID', status.BAD_REQUEST);
    }
    const existingOrder = await getOrderByIdService(id, userId);
    if (!existingOrder) {
        throw new AppError('Order not found', status.NOT_FOUND);
    }
    const cupDiffs = existingOrder.cups.map((cup) => ({
        cupId: cup.id,
        quantity: -Math.abs(cup.numberOf),
    }));
    if (!existingOrder) {
        throw new AppError('Order not found', status.NOT_FOUND);
    }
    // --- INVENTORY UPDATE ---
    const existingInventory = await getInventoryForFruitService(existingOrder.orderTypeId, userId);
    if (existingInventory) {
        const updatedCupData = [
            ...existingInventory.cupData,
        ];
        for (const diff of cupDiffs) {
            const existingCup = updatedCupData.find((c) => c.cupId === diff.cupId);
            if (existingCup) {
                existingCup.quantity += diff.quantity; // add negative to subtract
                if (existingCup.quantity < 0)
                    existingCup.quantity = 0;
            }
        }
        const updatedInventory = await updateInventoryService(existingOrder.orderTypeId, updatedCupData, userId);
    }
    // --- DELETE ORDER ---
    const order = await deleteOrderService(id, userId);
    if (!order) {
        throw new AppError('Failed to delete order', status.INTERNAL_SERVER_ERROR);
    }
    res.status(status.OK).json({ message: 'Order soft-deleted successfully' });
});
//# sourceMappingURL=order.controller.js.map