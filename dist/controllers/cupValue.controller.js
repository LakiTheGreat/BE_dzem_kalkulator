import status from 'http-status';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { createCupValueService, deleteCupValueService, getAllCupValuesService, putCupValueService, } from '../services/cupValue.service.js';
import AppError from '../utils/AppError.js';
/**
 * @swagger
 * /api/cupValues:
 *   get:
 *     tags:
 *       - CupValues
 *     summary: Get all non-deleted cupValues
 *     responses:
 *       200:
 *         description: List of cupValues
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CupValue'
 *       500:
 *         description: Internal server error
 */
export const getAllCupValues = asyncHandler(async (req, res) => {
    const cupValues = await getAllCupValuesService();
    if (!cupValues) {
        throw new AppError('CupValues not found', status.INTERNAL_SERVER_ERROR);
    }
    res.status(status.OK).json(cupValues);
});
/**
 * @swagger
 * /api/cupValues:
 *   post:
 *     tags:
 *       - CupValues
 *     summary: Create a new cupValue
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
 *                 example: "Small Value Label"
 *                 description: Label for the cup value (3-50 chars)
 *               value:
 *                 type: integer
 *                 example: 150
 *                 description: Value price, must be a positive integer
 *     responses:
 *       201:
 *         description: CupValue created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CupValue'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
export const createCupValue = asyncHandler(async (req, res) => {
    const { label, value } = req.body;
    if (!label || !value) {
        throw new AppError('Missing required fields - label and value', status.BAD_REQUEST);
    }
    const newCupValue = createCupValueService(label, value);
    if (!newCupValue) {
        throw new AppError('CupValue not created', status.INTERNAL_SERVER_ERROR);
    }
    res.status(status.CREATED).json(newCupValue);
});
/**
 * @swagger
 * /api/cupValues/{id}:
 *   put:
 *     tags:
 *       - CupValues
 *     summary: Update a cupValue by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the cupValue to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: integer
 *                 example: 180
 *               label:
 *                 type: string
 *                 example: "Updated value label"
 *     responses:
 *       200:
 *         description: CupValue updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "CupValue updated successfully"
 *                 updatedCupValue:
 *                   $ref: '#/components/schemas/CupValue'
 *       400:
 *         description: Invalid ID supplied
 *       404:
 *         description: CupValue not found
 *       500:
 *         description: Internal server error
 */
export const putCupValue = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const cupValueId = Number(id);
    if (isNaN(cupValueId)) {
        res.status(status.BAD_REQUEST).json({ message: 'Invalid CupValue ID' });
    }
    const { value, label } = req.body;
    if (!value && !label) {
        throw new AppError('Missing required fields - value and label', status.BAD_REQUEST);
    }
    const updatedCupValue = await putCupValueService(cupValueId, label, value);
    res
        .status(status.OK)
        .json({ message: 'CupValue updated successfully', updatedCupValue });
});
/**
 * @swagger
 * /api/cupValues/{id}:
 *   delete:
 *     tags:
 *       - CupValues
 *     summary: Soft delete a cupValue by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the cupValue to delete
 *     responses:
 *       200:
 *         description: CupValue soft deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "CupValue soft-deleted successfully"
 *                 deletedCupValue:
 *                   $ref: '#/components/schemas/CupValue'
 *       400:
 *         description: Invalid ID supplied
 *       404:
 *         description: CupValue not found
 *       500:
 *         description: Internal server error
 */
export const deleteCupValue = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const cupValueId = Number(id);
    if (isNaN(cupValueId)) {
        throw new AppError('Invalid CupValue ID', status.BAD_REQUEST);
    }
    const deletedCupValue = await deleteCupValueService(cupValueId);
    if (!deletedCupValue) {
        throw new AppError('CupValue not deleted', status.INTERNAL_SERVER_ERROR);
    }
    res.status(status.OK).json({
        message: 'CupValue soft-deleted successfully',
        deletedCupValue,
    });
});
//# sourceMappingURL=cupValue.controller.js.map