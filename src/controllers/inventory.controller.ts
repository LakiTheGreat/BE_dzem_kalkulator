import { Request, Response } from 'express';
import status from 'http-status';

import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  getAllCupsService,
  getUserCupIdsService,
} from '../services/cup.service.js';
import { getFruitByIdService } from '../services/fruit.service.js';
import {
  createInventoryService,
  getAllInventoryService,
  getInventoryForFruitService,
  updateInventoryService,
} from '../services/inventory.service.js';
import AppError from '../utils/AppError.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Inventory:
 *       type: object
 *       properties:
 *         orderTypeId:
 *           type: integer
 *           description: ID of the fruit (order type) this inventory belongs to
 *         cupData:
 *           type: array
 *           description: List of cup quantities by cup ID
 *           items:
 *             type: object
 *             properties:
 *               cupId:
 *                 type: integer
 *                 description: ID of the cup size
 *               quantity:
 *                 type: integer
 *                 description: Quantity available for this cup size
 */

/**
 * @swagger
 * /api/inventory/input:
 *   post:
 *     tags:
 *       - Inventory
 *     summary: Create or update inventory for a given orderType (fruit) and user
 *     description: >
 *       If no inventory exists for the given orderType and user, creates a new inventory entry.
 *       Otherwise, merges provided cupData quantities with existing inventory data.
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID associated with the request
 *     requestBody:
 *       description: Inventory data to upsert
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderTypeId
 *               - cupData
 *             properties:
 *               orderTypeId:
 *                 type: integer
 *                 description: ID of the order type (fruit)
 *                 example: 1
 *               cupData:
 *                 type: array
 *                 description: Array of cup IDs with their quantities
 *                 items:
 *                   type: object
 *                   required:
 *                     - cupId
 *                     - quantity
 *                   properties:
 *                     cupId:
 *                       type: integer
 *                       description: ID of the cup size
 *                       example: 3
 *                     quantity:
 *                       type: integer
 *                       description: Quantity of cups
 *                       example: 10
 *     responses:
 *       201:
 *         description: Inventory created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderTypeId:
 *                   type: integer
 *                   example: 1
 *                 cupData:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       cupId:
 *                         type: integer
 *                         example: 3
 *                       quantity:
 *                         type: integer
 *                         example: 10
 *                 userId:
 *                   type: integer
 *                   example: 7
 *       200:
 *         description: Inventory updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderTypeId:
 *                   type: integer
 *                   example: 1
 *                 cupData:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       cupId:
 *                         type: integer
 *                         example: 3
 *                       quantity:
 *                         type: integer
 *                         example: 15
 *                 userId:
 *                   type: integer
 *                   example: 7
 *       400:
 *         description: Bad request, validation error or missing data
 *       401:
 *         description: Unauthorized - user ID header missing or invalid
 *       500:
 *         description: Internal server error
 */

export const upsertInventory = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = Number(req.header('x-user-id'));
    const orderTypeId = req.body.orderTypeId;
    const cupData: { cupId: number; quantity: number }[] = req.body.cupData;

    // Validate fruit exists
    const fruit = await getFruitByIdService(userId, orderTypeId);
    if (!fruit) {
      throw new AppError(
        'Provided orderTypeId is invalid - not found',
        status.NOT_FOUND
      );
    }

    // Validate all cupIds belong to user
    const userCupIds = await getUserCupIdsService(userId);
    for (const item of cupData) {
      if (!userCupIds.includes(item.cupId)) {
        throw new AppError(
          `Invalid cupId ${item.cupId} for user ${userId}`,
          status.BAD_REQUEST
        );
      }
    }

    // Fetch existing inventory if any
    const existingInventory = await getInventoryForFruitService(
      orderTypeId,
      userId
    );

    if (!existingInventory) {
      // No existing inventory, create new with cupData as is
      const createdInventory = await createInventoryService(
        orderTypeId,
        cupData,
        userId
      );
      res.status(status.CREATED).json(createdInventory);
    } else {
      // Merge existing cupData (array) with new cupData (array)
      const existingCupData: { cupId: number; quantity: number }[] =
        (existingInventory.cupData as { cupId: number; quantity: number }[]) ||
        [];

      // Merge quantities by cupId
      for (const { cupId, quantity } of cupData) {
        const existingCup = existingCupData.find((c) => c.cupId === cupId);
        if (existingCup) {
          existingCup.quantity += quantity;
        } else {
          existingCupData.push({ cupId, quantity });
        }
      }

      // Update inventory with merged cupData array
      const updated = await updateInventoryService(
        orderTypeId,
        existingCupData,
        userId
      );
      res.status(status.OK).json(updated);
    }
  }
);

/**
 * @swagger
 * /api/inventory/overview:
 *   get:
 *     summary: Get total quantity of inventory per cup size for a user
 *     tags:
 *       - Inventory
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user making the request
 *     responses:
 *       200:
 *         description: A list of cup sizes with total quantities from inventory
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   label:
 *                     type: string
 *                     description: Label of the cup size (e.g. 212ml, 570ml)
 *                     example: "212ml"
 *                   numberOf:
 *                     type: integer
 *                     description: Total number of this cup size across all inventory
 *                     example: 15

 */

export const getAllInventory = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = Number(req.header('x-user-id'));

    const inventory = await getAllInventoryService(userId);

    if (!inventory) {
      throw new AppError('No inventory found for user', status.NOT_FOUND);
    }

    // Flatten all cupData arrays into one combined array
    const allCupEntries = inventory.flatMap(
      (inv) => inv.cupData as { cupId: number; quantity: number }[]
    );

    // Aggregate quantities by cupId
    const cupQuantityMap = new Map<number, number>();
    for (const entry of allCupEntries) {
      const currentQty = cupQuantityMap.get(entry.cupId) || 0;
      cupQuantityMap.set(entry.cupId, currentQty + entry.quantity);
    }

    const cups = await getAllCupsService(userId);

    const result = cups.map((cup) => ({
      label: cup.label,
      numberOf: cupQuantityMap.get(cup.id) || 0,
    }));
    res.status(status.OK).json(result);
  }
);
