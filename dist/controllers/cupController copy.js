import prisma from '../utils/db.js';
/**
 * @swagger
 * components:
 *   schemas:
 *     CupCost:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         value:
 *           type: integer
 *           example: 100
 *         label:
 *           type: string
 *           example: "Cost Label"
 *     CupValue:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 2
 *         value:
 *           type: integer
 *           example: 150
 *         label:
 *           type: string
 *           example: "Selling Price Label"
 *     Cup:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         label:
 *           type: string
 *           example: "212ml"
 *         isDeleted:
 *           type: boolean
 *           example: false
 *         cost:
 *           $ref: '#/components/schemas/CupCost'
 *         sellingPrice:
 *           $ref: '#/components/schemas/CupValue'
 *     CupCreateRequest:
 *       type: object
 *       required:
 *         - label
 *         - costId
 *         - valueId
 *       properties:
 *         label:
 *           type: string
 *           example: "Large Cup"
 *         costId:
 *           type: integer
 *           example: 1
 *         valueId:
 *           type: integer
 *           example: 2
 */
/**
 * @swagger
 * /api/cups:
 *   get:
 *     tags:
 *       - Cups
 *     summary: Get all non-deleted cups with simplified cost and selling price values
 *     responses:
 *       200:
 *         description: List of cups with simplified cost and selling price values
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cup'
 *             examples:
 *               simplified:
 *                 summary: Simplified cup response example
 *                 value:
 *                   - id: 1
 *                     label: "212ml"
 *                     isDeleted: false
 *                     cost: 100
 *                     sellingPrice: 150
 *                   - id: 2
 *                     label: "500ml"
 *                     isDeleted: false
 *                     cost: 120
 *                     sellingPrice: 180
 *       500:
 *         description: Internal server error
 */
export const getAllCups = async (req, res) => {
    try {
        const cups = await prisma.cup.findMany({
            where: {
                isDeleted: false,
            },
            orderBy: {
                label: 'asc',
            },
            include: {
                cost: true,
                sellingPrice: true,
            },
        });
        const simplifiedCups = cups.map((cup) => ({
            id: cup.id,
            label: cup.label,
            isDeleted: cup.isDeleted,
            cost: cup.cost?.value ?? null,
            sellingPrice: cup.sellingPrice?.value ?? null,
        }));
        res.status(200).json(simplifiedCups);
    }
    catch (e) {
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
 *             required:
 *               - label
 *               - costId
 *               - valueId
 *             properties:
 *               label:
 *                 type: string
 *                 description: The label/name of the cup
 *                 example: "Large Cup"
 *               costId:
 *                 type: integer
 *                 description: The ID of an existing CupCost
 *                 example: 1
 *               valueId:
 *                 type: integer
 *                 description: The ID of an existing CupValue (selling price)
 *                 example: 2
 *     responses:
 *       201:
 *         description: Cup created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cup'
 */
export const createNewCup = async (req, res) => {
    const { label, costId, valueId } = req.body;
    try {
        const cup = await prisma.cup.create({
            data: {
                label,
                cost: { connect: { id: costId } },
                sellingPrice: { connect: { id: valueId } },
            },
            include: {
                cost: true,
                sellingPrice: true,
            },
        });
        res.status(201).json(cup);
    }
    catch (error) {
        console.error('Create Cup Error:', error);
        if (error.code === 'P2025') {
            res.status(400).json({
                message: 'Invalid costId or valueId: related record not found',
            });
        }
        res.status(500).json({ message: 'Internal server error' });
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
 *               label:
 *                 type: string
 *                 example: "Large Cup"
 *               costId:
 *                 type: integer
 *                 example: 1
 *                 description: ID of existing CupCost
 *               valueId:
 *                 type: integer
 *                 example: 2
 *                 description: ID of existing CupValue (selling price)
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
 *                   example: "Cup updated successfully"
 *                 updatedCup:
 *                   $ref: '#/components/schemas/Cup'
 *
 */
export const putCup = async (req, res) => {
    const { id } = req.params;
    const cupId = Number(id);
    if (isNaN(cupId)) {
        res.status(400).json({ message: 'Invalid cup ID' });
    }
    const { label, costId, valueId } = req.body;
    try {
        const updatedCup = await prisma.cup.update({
            where: { id: cupId },
            data: {
                ...(label !== undefined && { label }),
                ...(costId !== undefined && { cost: { connect: { id: costId } } }),
                ...(valueId !== undefined && {
                    sellingPrice: { connect: { id: valueId } },
                }),
            },
            include: {
                cost: true,
                sellingPrice: true,
            },
        });
        res.status(200).json({ message: 'Cup updated successfully', updatedCup });
    }
    catch (e) {
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
export const deleteCupById = async (req, res) => {
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
    }
    catch (e) {
        console.error(e);
        if (e.code === 'P2025') {
            res.status(404).json({ message: 'Cup not found' });
        }
        res.status(500).json({ message: 'Something went wrong!' });
    }
};
//# sourceMappingURL=cupController%20copy.js.map