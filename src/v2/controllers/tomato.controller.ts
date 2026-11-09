import { TransactionStatus } from '@prisma/client';
import { Request, Response } from 'express';
import status from 'http-status';

import { asyncHandler } from '../../middlewares/asyncHandler.js';
import AppError from '../../utils/AppError.js';
import {
  createTomatoOrderService,
  deleteTomatoOrderService,
  getAllTomatoOrdersService,
  getTomatoOrderByIdService,
  updateTomatoOrderService,
} from '../services/tomatoOrder.service.js';
import {
  getTomatoCupsService,
  getTomatoTotalsService,
} from '../services/tomatoStock.service.js';
import {
  createTomatoTransactionService,
  deleteTomatoTransactionService,
  getAllTomatoTransactionsService,
  getTomatoTransactionByIdService,
  updateTomatoTransactionService,
} from '../services/tomatoTransaction.service.js';

const parseId = (req: Request) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    throw new AppError('Invalid ID', status.BAD_REQUEST);
  }

  return id;
};

const orderBody = (req: Request) => ({
  cupTypeId: req.body.cupTypeId,
  totalExpenses: req.body.totalExpenses,
  numOfCups: req.body.numOfCups,
});

const transactionBody = (req: Request) => ({
  note: req.body.note,
  status: req.body.status as TransactionStatus,
  cupTypeId: req.body.cupTypeId,
  numOfCups: req.body.numOfCups,
  pricePerCup: req.body.pricePerCup,
});

const periodFrom = (req: Request) => ({
  year: req.query.year ? Number(req.query.year) : undefined,
  month: req.query.month ? Number(req.query.month) : undefined,
});

/**
 * @swagger
 * /api/v2/tomatoes/cups:
 *   get:
 *     tags: [Tomatoes v2]
 *     summary: List the user's tomato cup types (newest first)
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Array of { id, label }
 */
export const getAllTomatoCups = asyncHandler(
  async (req: Request, res: Response) => {
    res.status(status.OK).json(await getTomatoCupsService(req.user.id));
  }
);

/**
 * @swagger
 * /api/v2/tomatoes/totals:
 *   get:
 *     tags: [Tomatoes v2]
 *     summary: Stock per cup type = SUM(orders) - SUM(transactions), non-deleted rows
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Array of { cupTypeId, label, totalOrdered, totalUsedInTransactions, totalCups }
 */
export const getTomatoTotals = asyncHandler(
  async (req: Request, res: Response) => {
    res.status(status.OK).json(await getTomatoTotalsService(req.user.id));
  }
);

/**
 * @swagger
 * /api/v2/tomatoes:
 *   get:
 *     tags: [Tomatoes v2]
 *     summary: List non-deleted tomato orders, optionally for a year/month
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: year
 *         schema: { type: integer, minimum: 0 }
 *       - in: query
 *         name: month
 *         schema: { type: integer, minimum: 0, maximum: 12 }
 *     responses:
 *       200:
 *         description: Array of orders, each with a flattened `label`
 *       400:
 *         description: Invalid year or month
 */
export const getAllTomatoOrders = asyncHandler(
  async (req: Request, res: Response) => {
    const { year, month } = periodFrom(req);

    res
      .status(status.OK)
      .json(await getAllTomatoOrdersService(req.user.id, year, month));
  }
);

/**
 * @swagger
 * /api/v2/tomatoes/{id}:
 *   get:
 *     tags: [Tomatoes v2]
 *     summary: Get one non-deleted tomato order
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: The order
 *       400:
 *         description: Invalid id
 *       404:
 *         description: Order not found (or deleted)
 */
export const getTomatoOrderById = asyncHandler(
  async (req: Request, res: Response) => {
    const order = await getTomatoOrderByIdService(parseId(req), req.user.id);

    if (!order) {
      throw new AppError('TomatoOrder not found', status.NOT_FOUND);
    }

    res.status(status.OK).json(order);
  }
);

/**
 * @swagger
 * /api/v2/tomatoes:
 *   post:
 *     tags: [Tomatoes v2]
 *     summary: Create a tomato order (production batch)
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cupTypeId, totalExpenses, numOfCups]
 *             properties:
 *               cupTypeId: { type: integer, minimum: 1 }
 *               totalExpenses: { type: integer, minimum: 0, description: Expense per cup }
 *               numOfCups: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: The created order (200 kept for UI compatibility)
 *       400:
 *         description: Validation error
 *       404:
 *         description: Cup type not found
 */
export const createTomatoOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const order = await createTomatoOrderService(orderBody(req), req.user.id);

    res.status(status.OK).json(order);
  }
);

/**
 * @swagger
 * /api/v2/tomatoes/{id}:
 *   put:
 *     tags: [Tomatoes v2]
 *     summary: Update a tomato order (cup type, expense, number of cups)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cupTypeId, totalExpenses, numOfCups]
 *             properties:
 *               cupTypeId: { type: integer, minimum: 1 }
 *               totalExpenses: { type: integer, minimum: 0 }
 *               numOfCups: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: The updated order
 *       400:
 *         description: Validation error, or the change would make stock negative
 *       404:
 *         description: Order or cup type not found
 */
