import status from 'http-status';
import prisma from '../utils/db.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import AppError from '../utils/AppError.js';
/**
 * @swagger
 * /api/constants/{id}:
 *   get:
 *     tags:
 *       - Config Constants
 *     summary: Get a Config Constant by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the config constant to retrieve
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A config constant object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 value:
 *                   type: integer
 *                 label:
 *                   type: string
 *                 isDeleted:
 *                   type: boolean
 */
export const getConstantById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const constant = await prisma.configConstant.findUnique({
        where: {
            id: Number(id),
        },
    });
    if (!constant) {
        throw new AppError('Constant not found', status.NOT_FOUND);
    }
    res.status(200).json(constant);
});
/**
 * @swagger
 * /api/constants/{id}:
 *   patch:
 *     tags:
 *       - Config Constants
 *     summary: Update a Config Constant by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the config constant to update
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: integer
 *               label:
 *                 type: string
 *               isDeleted:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: The updated config constant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 value:
 *                   type: integer
 *                 label:
 *                   type: string
 *                 isDeleted:
 *                   type: boolean
 */
export const patchConstantById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { value, label, isDeleted } = req.body;
    const existing = await prisma.configConstant.findUnique({
        where: { id: Number(id) },
    });
    if (!existing) {
        throw new AppError('Constant not found', status.NOT_FOUND);
    }
    const updated = await prisma.configConstant.update({
        where: { id: Number(id) },
        data: {
            ...(value !== undefined && { value }),
            ...(label !== undefined && { label }),
            ...(isDeleted !== undefined && { isDeleted }),
        },
    });
    if (!updated) {
        throw new AppError('Constant was not updated', status.INTERNAL_SERVER_ERROR);
    }
    res.status(200).json(updated);
});
//# sourceMappingURL=constants.controller.js.map