import { Request, Response } from 'express';
import status from 'http-status';

import { asyncHandler } from '../../middlewares/asyncHandler.js';
import AppError from '../../utils/AppError.js';
import {
  createCupValueService,
  deleteCupValueService,
  getAllCupValuesService,
  putCupValueService,
} from '../services/cupValue.service.js';

const parseId = (req: Request) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    throw new AppError('Neispravan ID cene', status.BAD_REQUEST);
  }

  return id;
};

const notFound = () => new AppError('Cena tegle nije pronađena', status.NOT_FOUND);

/**
 * @swagger
 * /api/v2/cupValues:
 *   get:
 *     tags:
 *       - CupValues v2
 *     summary: Get all non-deleted cup selling prices of the user, sorted by label
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Array of cup values
 *       404:
 *         description: User not found
 */
export const getAllCupValues = asyncHandler(
  async (req: Request, res: Response) => {
    res.status(status.OK).json(await getAllCupValuesService(req.user.id));
  }
);

/**
 * @swagger
 * /api/v2/cupValues:
 *   post:
 *     tags:
 *       - CupValues v2
 *     summary: Create a cup selling price
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
 *         description: The created cup value
 *       400:
 *         description: Invalid input
 */
export const createCupValue = asyncHandler(
  async (req: Request, res: Response) => {
    const { label, value } = req.body;

    const cupValue = await createCupValueService(label, value, req.user.id);

    res.status(status.CREATED).json(cupValue);
  }
);

/**
 * @swagger
 * /api/v2/cupValues/{id}:
 *   put:
 *     tags:
 *       - CupValues v2
 *     summary: Update a cup selling price (label and value are both required)
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
 *         description: Object with message and updatedCupValue
 *       400:
 *         description: Invalid id or input
 *       404:
 *         description: Cup value (missing or deleted) or user not found
 */
export const putCupValue = asyncHandler(
  async (req: Request, res: Response) => {
    const { label, value } = req.body;

    const updatedCupValue = await putCupValueService(
      parseId(req),
      label,
      value,
      req.user.id
    );

    if (!updatedCupValue) {
      throw notFound();
    }

    res
      .status(status.OK)
      .json({ message: 'Cena tegle je izmenjena', updatedCupValue });
  }
);

/**
 * @swagger
 * /api/v2/cupValues/{id}:
 *   delete:
 *     tags:
 *       - CupValues v2
 *     summary: Soft-delete a cup selling price that no active cup uses
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
 *         description: Object with message and deletedCupValue
 *       400:
 *         description: Invalid id, or the price is still used by an active cup
 *       404:
 *         description: Cup value (missing or already deleted) or user not found
 */
export const deleteCupValue = asyncHandler(
  async (req: Request, res: Response) => {
    const deletedCupValue = await deleteCupValueService(
      parseId(req),
      req.user.id
    );

    if (!deletedCupValue) {
      throw notFound();
    }

    res
      .status(status.OK)
      .json({ message: 'Cena tegle je obrisana', deletedCupValue });
  }
);
