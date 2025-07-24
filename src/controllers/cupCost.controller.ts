import { Request, Response } from 'express';
import status from 'http-status';

import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  createNewCupCostService,
  deleteCupCostService,
  getAllCupCostsService,
  putCupCostService,
} from '../services/cupCost.service.js';
import AppError from '../utils/AppError.js';

/**
 * @swagger
 * /api/cupCosts:
 *   get:
 *     tags:
 *       - CupCosts
 *     summary: Get all non-deleted cupCosts for a specific user
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user making the request
 *     responses:
 *       200:
 *         description: List of cupCosts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CupCost'
 *       401:
 *         description: Missing or invalid user ID
 *       500:
 *         description: Internal server error
 */

export const getAllCupCosts = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = Number(req.header('x-user-id'));

    const cupCosts = await getAllCupCostsService(userId);

    if (!cupCosts) {
      throw new AppError('CupCosts not found', status.NOT_FOUND);
    }

    res.status(status.OK).json(cupCosts);
  }
);

/**
 * @swagger
 * /api/cupCosts:
 *   post:
 *     tags:
 *       - CupCosts
 *     summary: Create a new cupCost
  *     parameters:
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user making the request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - label
 *               - value
 *             properties:
 *               label:
 *                 type: string
 *                 example: "Small Cost Label"
 *                 description: Label for the cup cost (3-50 chars)
 *               value:
 *                 type: integer
 *                 example: 100
 *                 description: Cost value, must be a positive integer
 *     responses:
 *       201:
 *         description: CupCost created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CupCost'

 */

export const createCupCost = asyncHandler(
  async (req: Request, res: Response) => {
    const { label, value } = req.body;
    const userId = Number(req.header('x-user-id'));

    if (!label || !value) {
      throw new AppError('Label and value are required', status.BAD_REQUEST);
    }

    const newCupCost = await createNewCupCostService(label, value, userId);
    if (!newCupCost) {
      throw new AppError('CupCost not created', status.INTERNAL_SERVER_ERROR);
    }

    res.status(status.CREATED).json(newCupCost);
  }
);

/**
 * @swagger
 * /api/cupCosts/{id}:
 *   put:
 *     tags:
 *       - CupCosts
 *     summary: Update a cupCost by ID
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user making the request
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the cupCost to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: integer
 *                 example: 120
 *               label:
 *                 type: string
 *                 example: "Updated cost label"
 *     responses:
 *       200:
 *         description: CupCost updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "CupCost updated successfully"
 *                 updatedCupCost:
 *                   $ref: '#/components/schemas/CupCost'
 *       400:
 *         description: Invalid ID supplied
 *       404:
 *         description: CupCost not found
 *       500:
 *         description: Internal server error
 */
export const putCupCost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const cupCostId = Number(id);

  const userId = Number(req.header('x-user-id'));

  if (isNaN(cupCostId)) {
    throw new AppError('Invalid cupCost ID', status.BAD_REQUEST);
  }

  const { value, label } = req.body;

  if (!value && !label) {
    throw new AppError(
      'Missing required fields - value and label',
      status.BAD_REQUEST
    );
  }

  const updatedCupCost = await putCupCostService(
    cupCostId,
    label,
    value,
    userId
  );

  if (!updatedCupCost) {
    throw new AppError('CupCost not updated', status.INTERNAL_SERVER_ERROR);
  }

  res
    .status(status.OK)
    .json({ message: 'CupCost updated successfully', updatedCupCost });
});

/**
 * @swagger
 * /api/cupCosts/{id}:
 *   delete:
 *     tags:
 *       - CupCosts
 *     summary: Soft delete a cupCost by ID

 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the cupCost to delete
  *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user making the request
 *     responses:
 *       200:
 *         description: CupCost soft deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "CupCost soft-deleted successfully"
 *                 deletedCupCost:
 *                   $ref: '#/components/schemas/CupCost'
 *       400:
 *         description: Invalid ID supplied
 *       404:
 *         description: CupCost not found
 *       500:
 *         description: Internal server error
 */
export const deleteCupCost = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const cupCostId = Number(id);
    const userId = Number(req.header('x-user-id'));

    if (isNaN(cupCostId)) {
      throw new AppError('Invalid cupCost ID', status.BAD_REQUEST);
    }

    const deletedCupCost = deleteCupCostService(cupCostId, userId);

    if (!deletedCupCost) {
      throw new AppError('CupCost not deleted', status.INTERNAL_SERVER_ERROR);
    }

    res
      .status(status.OK)
      .json({ message: 'CupCost soft-deleted successfully', deletedCupCost });
  }
);
