import { Request, Response } from 'express';
import status from 'http-status';

import { asyncHandler } from '../../middlewares/asyncHandler.js';
import AppError from '../../utils/AppError.js';
import {
  getConstantByIdService,
  patchConstantService,
} from '../services/constant.service.js';

const parseId = (req: Request) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    throw new AppError('Neispravan ID konstante', status.BAD_REQUEST);
  }

  return id;
};

/**
 * @swagger
 * /api/v2/constants/{id}:
 *   get:
 *     tags:
 *       - Constants v2
 *     summary: Get a config constant of the user by ID
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: "{ id, value, label, description, isDeleted, userId }"
 *       400:
 *         description: Invalid id
 *       404:
 *         description: Constant not found (missing, deleted or another user's)
 */
export const getConstantById = asyncHandler(
  async (req: Request, res: Response) => {
    const constant = await getConstantByIdService(parseId(req), req.user.id);

    if (!constant) {
      throw new AppError('Konstanta nije pronađena', status.NOT_FOUND);
    }

    res.status(status.OK).json(constant);
  }
);

/**
 * @swagger
 * /api/v2/constants/{id}:
 *   patch:
 *     tags:
 *       - Constants v2
 *     summary: Update value and label of a config constant
 *     parameters:
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [value, label]
 *             properties:
 *               value:
 *                 type: integer
 *                 minimum: 1
 *               label:
 *                 type: string
 *     responses:
 *       200:
 *         description: The updated constant
 *       400:
 *         description: Invalid id or body
 *       404:
 *         description: Constant not found (missing, deleted or another user's)
 */
export const patchConstantById = asyncHandler(
  async (req: Request, res: Response) => {
    const { value, label } = req.body;

    const updated = await patchConstantService(
      parseId(req),
      value,
      label,
      req.user.id
    );

    if (!updated) {
      throw new AppError('Konstanta nije pronađena', status.NOT_FOUND);
    }

    res.status(status.OK).json(updated);
  }
);
