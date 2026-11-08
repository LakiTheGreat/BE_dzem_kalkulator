import status from 'http-status';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import AppError from '../../utils/AppError.js';
import { createFruitService, deleteFruitService, getAllFruitsService, patchFruitService, } from '../services/fruit.service.js';
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
/**
 * @swagger
 * /api/v2/fruits/{id}:
 *   patch:
 *     tags:
 *       - Fruits v2
 *     summary: Rename a fruit; a duplicate label gets a " (n)" suffix
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
 *     responses:
 *       200:
 *         description: The updated fruit
 *       400:
 *         description: Invalid id or label
 *       404:
 *         description: Fruit not found (or deleted), or user not found
 */
export const patchFruit = asyncHandler(async (req, res) => {
    const fruitId = Number(req.params.id);
    if (!Number.isInteger(fruitId) || fruitId < 1) {
        throw new AppError('Invalid fruit ID', status.BAD_REQUEST);
    }
    const fruit = await patchFruitService(fruitId, req.body.label, req.user.id);
    if (!fruit) {
        throw new AppError('Fruit not found', status.NOT_FOUND);
    }
    res.status(status.OK).json(fruit);
});
/**
 * @swagger
 * /api/v2/fruits/{id}:
 *   delete:
 *     tags:
 *       - Fruits v2
 *     summary: Soft-delete a fruit
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Object with message and the deleted fruit
 *       400:
 *         description: Invalid id
 *       404:
 *         description: Fruit not found (or already deleted), or user not found
 */
export const deleteFruit = asyncHandler(async (req, res) => {
    const fruitId = Number(req.params.id);
    if (!Number.isInteger(fruitId) || fruitId < 1) {
        throw new AppError('Invalid fruit ID', status.BAD_REQUEST);
    }
    const fruit = await deleteFruitService(fruitId, req.user.id);
    if (!fruit) {
        throw new AppError('Fruit not found', status.NOT_FOUND);
    }
    res.status(status.OK).json({ message: 'Fruit marked as soft-deleted', fruit });
});
//# sourceMappingURL=fruit.controller.js.map