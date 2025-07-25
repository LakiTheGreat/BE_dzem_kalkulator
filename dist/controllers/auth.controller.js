import status from 'http-status';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import AppError from '../utils/AppError.js';
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user with a password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 example: "password"
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: integer
 *                   example: 12345
 *       400:
 *         description: Missing password
 *       401:
 *         description: Invalid password
 */
export const login = asyncHandler(async (req, res) => {
    const { password } = req.body;
    if (!password) {
        throw new AppError('Password is required', status.BAD_REQUEST);
    }
    const trimmedPassword = password.trim();
    if (trimmedPassword === '12397') {
        return res.status(status.OK).json({ userId: 12397 });
    }
    throw new AppError('Invalid password', status.UNAUTHORIZED);
});
//# sourceMappingURL=auth.controller.js.map