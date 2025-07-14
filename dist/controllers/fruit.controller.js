import status from 'http-status';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { createNewFruitService, deleteFruitService, getAllFruitsService, getAlLFruitsWithSameNameService, patchFruitService, } from '../services/fruit.service.js';
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
 *     summary: Get all non-deleted fruits
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
 */
export const getAllFruits = asyncHandler(async (req, res) => {
    const fruits = await getAllFruitsService();
    if (!fruits) {
        throw new AppError('Fruits not found', status.NOT_FOUND);
    }
    res.status(status.OK).json(fruits);
});
/**
 * @swagger
 * /api/fruits:
 *   post:
 *     tags:
 *       - Fruits
 *     summary: Create a new fruit
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
 */
export const createNewFruit = asyncHandler(async (req, res) => {
    const baseName = req.body.label?.trim();
    if (!baseName) {
        throw new AppError('Missing required field - label', status.BAD_REQUEST);
    }
    // Find all fruits with the same base name or with (n) suffix
    const existingFruits = await getAlLFruitsWithSameNameService(baseName);
    // Filter to count how many follow the format: "name" or "name (n)"
    const sameNameCount = existingFruits.filter((fruit) => {
        return (fruit.label === baseName ||
            fruit.label.match(new RegExp(`^${baseName} \\(\\d+\\)$`)));
    }).length;
    const newName = sameNameCount === 0 ? baseName : `${baseName} (${sameNameCount + 1})`;
    const fruit = await createNewFruitService(newName);
    if (!fruit) {
        throw new AppError('Something went wrong - fruit was not created!', status.INTERNAL_SERVER_ERROR);
    }
    res.status(status.CREATED).json(fruit);
});
/**
 * @swagger
 * /api/fruits/{id}:
 *   patch:
 *     tags:
 *       - Fruits
 *     summary: Update a fruit's menuItemLabel and value
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the fruit to update
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
 *       404:
 *         description: Fruit not found
 *       500:
 *         description: Server error
 */
export const patchFruitLabel = asyncHandler(async (req, res) => {
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
    const existingFruits = await getAlLFruitsWithSameNameService(baseName);
    // Exclude the current fruit being updated
    const filtered = existingFruits.filter((fruit) => fruit.id !== fruitId);
    const sameNameCount = filtered.filter((fruit) => {
        return (fruit.label === baseName ||
            fruit.label.match(new RegExp(`^${baseName} \\(\\d+\\)$`)));
    }).length;
    // Rename only if there are other fruits with the same name
    req.body.label =
        sameNameCount === 0 ? baseName : `${baseName} (${sameNameCount + 1})`;
    const updatedFruit = await patchFruitService(fruitId, req.body.label);
    if (!updatedFruit) {
        throw new AppError('Something went wrong - fruit was not updated!', status.INTERNAL_SERVER_ERROR);
    }
    res.status(status.OK).json(updatedFruit);
});
/**
 *  @swagger
 * /api/fruits/{id}:
 *   delete:
 *     tags:
 *       - Fruits
 *     summary: Soft delete a fruit by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the fruit to delete
 *     responses:
 *       200:
 *         description: Fruit deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Fruit deleted successfully
 *
 */
export const deleteFruitById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const fruitId = Number(id);
    if (isNaN(fruitId)) {
        throw new AppError('Invalid fruit ID', status.BAD_REQUEST);
    }
    const fruit = await deleteFruitService(fruitId);
    if (!fruit) {
        throw new AppError('Something went wrong - fruit was not deleted!', status.INTERNAL_SERVER_ERROR);
    }
    res
        .status(status.OK)
        .json({ message: 'Fruit marked as soft-deleted', fruit });
});
//# sourceMappingURL=fruit.controller.js.map