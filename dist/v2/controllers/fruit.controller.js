import status from 'http-status';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { getAllFruitsService } from '../services/fruit.service.js';
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