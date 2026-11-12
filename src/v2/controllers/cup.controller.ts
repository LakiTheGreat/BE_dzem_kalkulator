import { Request, Response } from 'express';
import status from 'http-status';

import { asyncHandler } from '../../middlewares/asyncHandler.js';
import AppError from '../../utils/AppError.js';
import {
  createCupService,
  deleteCupService,
  getAllCupsService,
  putCupService,
} from '../services/cup.service.js';

const parseId = (req: Request) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    throw new AppError('Neispravan ID tegle', status.BAD_REQUEST);
  }

  return id;
};

/**
 * @swagger
 * /api/v2/cups:
 *   get:
 *     tags:
 *       - Cups v2
 *     summary: Get all non-deleted cups of the user, sorted by label, with flat cost and selling price
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Array of { id, label, isDeleted, cost, sellingPrice }
 *       404:
 *         description: User not found
 */
export const getAllCups = asyncHandler(async (req: Request, res: Response) => {
  res.status(status.OK).json(await getAllCupsService(req.user.id));
});

/**
 * @swagger
 * /api/v2/cups:
 *   post:
 *     tags:
 *       - Cups v2
 *     summary: Create a cup
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
 *             required: [label, costId, valueId]
 *             properties:
 *               label:
 *                 type: string
 *                 description: Trimmed, 3-50 characters
 *               costId:
 *                 type: integer
 *                 description: Existing non-deleted CupCost of the user
 *               valueId:
 *                 type: integer
 *                 description: Existing non-deleted CupValue (selling price) of the user
 *     responses:
 *       201:
 *         description: The created cup including cost and sellingPrice objects
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User, cost or price not found
 */
export const createCup = asyncHandler(async (req: Request, res: Response) => {
  const { label, costId, valueId } = req.body;

  const cup = await createCupService(label, costId, valueId, req.user.id);

  res.status(status.CREATED).json(cup);
});

/**
 * @swagger
 * /api/v2/cups/{id}:
 *   put:
 *     tags:
 *       - Cups v2
 *     summary: Update a cup (label, cost and selling price are all required)
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
 *             required: [label, costId, valueId]
 *             properties:
 *               label:
 *                 type: string
 *               costId:
 *                 type: integer
 *               valueId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Object with message and updatedCup
 *       400:
 *         description: Invalid id or input
 *       404:
 *         description: Cup (missing or deleted), cost, price or user not found
 */
export const putCup = asyncHandler(async (req: Request, res: Response) => {
  const { label, costId, valueId } = req.body;

  const updatedCup = await putCupService(
    parseId(req),
    label,
    costId,
    valueId,
    req.user.id
  );

  if (!updatedCup) {
    throw new AppError('Tegla nije pronađena', status.NOT_FOUND);
  }

  res.status(status.OK).json({ message: 'Tegla je izmenjena', updatedCup });
});

/**
 * @swagger
 * /api/v2/cups/{id}:
 *   delete:
 *     tags:
 *       - Cups v2
 *     summary: Soft-delete a cup
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
 *         description: Object with message and the deleted cup
 *       400:
 *         description: Invalid id
 *       404:
 *         description: Cup (missing or already deleted) or user not found
 */
export const deleteCup = asyncHandler(async (req: Request, res: Response) => {
  const cup = await deleteCupService(parseId(req), req.user.id);

  if (!cup) {
    throw new AppError('Tegla nije pronađena', status.NOT_FOUND);
  }

  res.status(status.OK).json({ message: 'Tegla je obrisana', cup });
});
