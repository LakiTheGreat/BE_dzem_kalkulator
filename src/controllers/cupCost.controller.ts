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
 *     summary: Get all non-deleted cupCosts
 *     responses:
 *       200:
 *         description: List of cupCosts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CupCost'
 *       500:
 *         description: Internal server error
 */
export const getAllCupCosts = asyncHandler(
  async (req: Request, res: Response) => {
    const cupCosts = await getAllCupCostsService();

    if (!cupCosts) {
      throw new AppError('CupCosts not found', status.NOT_FOUND);
    }

    res.status(200).json(cupCosts);
  }
);

/**
 * @swagger
 * /api/cupCosts:
 *   post:
 *     tags:
 *       - CupCosts
 *     summary: Create a new cupCost
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

    if (!label || !value) {
      throw new AppError('Label and value are required', status.BAD_REQUEST);
    }

    const newCupCost = await createNewCupCostService(label, value);
    if (!newCupCost) {
      throw new AppError('CupCost not created', status.INTERNAL_SERVER_ERROR);
    }

    res.status(201).json(newCupCost);
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

  const updatedCupCost = await putCupCostService(cupCostId, label, value);

  if (!updatedCupCost) {
    throw new AppError('CupCost not updated', status.INTERNAL_SERVER_ERROR);
  }

  res
    .status(200)
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

    if (isNaN(cupCostId)) {
      throw new AppError('Invalid cupCost ID', status.BAD_REQUEST);
    }

    const deletedCupCost = deleteCupCostService(cupCostId);

    if (!deletedCupCost) {
      throw new AppError('CupCost not deleted', status.INTERNAL_SERVER_ERROR);
    }

    res
      .status(200)
      .json({ message: 'CupCost soft-deleted successfully', deletedCupCost });
  }
);
