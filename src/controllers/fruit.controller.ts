import { Request, Response } from 'express';
import status from 'http-status';

import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  createNewFruitService,
  deleteFruitService,
  getAllFruitsService,
  getAlLFruitsWithSameNameService,
  patchFruitService,
} from '../services/fruit.service.js';
import AppError from '../utils/AppError.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Fruit:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         value:
 *           type: string
 *         menuItemLabel:
 *           type: string
 *         isDeleted:
 *           type: boolean
 */

/**
 * @swagger
 * /api/fruits:
 *   get:
 *     tags:
 *       - Fruits
 *     summary: Get all non-deleted fruits for a specific user
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID associated with the request
 *     responses:
 *       200:
 *         description: List of fruits
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Fruit'
 *             examples:
 *               sample:
 *                 summary: Sample fruit list
 *                 value:
 *                   - id: 1
 *                     label: Jasika
 *                     isDeleted: false
 *                     userId: 7
 *       401:
 *         description: Unauthorized - user ID header missing or invalid
 *       404:
 *         description: No fruits found
 *       500:
 *         description: Internal server error
 */

export const getAllFruits = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = Number(req.header('x-user-id'));

    const fruits = await getAllFruitsService(userId);

    if (!fruits) {
      throw new AppError('Fruits not found', status.NOT_FOUND);
    }

    res.status(status.OK).json(fruits);
  }
);

/**
 * @swagger
 * /api/fruits:
 *   post:
 *     tags:
 *       - Fruits
 *     summary: Create a new fruit
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user creating the fruit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - label
 *             properties:
 *               label:
 *                 type: string
 *                 example: "Jasika"
 *     responses:
 *       201:
 *         description: The created fruit object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Fruit'
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Missing or invalid user ID header
 *       500:
 *         description: Internal server error
 */

export const createNewFruit = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = Number(req.header('x-user-id'));
    const baseName = req.body.label?.trim();

    if (!baseName) {
      throw new AppError('Missing required field - label', status.BAD_REQUEST);
    }

    // Find all fruits with the same base name or with (n) suffix
    const existingFruits = await getAlLFruitsWithSameNameService(
      baseName,
      userId
    );

    // Filter to count how many follow the format: "name" or "name (n)"
    const sameNameCount = existingFruits.filter((fruit) => {
      return (
        fruit.label === baseName ||
        fruit.label.match(new RegExp(`^${baseName} \\(\\d+\\)$`))
      );
    }).length;

    const newName =
      sameNameCount === 0 ? baseName : `${baseName} (${sameNameCount + 1})`;

    const fruit = await createNewFruitService(newName, userId);

    if (!fruit) {
      throw new AppError(
        'Something went wrong - fruit was not created!',
        status.INTERNAL_SERVER_ERROR
      );
    }

    res.status(status.CREATED).json(fruit);
  }
);

/**
 * @swagger
 * /api/fruits/{id}:
 *   patch:
 *     tags:
 *       - Fruits
 *     summary: Update a fruit's label
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the fruit to update
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
 *             properties:
 *               label:
 *                 type: string
 *                 example: "Updated Fruit Name"
 *     responses:
 *       200:
 *         description: Updated fruit
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Fruit'
 *       400:
 *         description: Invalid ID or label
 *       401:
 *         description: Missing or invalid user ID
 *       404:
 *         description: Fruit not found
 *       500:
 *         description: Server error
 */

export const patchFruitLabel = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = Number(req.header('x-user-id'));
    const { id } = req.params;
    const { label } = req.body;
    const fruitId = Number(id);

    if (isNaN(fruitId)) {
      throw new AppError('Invalid fruit ID', status.BAD_REQUEST);
    }

    if (!label) {
      throw new AppError('Missing required field - label', status.BAD_REQUEST);
    }

    const baseName = req.body.label.trim();

    const existingFruits = await getAlLFruitsWithSameNameService(
      baseName,
      userId
    );

    // Exclude the current fruit being updated
    const filtered = existingFruits.filter((fruit) => fruit.id !== fruitId);

    const sameNameCount = filtered.filter((fruit) => {
      return (
        fruit.label === baseName ||
        fruit.label.match(new RegExp(`^${baseName} \\(\\d+\\)$`))
      );
    }).length;

    // Rename only if there are other fruits with the same name
    req.body.label =
      sameNameCount === 0 ? baseName : `${baseName} (${sameNameCount + 1})`;

    const updatedFruit = await patchFruitService(
      fruitId,
      req.body.label,
      userId
    );
    if (!updatedFruit) {
      throw new AppError(
        'Something went wrong - fruit was not updated!',
        status.INTERNAL_SERVER_ERROR
      );
    }

    res.status(status.OK).json(updatedFruit);
  }
);

/**
 * @swagger
 * /api/fruits/{id}:
 *   delete:
 *     tags:
 *       - Fruits
 *     summary: Soft-delete a fruit by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the fruit to delete
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user making the request
 *     responses:
 *       200:
 *         description: Fruit marked as soft-deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Fruit marked as soft-deleted
 *                 fruit:
 *                   $ref: '#/components/schemas/Fruit'
 *       400:
 *         description: Invalid fruit ID
 *       401:
 *         description: Missing or invalid user ID
 *       404:
 *         description: Fruit not found
 *       500:
 *         description: Server error
 */

export const deleteFruitById = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = Number(req.header('x-user-id'));
    const { id } = req.params;

    const fruitId = Number(id);

    if (isNaN(fruitId)) {
      throw new AppError('Invalid fruit ID', status.BAD_REQUEST);
    }

    const fruit = await deleteFruitService(fruitId, userId);
    if (!fruit) {
      throw new AppError(
        'Something went wrong - fruit was not deleted!',
        status.INTERNAL_SERVER_ERROR
      );
    }

    res
      .status(status.OK)
      .json({ message: 'Fruit marked as soft-deleted', fruit });
  }
);
