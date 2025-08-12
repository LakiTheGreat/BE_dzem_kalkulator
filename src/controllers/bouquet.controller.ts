import { Request, Response } from 'express';
import status from 'http-status';

import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  createBouquetTransactionService,
  getAllBouquetTransactionsService,
  getBouquetTransactionByIdService,
  updateBouquetTransactionService,
} from '../services/bouquet.service.js';
import AppError from '../utils/AppError.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     BouquetTransaction:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *           description: Auto-generated unique identifier
 *         note:
 *           type: string
 *           example: "Special order for wedding"
 *           description: Optional note for the transaction
 *         userId:
 *           type: integer
 *           example: 1
 *           description: ID of the user who created the transaction
 *         totalExpense:
 *           type: integer
 *           example: 2000
 *           description: Total expense amount in smallest currency unit
 *         income:
 *           type: integer
 *           example: 3500
 *           description: Income amount
 *         profit:
 *           type: integer
 *           example: 1500
 *           description: Profit amount
 *         isDeleted:
 *           type: boolean
 *           example: false
 *           description: Flag if the record is deleted (soft delete)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-08-11T20:00:00Z"
 *           description: Creation timestamp
 *       required:
 *         - totalExpense
 *         - income
 *         - profit
 *       example:
 *         id: 1
 *         note: "Special order for wedding"
 *         userId: 1
 *         totalExpense: 2000
 *         income: 3500
 *         profit: 1500
 *         isDeleted: false
 *         createdAt: "2025-08-11T20:00:00Z"
 */

/**
 * @swagger
 * /api/bouquets:
 *   post:
 *     summary: Create a new BouquetTransaction
 *     tags:
 *       - BouquetTransaction
 *     security:
 *       - ApiKeyAuth: []  # Remove or edit if you don't use API keys
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user creating the transaction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *                 example: "Special order for wedding"
 *               totalExpense:
 *                 type: integer
 *                 example: 2000
 *               income:
 *                 type: integer
 *                 example: 3500
 *               profit:
 *                 type: integer
 *                 example: 1500
 *               profitMargin:
 *                 type: integer
 *                 example: 15
 *             required:
 *               - totalExpense
 *               - income
 *               - profit
 *     responses:
 *       200:
 *         description: BouquetTransaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BouquetTransaction'
 */

export const createBouquetTransaction = asyncHandler(
  async (req: Request, res: Response) => {
    const { note, totalExpense, income, profit, profitMargin } = req.body;
    const userId = Number(req.header('x-user-id'));

    const bouquetTransaction = await createBouquetTransactionService({
      note,
      userId,
      totalExpense,
      income,
      profit,
      profitMargin,
    });

    if (!bouquetTransaction) {
      throw new AppError(
        'Bouquet Transaction was not created found',
        status.BAD_REQUEST
      );
    }

    res.status(status.OK).json(bouquetTransaction);
  }
);

/**
 * @swagger
 * /api/bouquets/{id}:
 *   get:
 *     summary: Get a single BouquetTransaction by ID
 *     tags:
 *       - BouquetTransaction
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID associated with the request
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the BouquetTransaction
 *     responses:
 *       200:
 *         description: BouquetTransaction fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BouquetTransaction'
 */

export const getBouquetTransactionById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      throw new AppError('Invalid ID', status.BAD_REQUEST);
    }

    const bouquetTransaction = await getBouquetTransactionByIdService(id);

    if (!bouquetTransaction) {
      throw new AppError('BouquetTransaction not found', status.NOT_FOUND);
    }

    res.status(status.OK).json(bouquetTransaction);
  }
);

/**
 * @swagger
 * /api/bouquets:
 *   get:
 *     summary: Get all BouquetTransactions
 *     tags:
 *       - BouquetTransaction
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID associated with the request
 *     responses:
 *       200:
 *         description: List of BouquetTransactions fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BouquetTransaction'
 *       500:
 *         description: Internal server error
 */

export const getAllBouquetTransactions = asyncHandler(
  async (_req: Request, res: Response) => {
    const bouquetTransactions = await getAllBouquetTransactionsService();

    res.status(status.OK).json(bouquetTransactions);
  }
);

/**
 * @swagger
 * /api/bouquets/{id}:
 *   put:
 *     summary: Update an existing BouquetTransaction
 *     tags:
 *       - BouquetTransaction
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user creating the transaction
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the BouquetTransaction to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *                 example: "Updated note for transaction"
 *               totalExpense:
 *                 type: integer
 *                 example: 2500
 *               income:
 *                 type: integer
 *                 example: 4000
 *               profit:
 *                 type: integer
 *                 example: 1500
 *               profitMargin:
 *                 type: integer
 *                 example: 15
 *               isDeleted:
 *                 type: boolean
 *                 example: false
 *             description: Fields to update (only include fields you want to change)
 *     responses:
 *       200:
 *         description: BouquetTransaction updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BouquetTransaction'
 *       400:
 *         description: Invalid ID or request body
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid ID
 *       404:
 *         description: BouquetTransaction not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: BouquetTransaction not found
 *       500:
 *         description: Internal server error
 */

export const updateBouquetTransaction = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      throw new AppError('Invalid ID', status.BAD_REQUEST);
    }

    const { note, totalExpense, income, profit, isDeleted, profitMargin } =
      req.body;

    const updatedTransaction = await updateBouquetTransactionService(id, {
      note,
      totalExpense,
      income,
      profit,
      isDeleted,
      profitMargin,
    });

    if (!updatedTransaction) {
      throw new AppError('BouquetTransaction not found', status.NOT_FOUND);
    }

    res.status(status.OK).json(updatedTransaction);
  }
);
