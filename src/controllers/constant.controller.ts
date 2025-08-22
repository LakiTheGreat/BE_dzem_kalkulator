import { Request, Response } from 'express';
import status from 'http-status';

import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  getConstantByIdService,
  patchConstantService,
} from '../services/constant.service.js';
import AppError from '../utils/AppError.js';

/**
 * @swagger
 * /api/constants/{id}:
 *   get:
 *     tags:
 *       - Config Constants
 *     summary: Get a Config Constant by ID
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID associated with the request
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
 *                 description:
 *                   type: string
 *                 isDeleted:
 *                   type: boolean
 */
export const getConstantById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = Number(req.header('x-user-id'));

    const constant = await getConstantByIdService(Number(id), userId);

    if (!constant) {
      throw new AppError('Constant not found', status.NOT_FOUND);
    }

    res.status(status.OK).json(constant);
  }
);

/**
 * @swagger
 * /api/constants/{id}:
 *   patch:
 *     tags:
 *       - Config Constants
 *     summary: Update a Config Constant by ID
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID associated with the request
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
 *               description:
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
 *                 description:
 *                   type: string
 *                 isDeleted:
 *                   type: boolean
 */

export const patchConstantById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { value, label, isDeleted, status } = req.body;
    const userId = Number(req.header('x-user-id'));

    const existing = await getConstantByIdService(Number(id), userId);

    if (!existing) {
      throw new AppError('Constant not found', status.NOT_FOUND);
    }

    const updated = await patchConstantService(
      Number(id),
      value,
      label,
      isDeleted,
      userId
    );

    if (!updated) {
      throw new AppError(
        'Constant was not updated',
        status.INTERNAL_SERVER_ERROR
      );
    }

    res.status(status.OK).json(updated);
  }
);
