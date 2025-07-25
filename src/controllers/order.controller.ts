import { Request, Response } from 'express';
import status from 'http-status';

import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  createNewOrderService,
  deleteOrderService,
  getAllOrdersService,
  getOrderByIdService,
  putOrderService,
} from '../services/order.service.js';
import AppError from '../utils/AppError.js';
import { OrderReq } from '../types/orders.js';
import { getAllFruitsService } from '../services/fruit.service.js';

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

export const getAllOrders = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = Number(req.header('x-user-id'));

    const orderTypeId = req.query.orderTypeId
      ? Number(req.query.orderTypeId)
      : undefined;
    const priceStatus =
      req.query.priceStatus !== undefined
        ? Number(req.query.priceStatus)
        : undefined;

    if (orderTypeId !== undefined && (isNaN(orderTypeId) || orderTypeId <= 0)) {
      throw new AppError(
        'Invalid orderTypeId query parameter',
        status.BAD_REQUEST
      );
    }

    if (priceStatus !== undefined && ![1, 2].includes(priceStatus)) {
      throw new AppError(
        'Invalid priceStatus query parameter',
        status.BAD_REQUEST
      );
    }

    const whereClause: any = { isDeleted: false, userId };
    if (orderTypeId) whereClause.orderTypeId = orderTypeId;
    if (priceStatus === 1) whereClause.baseFruitIsFree = true;
    else if (priceStatus === 2) whereClause.baseFruitIsFree = false;

    const orders = await getAllOrdersService(whereClause);
    if (!orders || orders.length === 0)
      throw new AppError('No orders found', status.NOT_FOUND);

    const allFruits = await getAllFruitsService(userId);
    const fruitLookup = allFruits.reduce((acc, fruit) => {
      acc[fruit.id] = fruit.label;
      return acc;
    }, {} as Record<number, string>);

    // Totals
    let totalValue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    const cupTotalsByLabel: Record<string, number> = {};

    const formattedOrders = orders.map((order) => {
      const fruits = (order.fruits || []).map((fruit: any) => ({
        grams: fruit.grams,
        price: Number(fruit.price),
        total: Number(fruit.total),
        fruitId: fruit.fruitId,
        fruitName: fruitLookup[fruit.fruitId] || 'Unknown',
      }));

      const cups = (order.cups || []).map((cup: any) => {
        const label = cup.label;
        const numberOf = Number(cup.numberOf);

        // Update global cup totals per label
        if (cupTotalsByLabel[label]) {
          cupTotalsByLabel[label] += numberOf;
        } else {
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
      const calculatedTotalCost = Math.round(
        orderTotalCost + orderTotalCost * (order.otherExpensesMargin / 100)
      );

      const calculatedTotalValue = cups.reduce(
        (acc, f) => acc + f.sellingPrice * f.numberOf,
        0
      );

      const profit = calculatedTotalValue - calculatedTotalCost;

      const calculatedProfitMargin = (
        Number(calculatedTotalValue) > 0
          ? (profit / Number(calculatedTotalValue)) * 100
          : 0
      ).toFixed(0);

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
  }
);

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

export const getOrderById = asyncHandler(
  async (req: Request, res: Response) => {
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
  }
);

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
 *                     label:
 *                       type: string
 *                       example: "212ml "
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
 *                 example: 23
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

export const createNewOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = Number(req.header('x-user-id'));

    const requiredFields = [
      req.body.fruits,
      req.body.cups,
      req.body.orderTypeId,
      req.body.baseFruitIsFree,
      req.body.otherExpensesMargin,
    ];

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

    res.status(status.CREATED).json(newOrder);
  }
);

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

export const putOrder = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const userId = Number(req.header('x-user-id'));

  if (isNaN(id) || id <= 0) {
    throw new AppError('Invalid order ID', status.BAD_REQUEST);
  }

  const existingOrder = await getOrderByIdService(id, userId);
  if (!existingOrder) {
    throw new AppError('Order not found', status.NOT_FOUND);
  }

  const requiredFields = [
    req.body.fruits,
    req.body.cups,
    req.body.orderTypeId,
    req.body.baseFruitIsFree,
    req.body.otherExpensesMargin,
  ];

  if (requiredFields.some((field) => field === undefined || field === null)) {
    throw new AppError('Missing required fields', status.BAD_REQUEST);
  }

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

export const deleteOrder = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.header('x-user-id'));

  const id = Number(req.params.id);

  if (isNaN(id) || id <= 0) {
    throw new AppError('Invalid order ID', status.BAD_REQUEST);
  }

  const existingOrder = await getOrderByIdService(id, userId);

  if (!existingOrder) {
    throw new AppError('Order not found', status.NOT_FOUND);
  }

  const order = await deleteOrderService(id, userId);

  if (!order) {
    throw new AppError('Failed to delete order', status.INTERNAL_SERVER_ERROR);
  }

  res.status(status.OK).json({ message: 'Order soft-deleted successfully' });
});
