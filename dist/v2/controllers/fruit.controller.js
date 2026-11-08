import status from 'http-status';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { getAllFruitsService, createFruitService } from '../services/fruit.service.js';
/**
 * @swagger
 * /api/v2/fruits:
 *   post:
 *     tags:
 *       - Fruits v2
 *     summary: Create a fruit; a duplicate label gets a " (n)" suffix
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
 *             required:
 *               - label
 *             properties:
 *               label:
 *                 type: string
 *                 description: Trimmed, 3-50 characters
 *                 example: Jasika
 *     responses:
 *       201:
 *         description: The created fruit
 *       400:
 *         description: Invalid label
 *       404:
 *         description: User not found
 */
export const createFruit = asyncHandler(async (req, res) => {
    const fruit = await createFruitService(req.body.label, req.user.id);
    res.status(status.CREATED).json(fruit);
});
/**
 * @swagger
 * /api/v2/fruits:
 *   get:
 *     tags:
 *       - Fruits v2
 *     summary: Get all non-deleted fruits for a user, sorted by label
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of fruits (empty array if none)
 *       404:
 *         description: User not found
 */
export const getAllFruits = asyncHandler(async (req, res) => {
    const fruits = await getAllFruitsService(req.user.id);
    res.status(status.OK).json(fruits);
});
//# sourceMappingURL=fruit.controller.js.map