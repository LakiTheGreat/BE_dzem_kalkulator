import { Request, Response } from 'express';

import prisma from '../utils/db.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Cup:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         value:
 *           type: integer
 *         menuItemLabel:
 *           type: string
 *         isDeleted:
 *           type: boolean
 *           default: false
 */

/**
 * @swagger
 * /api/cups:
 *   get:
 *     tags:
 *       - Cups
 *     summary: Get all non-deleted cups
 *     responses:
 *       200:
 *         description: List of cups
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cup'
 */

export const getAllCups = async (req: Request, res: Response) => {
  try {
    const cups = await prisma.cup.findMany({
      where: {
        isDeleted: false,
      },
      orderBy: {
        menuItemLabel: 'asc',
      },
    });
    res.status(200).json(cups);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Something went wrong!!!!' });
  }
};

/**
 * @swagger
 * /api/cups:
 *   post:
 *     tags:
 *       - Cups
 *     summary: Create a new cup
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: integer
 *               menuItemLabel:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cup created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cup'
 */

export const createNewCup = async (req: Request, res: Response) => {
  try {
    const cup = await prisma.cup.create({ data: req.body });
    res.status(201).json(cup);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Something went wrong!!!!' });
  }
};

/**
 * @swagger
 * /api/cups/{id}:
 *   put:
 *     summary: Update an existing cup
 *     tags: [Cups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the cup to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: integer
 *               menuItemLabel:
 *                 type: string
 *             required:
 *               - value
 *               - menuItemLabel
 *     responses:
 *       200:
 *         description: Cup updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 updatedCup:
 *                   $ref: '#/components/schemas/Cup'
 *
 */
export const putCup = async (req: Request, res: Response) => {
  const { id } = req.params;
  const cupId = Number(id);

  if (isNaN(cupId)) {
    res.status(400).json({ message: 'Invalid cup ID' });
  }

  try {
    const updatedCup = await prisma.cup.update({
      where: { id: cupId },
      data: req.body,
    });

    res.status(200).json({ message: 'Cup updated successfully', updatedCup });
  } catch (e: any) {
    console.error(e);

    if (e.code === 'P2025') {
      res.status(404).json({ message: 'Cup not found' });
    }

    res.status(500).json({ message: 'Something went wrong!' });
  }
};

/**
 * @swagger
 * /api/cups/{id}:
 *   delete:
 *     tags:
 *       - Cups
 *     summary: Soft delete a cup by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the cup to delete
 *     responses:
 *       200:
 *         description: Cup marked as deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cup'
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Cup not found
 */

export const deleteCupById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const cupId = Number(id);
  if (isNaN(cupId)) {
    res.status(400).json({ message: 'Invalid cup ID' });
  }

  try {
    const cup = await prisma.cup.update({
      where: { id: cupId },
      data: { isDeleted: true },
    });

    res.status(200).json({ message: 'Cup marked as deleted', cup });
  } catch (e: any) {
    console.error(e);

    if (e.code === 'P2025') {
      res.status(404).json({ message: 'Cup not found' });
    }

    res.status(500).json({ message: 'Something went wrong!' });
  }
};
