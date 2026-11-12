import { BouquetTransactionEnum } from '@prisma/client';
import { Request, Response } from 'express';
import status from 'http-status';

import { asyncHandler } from '../../middlewares/asyncHandler.js';
import AppError from '../../utils/AppError.js';
import {
  createBouquetService,
  getAllBouquetsService,
  getBouquetByIdService,
  updateBouquetService,
} from '../services/bouquet.service.js';

const NOT_FOUND_MESSAGE = 'Buket transakcija nije pronađena';

const parseId = (req: Request) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    throw new AppError('Neispravan ID buket transakcije', status.BAD_REQUEST);
  }

  return id;
};

/**
 * @swagger
 * /api/v2/bouquets:
 *   get:
 *     tags:
 *       - Bouquets v2
 *     summary: Get all non-deleted bouquet transactions of the user, newest first
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: transactionStatus
 *         required: false
 *         schema:
 *           type: string
 *           enum: [SOLD, GIVEN_AWAY, PROMOTION, OTHER]
 *     responses:
 *       200:
 *         description: Array of { id, note, status, totalExpense, income, profit, profitMargin, isDeleted, createdAt }
 *       400:
 *         description: Invalid transactionStatus
 *       404:
 *         description: User not found
 */
export const getAllBouquets = asyncHandler(
  async (req: Request, res: Response) => {
    const transactionStatus = req.query.transactionStatus as
      | BouquetTransactionEnum
      | undefined;

    res
      .status(status.OK)
      .json(await getAllBouquetsService(req.user.id, transactionStatus));
  }
);

/**
 * @swagger
 * /api/v2/bouquets/{id}:
 *   get:
 *     tags:
 *       - Bouquets v2
 *     summary: Get one non-deleted bouquet transaction
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: The bouquet transaction
 *       400:
 *         description: Invalid id
 *       404:
 *         description: Not found, deleted, or user not found
 */
export const getBouquetById = asyncHandler(
  async (req: Request, res: Response) => {
    const bouquet = await getBouquetByIdService(parseId(req), req.user.id);

    if (!bouquet) {
      throw new AppError(NOT_FOUND_MESSAGE, status.NOT_FOUND);
    }

    res.status(status.OK).json(bouquet);
  }
);

/**
 * @swagger
 * /api/v2/bouquets:
 *   post:
 *     tags:
 *       - Bouquets v2
 *     summary: Create a bouquet transaction
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status, totalExpense, income, profit, profitMargin]
 *             properties:
 *               note:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [SOLD, GIVEN_AWAY, PROMOTION, OTHER]
 *               totalExpense:
 *                 type: integer
 *                 minimum: 0
 *               income:
 *                 type: integer
 *                 minimum: 0
 *               profit:
 *                 type: integer
 *               profitMargin:
 *                 type: integer
 *     responses:
 *       200:
 *         description: The created bouquet transaction
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User not found
 */
export const createBouquet = asyncHandler(
  async (req: Request, res: Response) => {
    const { note, status: bouquetStatus, totalExpense, income, profit, profitMargin } =
      req.body;

    const bouquet = await createBouquetService(
      { note, status: bouquetStatus, totalExpense, income, profit, profitMargin },
      req.user.id
    );

    res.status(status.OK).json(bouquet);
  }
);

/**
 * @swagger
 * /api/v2/bouquets/{id}:
 *   put:
 *     tags:
 *       - Bouquets v2
 *     summary: Update a bouquet transaction (all fields except note and isDeleted are required); isDeleted true soft-deletes it
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status, totalExpense, income, profit, profitMargin]
 *             properties:
 *               note:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [SOLD, GIVEN_AWAY, PROMOTION, OTHER]
 *               totalExpense:
 *                 type: integer
 *                 minimum: 0
 *               income:
 *                 type: integer
 *                 minimum: 0
 *               profit:
 *                 type: integer
 *               profitMargin:
 *                 type: integer
 *               isDeleted:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: The updated bouquet transaction
 *       400:
 *         description: Invalid id or input
 *       404:
 *         description: Not found, already deleted, or user not found
 */
export const updateBouquet = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      note,
      status: bouquetStatus,
      totalExpense,
      income,
      profit,
      profitMargin,
      isDeleted,
    } = req.body;

    const bouquet = await updateBouquetService(
      parseId(req),
      {
        note,
        status: bouquetStatus,
        totalExpense,
        income,
        profit,
        profitMargin,
        isDeleted,
      },
      req.user.id
    );

    if (!bouquet) {
      throw new AppError(NOT_FOUND_MESSAGE, status.NOT_FOUND);
    }

    res.status(status.OK).json(bouquet);
  }
);
