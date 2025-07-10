import { Request, Response } from 'express';

import prisma from '../utils/db.js';

export const createNewFruit = async (req: Request, res: Response) => {
  try {
    const fruit = await prisma.fruits.create({ data: req.body });
    res.status(201).json(fruit);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Something went wrong!!!!' });
  }
};

export const getAllFruits = async (req: Request, res: Response) => {
  try {
    const fruits = await prisma.fruits.findMany({
      where: {
        isDeleted: false,
      },
      orderBy: {
        menuItemLabel: 'asc',
      },
    });
    res.status(200).json(fruits);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Something went wrong!!!!' });
  }
};

export const deleteFruitById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const fruitId = Number(id);
  if (isNaN(fruitId)) {
    res.status(400).json({ message: 'Invalid fruit ID' });
  }

  try {
    const fruit = await prisma.fruits.update({
      where: { id: fruitId },
      data: { isDeleted: true },
    });

    res.status(200).json({ message: 'Fruit marked as deleted', fruit });
  } catch (e: any) {
    console.error(e);

    if (e.code === 'P2025') {
      res.status(404).json({ message: 'Fruit not found' });
    }

    res.status(500).json({ message: 'Something went wrong!' });
  }
};

export const patchFruitLabel = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { label } = req.body;

  const fruitId = Number(id);
  if (isNaN(fruitId)) {
    res.status(400).json({ message: 'Invalid fruit ID' });
  }

  try {
    const updatedFruit = await prisma.fruits.update({
      where: { id: fruitId },
      data: {
        menuItemLabel: label,
        value: label,
      },
    });

    res.status(200).json(updatedFruit);
  } catch (e: any) {
    console.error(e);
    if (e.code === 'P2025') {
      res.status(404).json({ message: 'Fruit not found' });
    }

    res.status(500).json({ message: 'Something went wrong!' });
  }
};

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
 */

/**
 * @swagger
 * /api/fruits:
 *   get:
 *     tags:
 *       - Fruits
 *     summary: Get all fruits that are not deleted
 *     responses:
 *       200:
 *         description: List of fruits
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Fruit'
 */

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
 *               - value
 *               - menuItemLabel
 *             properties:
 *               value:
 *                 type: string
 *                 example: "Apple"
 *               menuItemLabel:
 *                 type: string
 *                 example: "Red Apple"
 *     responses:
 *       201:
 *         description: The created fruit object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Fruit'
 */

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

/**
 * @swagger
 * /api/fruits/{id}:
 *   delete:
 *     tags:
 *       - Fruits
 *     summary: SOFT Delete a fruit by ID
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
