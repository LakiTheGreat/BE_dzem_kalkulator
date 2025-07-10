import prisma from '../utils/db.js';
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
export const getAllCupValues = async (req, res) => {
    try {
        const cupValues = await prisma.cupValue.findMany({
            where: { isDeleted: false },
            orderBy: { value: 'asc' },
        });
        res.status(200).json(cupValues);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong!' });
    }
};
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
export const createCupValue = async (req, res) => {
    const { label, value } = req.body;
    try {
        const newCupValue = await prisma.cupValue.create({
            data: {
                label,
                value,
                isDeleted: false,
            },
        });
        res.status(201).json(newCupValue);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong!' });
    }
};
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
export const putCupValue = async (req, res) => {
    const { id } = req.params;
    const cupValueId = Number(id);
    if (isNaN(cupValueId)) {
        res.status(400).json({ message: 'Invalid CupValue ID' });
    }
    const { value, label } = req.body;
    try {
        const updatedCupValue = await prisma.cupValue.update({
            where: { id: cupValueId },
            data: {
                ...(value !== undefined && { value }),
                ...(label !== undefined && { label }),
            },
        });
        res
            .status(200)
            .json({ message: 'CupValue updated successfully', updatedCupValue });
    }
    catch (error) {
        console.error(error);
        if (error.code === 'P2025') {
            res.status(404).json({ message: 'CupValue not found' });
        }
        res.status(500).json({ message: 'Something went wrong!' });
    }
};
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
export const deleteCupValue = async (req, res) => {
    const { id } = req.params;
    const cupValueId = Number(id);
    if (isNaN(cupValueId)) {
        res.status(400).json({ message: 'Invalid CupValue ID' });
    }
    try {
        const deletedCupValue = await prisma.cupValue.update({
            where: { id: cupValueId },
            data: { isDeleted: true },
        });
        res
            .status(200)
            .json({ message: 'CupValue soft-deleted successfully', deletedCupValue });
    }
    catch (error) {
        console.error(error);
        if (error.code === 'P2025') {
            res.status(404).json({ message: 'CupValue not found' });
        }
        res.status(500).json({ message: 'Something went wrong!' });
    }
};
//# sourceMappingURL=cupValueController.js.map