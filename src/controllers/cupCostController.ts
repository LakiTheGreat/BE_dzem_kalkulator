import { Request, Response } from 'express';

import prisma from '../utils/db.js';

/**
 * @swagger
 * /api/cupCosts:
 *   get:
 *     tags:
 *       - CupCosts
 *     summary: Get all non-deleted cupCosts
 *     responses:
 *       200:
 *         description: List of cupCosts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CupCost'
 *       500:
 *         description: Internal server error
 */
export const getAllCupCosts = async (req: Request, res: Response) => {
  try {
    const cupCosts = await prisma.cupCost.findMany({
      where: { isDeleted: false },
      orderBy: { value: 'asc' },
    });
    res.status(200).json(cupCosts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong!' });
  }
};

/**
 * @swagger
 * /api/cupCosts:
 *   post:
 *     tags:
 *       - CupCosts
 *     summary: Create a new cupCost
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
 *                 example: "Small Cost Label"
 *                 description: Label for the cup cost (3-50 chars)
 *               value:
 *                 type: integer
 *                 example: 100
 *                 description: Cost value, must be a positive integer
 *     responses:
 *       201:
 *         description: CupCost created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CupCost'

 */

export const createCupCost = async (req: Request, res: Response) => {
  const { label, value } = req.body;

  try {
    const newCupCost = await prisma.cupCost.create({
      data: {
        label,
        value,
        isDeleted: false,
      },
    });

    res.status(201).json(newCupCost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong!' });
  }
};

/**
 * @swagger
 * /api/cupCosts/{id}:
 *   put:
 *     tags:
 *       - CupCosts
 *     summary: Update a cupCost by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the cupCost to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: integer
 *                 example: 120
 *               label:
 *                 type: string
 *                 example: "Updated cost label"
 *     responses:
 *       200:
 *         description: CupCost updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "CupCost updated successfully"
 *                 updatedCupCost:
 *                   $ref: '#/components/schemas/CupCost'
 *       400:
 *         description: Invalid ID supplied
 *       404:
 *         description: CupCost not found
 *       500:
 *         description: Internal server error
 */
export const putCupCost = async (req: Request, res: Response) => {
  const { id } = req.params;
  const cupCostId = Number(id);

  if (isNaN(cupCostId)) {
    res.status(400).json({ message: 'Invalid CupCost ID' });
  }

  const { value, label } = req.body;

  try {
    const updatedCupCost = await prisma.cupCost.update({
      where: { id: cupCostId },
      data: {
        ...(value !== undefined && { value }),
        ...(label !== undefined && { label }),
      },
    });

    res
      .status(200)
      .json({ message: 'CupCost updated successfully', updatedCupCost });
  } catch (error: any) {
    console.error(error);

    if (error.code === 'P2025') {
      res.status(404).json({ message: 'CupCost not found' });
    }

    res.status(500).json({ message: 'Something went wrong!' });
  }
};

/**
 * @swagger
 * /api/cupCosts/{id}:
 *   delete:
 *     tags:
 *       - CupCosts
 *     summary: Soft delete a cupCost by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the cupCost to delete
 *     responses:
 *       200:
 *         description: CupCost soft deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "CupCost soft-deleted successfully"
 *                 deletedCupCost:
 *                   $ref: '#/components/schemas/CupCost'
 *       400:
 *         description: Invalid ID supplied
 *       404:
 *         description: CupCost not found
 *       500:
 *         description: Internal server error
 */
export const deleteCupCost = async (req: Request, res: Response) => {
  const { id } = req.params;
  const cupCostId = Number(id);

  if (isNaN(cupCostId)) {
    res.status(400).json({ message: 'Invalid CupCost ID' });
  }

  try {
    const deletedCupCost = await prisma.cupCost.update({
      where: { id: cupCostId },
      data: { isDeleted: true },
    });

    res
      .status(200)
      .json({ message: 'CupCost soft-deleted successfully', deletedCupCost });
  } catch (error: any) {
    console.error(error);

    if (error.code === 'P2025') {
      res.status(404).json({ message: 'CupCost not found' });
    }

    res.status(500).json({ message: 'Something went wrong!' });
  }
};