export const updateTomatoOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const order = await updateTomatoOrderService(
      parseId(req),
      orderBody(req),
      req.user.id
    );

    if (!order) {
      throw new AppError('TomatoOrder not found', status.NOT_FOUND);
    }

    res.status(status.OK).json(order);
  }
);

/**
 * @swagger
 * /api/v2/tomatoes/{id}:
 *   delete:
 *     tags: [Tomatoes v2]
 *     summary: Soft-delete a tomato order
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: The deleted order
 *       400:
 *         description: Invalid id, or deleting would make stock negative
 *       404:
 *         description: Order not found (or already deleted)
 */
export const deleteTomatoOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const order = await deleteTomatoOrderService(parseId(req), req.user.id);

    if (!order) {
      throw new AppError('TomatoOrder not found', status.NOT_FOUND);
    }

    res.status(status.OK).json(order);
  }
);

/**
 * @swagger
 * /api/v2/tomatoes/transactions:
 *   get:
 *     tags: [Tomatoes v2]
 *     summary: List non-deleted tomato transactions (sales etc.)
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: year
 *         schema: { type: integer, minimum: 0 }
 *       - in: query
 *         name: month
 *         schema: { type: integer, minimum: 0, maximum: 12 }
 *       - in: query
 *         name: transactionStatus
 *         schema:
 *           type: string
 *           enum: [CONSUMED, SOLD, GIVEN_AWAY, PROMOTION, OTHER]
 *     responses:
 *       200:
 *         description: Array of transactions, each with a flattened `label`
 *       400:
 *         description: Invalid year, month or status
 */
export const getAllTomatoTransactions = asyncHandler(
  async (req: Request, res: Response) => {
    const { year, month } = periodFrom(req);
    const transactionStatus = req.query.transactionStatus as
      | TransactionStatus
      | undefined;

    res.status(status.OK).json(
      await getAllTomatoTransactionsService(req.user.id, {
        year,
        month,
        status: transactionStatus || undefined,
      })
    );
  }
);

/**
 * @swagger
 * /api/v2/tomatoes/transactions/{id}:
 *   get:
 *     tags: [Tomatoes v2]
 *     summary: Get one non-deleted tomato transaction
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: The transaction
 *       400:
 *         description: Invalid id
 *       404:
 *         description: Transaction not found (or deleted)
 */
export const getTomatoTransactionById = asyncHandler(
  async (req: Request, res: Response) => {
    const transaction = await getTomatoTransactionByIdService(
      parseId(req),
      req.user.id
    );

    if (!transaction) {
      throw new AppError('TomatoTransaction not found', status.NOT_FOUND);
    }

    res.status(status.OK).json(transaction);
  }
);

/**
 * @swagger
 * /api/v2/tomatoes/transactions:
 *   post:
 *     tags: [Tomatoes v2]
 *     summary: Create a tomato transaction (cups leave the stock)
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [note, status, cupTypeId, numOfCups, pricePerCup]
 *             properties:
 *               note: { type: string }
 *               status:
 *                 type: string
 *                 enum: [CONSUMED, SOLD, GIVEN_AWAY, PROMOTION, OTHER]
 *               cupTypeId: { type: integer, minimum: 1 }
 *               numOfCups: { type: integer, minimum: 1 }
 *               pricePerCup: { type: integer, minimum: 0 }
 *     responses:
 *       201:
 *         description: The created transaction (with cupTypeLabel)
 *       400:
 *         description: Validation error, or not enough cups in stock
 *       404:
 *         description: Cup type not found
 */
export const createTomatoTransaction = asyncHandler(
  async (req: Request, res: Response) => {
    const transaction = await createTomatoTransactionService(
      transactionBody(req),
      req.user.id
    );

    res.status(status.CREATED).json(transaction);
  }
);

/**
 * @swagger
 * /api/v2/tomatoes/transactions/{id}:
 *   put:
 *     tags: [Tomatoes v2]
 *     summary: Update a tomato transaction
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [note, status, cupTypeId, numOfCups, pricePerCup]
 *     responses:
 *       200:
 *         description: The updated transaction
 *       400:
 *         description: Validation error, or not enough cups in stock
 *       404:
 *         description: Transaction or cup type not found
 */
export const updateTomatoTransaction = asyncHandler(
  async (req: Request, res: Response) => {
    const transaction = await updateTomatoTransactionService(
      parseId(req),
      transactionBody(req),
      req.user.id
    );

    if (!transaction) {
      throw new AppError('TomatoTransaction not found', status.NOT_FOUND);
    }

    res.status(status.OK).json(transaction);
  }
);

/**
 * @swagger
 * /api/v2/tomatoes/transactions/{id}:
 *   delete:
 *     tags: [Tomatoes v2]
 *     summary: Soft-delete a tomato transaction (cups return to stock)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: The deleted transaction
 *       400:
 *         description: Invalid id
 *       404:
 *         description: Transaction not found (or already deleted)
 */
export const deleteTomatoTransaction = asyncHandler(
  async (req: Request, res: Response) => {
    const transaction = await deleteTomatoTransactionService(
      parseId(req),
      req.user.id
    );

    if (!transaction) {
      throw new AppError('TomatoTransaction not found', status.NOT_FOUND);
    }

    res.status(status.OK).json(transaction);
  }
);
