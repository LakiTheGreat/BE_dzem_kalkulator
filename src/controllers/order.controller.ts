import { Request, Response } from 'express';
import status from 'http-status';

import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  createNewOrderService,
  deleteOrderService,
  getAllOrdersService,
  getOrderByIdService,
} from '../services/order.service.js';
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
 *           enum: [ 1, 2]
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
    const orderTypeId = req.query.orderTypeId
      ? Number(req.query.orderTypeId)
      : undefined;

    const priceStatus =
      req.query.priceStatus !== undefined
        ? Number(req.query.priceStatus)
        : undefined;

    // Validate query params
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

    const whereClause: any = { isDeleted: false };

    if (orderTypeId) {
      whereClause.orderTypeId = orderTypeId;
    }

    if (priceStatus === 1) {
      whereClause.baseFruitIsFree = true;
    } else if (priceStatus === 2) {
      whereClause.baseFruitIsFree = false;
    }

    const orders = await getAllOrdersService(whereClause);

    if (!orders) {
      throw new AppError('No orders found', status.NOT_FOUND);
    }

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      orderName: order.orderName,
      orderTypeName: order.orderType.label,
      numberOfSmallCups: order.numberOfSmallCups,
      numberOfLargeCups: order.numberOfLargeCups,
      totalExpense: order.totalExpense,
      totalValue: order.totalValue,
      profit: order.profit,
      profitMargin: order.profitMargin,
      createdAt: order.createdAt,
      baseFruitIsFree: order.baseFruitIsFree,
    }));

    const totalValue = orders.reduce((acc, o) => acc + o.totalValue, 0);
    const totalExpense = orders.reduce((acc, o) => acc + o.totalExpense, 0);
    const totalProfit = orders.reduce((acc, o) => acc + o.profit, 0);
    const totalSmallCups = orders.reduce(
      (acc, o) => acc + o.numberOfSmallCups,
      0
    );
    const totalLargeCups = orders.reduce(
      (acc, o) => acc + o.numberOfLargeCups,
      0
    );

    res.status(status.OK).json({
      orders: formattedOrders,
      totalValue,
      totalExpense,
      totalProfit,
      totalSmallCups,
      totalLargeCups,
    });
  }
);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get a single order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the order to retrieve
 *     responses:
 *       200:
 *         description: The requested order
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 orderName:
 *                   type: string
 *                 orderTypeName:
 *                   type: string
 *                 numberOfSmallCups:
 *                   type: integer
 *                 numberOfLargeCups:
 *                   type: integer
 *                 totalExpense:
 *                   type: number
 *                 totalValue:
 *                   type: number
 *                 profit:
 *                   type: number
 *                 profitMargin:
 *                   type: number
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Order not found
 *       500:
 *         description: Failed to fetch order
 */

export const getOrderById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (isNaN(id) || id <= 0) {
      throw new AppError('Invalid order ID', status.BAD_REQUEST);
    }

    const order = await getOrderByIdService(id);

    if (!order) {
      throw new AppError('Order not found', status.NOT_FOUND);
    }

    const formattedOrder = {
      id: order.id,
      orderName: order.orderName,
      orderTypeName: order.orderType.label,
      numberOfSmallCups: order.numberOfSmallCups,
      numberOfLargeCups: order.numberOfLargeCups,
      totalExpense: order.totalExpense,
      totalValue: order.totalValue,
      profit: order.profit,
      profitMargin: order.profitMargin,
      createdAt: order.createdAt,
      baseFruitIsFree: order.baseFruitIsFree,
    };

    res.status(status.OK).json(formattedOrder);
  }
);

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
 *               baseFruitIsFree:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Order successfully created
 *
 */
export const createNewOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      orderTypeId,
      numberOfSmallCups,
      numberOfLargeCups,
      totalExpense,
      totalValue,
      profit,
      profitMargin,
    } = req.body;

    if (
      !orderTypeId ||
      !numberOfSmallCups ||
      !numberOfLargeCups ||
      !totalExpense ||
      !totalValue ||
      !profit ||
      !profitMargin
    ) {
      throw new AppError('Missing required fields', status.BAD_REQUEST);
    }

    const newOrder = await createNewOrderService(req.body);

    if (!newOrder) {
      throw new AppError('Order not created', status.INTERNAL_SERVER_ERROR);
    }

    res.status(status.CREATED).json(newOrder);
  }
);

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Soft-delete an order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the order to delete
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
 *       404:
 *         description: Order not found
 *       500:
 *         description: Failed to delete order
 */

export const deleteOrder = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (isNaN(id) || id <= 0) {
    throw new AppError('Invalid order ID', status.BAD_REQUEST);
  }

  const existingOrder = await getOrderByIdService(id);

  if (!existingOrder) {
    throw new AppError('Order not found', status.NOT_FOUND);
  }

  const order = await deleteOrderService(id);

  if (!order) {
    throw new AppError('Failed to delete order', status.INTERNAL_SERVER_ERROR);
  }

  res.status(status.OK).json({ message: 'Order soft-deleted successfully' });
});
