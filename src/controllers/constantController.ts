import { Request, Response } from 'express';

import prisma from '../utils/db.js';

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
export const getConstantById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const constant = await prisma.configConstant.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!constant) {
      res.status(404).json({ message: 'Constant not found' });
    }

    res.status(200).json(constant);
  } catch (error) {
    console.error('Error fetching constant by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

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

export const patchConstantById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { value, label, isDeleted } = req.body;

  try {
    const existing = await prisma.configConstant.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      res.status(404).json({ message: 'Constant not found' });
    }

    const updated = await prisma.configConstant.update({
      where: { id: Number(id) },
      data: {
        ...(value !== undefined && { value }),
        ...(label !== undefined && { label }),
        ...(isDeleted !== undefined && { isDeleted }),
      },
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating constant:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
