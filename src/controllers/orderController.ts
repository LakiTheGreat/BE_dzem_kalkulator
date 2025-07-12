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
 *     summary: Get all orders
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: List of all orders
 */
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        isDeleted: false,
      },
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

    res.status(200).json(formattedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
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
    } = req.body;

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
  } catch (error) {
    console.error('Error creating order:', error);
    res
      .status(500)
      .json({ message: 'Something went wrong while creating the order.' });
  }
};
