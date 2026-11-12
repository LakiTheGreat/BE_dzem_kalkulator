import { Request, Response } from 'express';
import status from 'http-status';

import { asyncHandler } from '../../middlewares/asyncHandler.js';
import AppError from '../../utils/AppError.js';
import {
  createCupCostService,
  deleteCupCostService,
  getAllCupCostsService,
  putCupCostService,
} from '../services/cupCost.service.js';

const parseId = (req: Request) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    throw new AppError('Neispravan ID troška', status.BAD_REQUEST);
  }

  return id;
};

const notFound = () =>
  new AppError('Trošak tegle nije pronađen', status.NOT_FOUND);

/**
 * @swagger
 * /api/v2/cupCosts:
 *   get:
 *     tags:
 *       - CupCosts v2
 *     summary: Get all non-deleted cup costs of the user, sorted by label
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Array of cup costs
 *       404:
 *         description: User not found
 */
export const getAllCupCosts = asyncHandler(
  async (req: Request, res: Response) => {
    res.status(status.OK).json(await getAllCupCostsService(req.user.id));
  }
);

/**
 * @swagger
 * /api/v2/cupCosts:
 *   post:
 *     tags:
 *       - CupCosts v2
 *     summary: Create a cup cost
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
 *             required: [label, value]
 *             properties:
 *               label:
 *                 type: string
 *                 description: Trimmed, 3-50 characters
 *               value:
 *                 type: integer
 *                 description: Positive integer
 *     responses:
 *       201:
 *         description: The created cup cost
 *       400:
 *         description: Invalid input
 */
export const createCupCost = asyncHandler(
  async (req: Request, res: Response) => {
    const { label, value } = req.body;

    const cupCost = await createCupCostService(label, value, req.user.id);

    res.status(status.CREATED).json(cupCost);
  }
);

/**
 * @swagger
 * /api/v2/cupCosts/{id}:
 *   put:
 *     tags:
 *       - CupCosts v2
 *     summary: Update a cup cost (label and value are both required)
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
 *             required: [label, value]
 *             properties:
 *               label:
 *                 type: string
 *               value:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Object with message and updatedCupCost
 *       400:
 *         description: Invalid id or input
 *       404:
 *         description: Cup cost (missing or deleted) or user not found
 */
export const putCupCost = asyncHandler(async (req: Request, res: Response) => {
  const { label, value } = req.body;

  const updatedCupCost = await putCupCostService(
    parseId(req),
    label,
    value,
    req.user.id
  );

  if (!updatedCupCost) {
    throw notFound();
  }

  res
    .status(status.OK)
    .json({ message: 'Trošak tegle je izmenjen', updatedCupCost });
});

/**
 * @swagger
 * /api/v2/cupCosts/{id}:
 *   delete:
 *     tags:
 *       - CupCosts v2
 *     summary: Soft-delete a cup cost that no active cup uses
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
 *         description: Object with message and deletedCupCost
 *       400:
 *         description: Invalid id, or the cost is still used by an active cup
 *       404:
 *         description: Cup cost (missing or already deleted) or user not found
 */
export const deleteCupCost = asyncHandler(
  async (req: Request, res: Response) => {
    const deletedCupCost = await deleteCupCostService(
      parseId(req),
      req.user.id
    );

    if (!deletedCupCost) {
      throw notFound();
    }

    res
      .status(status.OK)
      .json({ message: 'Trošak tegle je obrisan', deletedCupCost });
  }
);
