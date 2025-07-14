import { Request, Response } from 'express';
import status from 'http-status';

import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  createNewCupService,
  deleteCupService,
  findCostCupService,
  findCostValueService,
  getAllCupsWithDataService,
  putCupService,
} from '../services/cup.service.js';
import AppError from '../utils/AppError.js';
import prisma from '../utils/db.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     CupCost:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         value:
 *           type: integer
 *           example: 100
 *         label:
 *           type: string
 *           example: "Cost Label"
 *     CupValue:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 2
 *         value:
 *           type: integer
 *           example: 150
 *         label:
 *           type: string
 *           example: "Selling Price Label"
 *     Cup:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         label:
 *           type: string
 *           example: "212ml"
 *         isDeleted:
 *           type: boolean
 *           example: false
 *         cost:
 *           $ref: '#/components/schemas/CupCost'
 *         sellingPrice:
 *           $ref: '#/components/schemas/CupValue'
 *     CupCreateRequest:
 *       type: object
 *       required:
 *         - label
 *         - costId
 *         - valueId
 *       properties:
 *         label:
 *           type: string
 *           example: "Large Cup"
 *         costId:
 *           type: integer
 *           example: 1
 *         valueId:
 *           type: integer
 *           example: 2
 */

/**
 * @swagger
 * /api/cups:
 *   get:
 *     tags:
 *       - Cups
 *     summary: Get all non-deleted cups with simplified cost and selling price values
 *     responses:
 *       200:
 *         description: List of cups with simplified cost and selling price values
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cup'
 *             examples:
 *               simplified:
 *                 summary: Simplified cup response example
 *                 value:
 *                   - id: 1
 *                     label: "212ml"
 *                     isDeleted: false
 *                     cost: 100
 *                     sellingPrice: 150
 *                   - id: 2
 *                     label: "500ml"
 *                     isDeleted: false
 *                     cost: 120
 *                     sellingPrice: 180
 *       500:
 *         description: Internal server error
 */

export const getAllCups = asyncHandler(async (req: Request, res: Response) => {
  const cups = await getAllCupsWithDataService();

  if (!cups) {
    throw new AppError('Cups not found', status.NOT_FOUND);
  }

  const simplifiedCups = cups.map((cup) => ({
    id: cup.id,
    label: cup.label,
    isDeleted: cup.isDeleted,
    cost: cup.cost?.value ?? null,
    sellingPrice: cup.sellingPrice?.value ?? null,
  }));

  res.status(status.OK).json(simplifiedCups);
});

/**
 * @swagger
 * /api/cups:
 *   post:
 *     tags:
 *       - Cups
 *     summary: Create a new cup
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - label
 *               - costId
 *               - valueId
 *             properties:
 *               label:
 *                 type: string
 *                 description: The label/name of the cup
 *                 example: "Large Cup"
 *               costId:
 *                 type: integer
 *                 description: The ID of an existing CupCost
 *                 example: 1
 *               valueId:
 *                 type: integer
 *                 description: The ID of an existing CupValue (selling price)
 *                 example: 2
 *     responses:
 *       201:
 *         description: Cup created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cup'
 */

export const createNewCup = asyncHandler(
  async (req: Request, res: Response) => {
    const { label, costId, valueId } = req.body;

    const cup = await createNewCupService(label, costId, valueId);

    if (!cup) {
      throw new AppError('Cup was not created', status.INTERNAL_SERVER_ERROR);
    }

    res.status(status.CREATED).json(cup);
  }
);

/**
 * @swagger
 * /api/cups/{id}:
 *   put:
 *     summary: Update an existing cup
 *     tags: [Cups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the cup to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *                 example: "Large Cup"
 *               costId:
 *                 type: integer
 *                 example: 1
 *                 description: ID of existing CupCost
 *               valueId:
 *                 type: integer
 *                 example: 2
 *                 description: ID of existing CupValue (selling price)
 *     responses:
 *       200:
 *         description: Cup updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cup updated successfully"
 *                 updatedCup:
 *                   $ref: '#/components/schemas/Cup'
 *
 */

export const putCup = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const cupId = Number(id);

  if (isNaN(cupId)) {
    throw new AppError('Invalid cup ID', status.BAD_REQUEST);
  }

  const { label, costId, valueId } = req.body;

  if (!label || !costId || !valueId) {
    throw new AppError('Missing required fields', status.BAD_REQUEST);
  }

  const costCup = await findCostCupService(costId);

  if (!costCup) {
    throw new AppError(
      'CupCost not found - costId not valid',
      status.NOT_FOUND
    );
  }

  const valueCup = await findCostValueService(valueId);

  if (!valueCup) {
    throw new AppError(
      'CupValue not found - valueId not valid',
      status.NOT_FOUND
    );
  }
  const updatedCup = await putCupService(cupId, label, costId, valueId);

  if (!updatedCup) {
    throw new AppError('Cup was not updated', status.INTERNAL_SERVER_ERROR);
  }

  res
    .status(status.OK)
    .json({ message: 'Cup updated successfully', updatedCup });
});

/**
 * @swagger
 * /api/cups/{id}:
 *   delete:
 *     tags:
 *       - Cups
 *     summary: Soft delete a cup by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the cup to delete
 *     responses:
 *       200:
 *         description: Cup marked as deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cup'
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Cup not found
 */

export const deleteCupById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const cupId = Number(id);
    if (isNaN(cupId)) {
      throw new AppError('Invalid cup ID', status.BAD_REQUEST);
    }

    const cup = await deleteCupService(cupId);

    if (!cup) {
      throw new AppError('Cup was not deleted', status.INTERNAL_SERVER_ERROR);
    }

    res.status(status.OK).json({ message: 'Cup marked as deleted', cup });
  }
);
