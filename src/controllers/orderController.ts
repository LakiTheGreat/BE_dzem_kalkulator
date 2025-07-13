import { Request, Response } from 'express';

import prisma from '../utils/db.js';

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
 *     summary: Get all orders, optionally filtered by orderTypeId
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: orderTypeId
 *         schema:
 *           type: integer
 *           minimum: 1
 *         required: false
 *         description: Filter orders by orderTypeId
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
 *
 */

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    // Extract orderTypeId from query params, convert to number if exists
    const orderTypeId = req.query.orderTypeId
      ? Number(req.query.orderTypeId)
      : undefined;

    // Validate orderTypeId if provided
    if (orderTypeId !== undefined && (isNaN(orderTypeId) || orderTypeId <= 0)) {
      res.status(400).json({ message: 'Invalid orderTypeId query parameter' });
    }

    const whereClause: any = { isDeleted: false };

    if (orderTypeId) {
      whereClause.orderTypeId = orderTypeId;
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        orderType: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      orderName: order.orderName,
      orderTypeName: order.orderType.label, // instead of orderTypeId
      numberOfSmallCups: order.numberOfSmallCups,
      numberOfLargeCups: order.numberOfLargeCups,
      totalExpense: order.totalExpense,
      totalValue: order.totalValue,
      profit: order.profit,
      profitMargin: order.profitMargin,
      createdAt: order.createdAt,
    }));

    // Calculate totals
    const totalValue = orders.reduce((acc, o) => acc + o.totalValue, 0);
    const totalExpense = orders.reduce((acc, o) => acc + o.totalExpense, 0);
    const totalProfit = orders.reduce((acc, o) => acc + o.profit, 0);

    res.status(200).json({
      orders: formattedOrders,
      totalValue,
      totalExpense,
      totalProfit,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

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

export const getOrderById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (isNaN(id) || id <= 0) {
    res.status(400).json({ message: 'Invalid order ID' });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id, isDeleted: false },
      include: { orderType: true },
    });

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
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
    };

    res.status(200).json(formattedOrder);
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
};

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
export const createNewOrder = async (req: Request, res: Response) => {
  try {
    const {
      orderTypeId,
      orderName,
      numberOfSmallCups,
      numberOfLargeCups,
      totalExpense,
      totalValue,
      profit,
      profitMargin,
      baseFruitIsFree,
    } = req.body;

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
        baseFruitIsFree,
      },
    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res
      .status(500)
      .json({ message: 'Something went wrong while creating the order.' });
  }
};

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

export const deleteOrder = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (isNaN(id) || id <= 0) {
    res.status(400).json({ message: 'Invalid order ID' });
  }

  try {
    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder || existingOrder.isDeleted) {
      res.status(404).json({ message: 'Order not found' });
    }

    await prisma.order.update({
      where: { id },
      data: { isDeleted: true },
    });

    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Failed to delete order' });
  }
};
