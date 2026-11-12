import { TransactionStatus } from '@prisma/client';
import { Request, Response } from 'express';
import status from 'http-status';

import { asyncHandler } from '../../middlewares/asyncHandler.js';
import AppError from '../../utils/AppError.js';
import {
  createOrderService,
  deleteOrderService,
  getAllOrdersService,
  getOrderByIdService,
  updateOrderService,
} from '../services/order.service.js';
import {
  createTransactionService,
  deleteTransactionService,
  getAllTransactionsService,
  getTransactionByIdService,
  updateTransactionService,
} from '../services/transaction.service.js';
import {
  createCorrectionsService,
  getInventoryGroupedService,
  getInventoryOverviewService,
} from '../services/jamStock.service.js';

const parseId = (req: Request) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    throw new AppError('Neispravan ID', status.BAD_REQUEST);
  }

  return id;
};

// Express 5 exposes req.query as a getter, so the validator's toInt() does not change it.
const queryInt = (value: unknown) =>
  value === undefined || value === '' ? undefined : Number(value);

const ORDER_NOT_FOUND = 'Serija nije pronađena';
const TRANSACTION_NOT_FOUND = 'Transakcija nije pronađena';

/**
 * @swagger
 * /api/v2/orders:
 *   get:
 *     tags: [Orders v2]
 *     summary: List non-deleted orders with totals (filters orderTypeId, priceStatus 1=free base fruit 2=paid, year, month)
 *     responses:
 *       200:
 *         description: "{ orders, totalValue, totalExpense, totalProfit, totalCups }"
 */
export const getAllOrders = asyncHandler(async (req: Request, res: Response) => {
  res.status(status.OK).json(
    await getAllOrdersService(req.user.id, {
      orderTypeId: queryInt(req.query.orderTypeId),
      priceStatus: queryInt(req.query.priceStatus),
      year: queryInt(req.query.year),
      month: queryInt(req.query.month),
    })
  );
});

/**
 * @swagger
 * /api/v2/orders/{id}:
 *   get:
 *     tags: [Orders v2]
 *     summary: Get one non-deleted order
 *     responses:
 *       200:
 *         description: The order with its fruit type
 *       404:
 *         description: Not found
 */
export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const order = await getOrderByIdService(parseId(req), req.user.id);

  if (!order) throw new AppError(ORDER_NOT_FOUND, status.NOT_FOUND);

  res.status(status.OK).json(order);
});

/**
 * @swagger
 * /api/v2/orders:
 *   post:
 *     tags: [Orders v2]
 *     summary: Create an order (adds jars to the stock)
 *     responses:
 *       201:
 *         description: The created order
 *       404:
 *         description: Fruit or cup not found
 */
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  res
    .status(status.CREATED)
    .json(await createOrderService(req.body, req.user.id));
});

/**
 * @swagger
 * /api/v2/orders/{id}:
 *   put:
 *     tags: [Orders v2]
 *     summary: Update an order; otherExpensesMargin from the body is ignored (kept as created)
 *     responses:
 *       200:
 *         description: The updated order
 *       400:
 *         description: Not enough jars in stock
 *       404:
 *         description: Not found
 */
export const updateOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await updateOrderService(parseId(req), req.body, req.user.id);

  if (!order) throw new AppError(ORDER_NOT_FOUND, status.NOT_FOUND);

  res.status(status.OK).json(order);
});

/**
 * @swagger
 * /api/v2/orders/{id}:
 *   delete:
 *     tags: [Orders v2]
 *     summary: Soft delete an order (rejected if it would make stock negative)
 *     responses:
 *       200:
 *         description: Deleted
 *       400:
 *         description: Not enough jars in stock
 *       404:
 *         description: Not found
 */
export const deleteOrder = asyncHandler(async (req: Request, res: Response) => {
  if (!(await deleteOrderService(parseId(req), req.user.id))) {
    throw new AppError(ORDER_NOT_FOUND, status.NOT_FOUND);
  }

  res.status(status.OK).json({ message: 'Serija je obrisana' });
});

/**
 * @swagger
 * /api/v2/transactions:
 *   get:
 *     tags: [Transactions v2]
 *     summary: List non-deleted transactions (filters orderTypeId, transactionStatus, year, month)
 *     responses:
 *       200:
 *         description: Array of transactions with positive cup quantities and labels
 */
export const getAllTransactions = asyncHandler(
  async (req: Request, res: Response) => {
    res.status(status.OK).json(
      await getAllTransactionsService(req.user.id, {
        orderTypeId: queryInt(req.query.orderTypeId),
        status: req.query.transactionStatus as TransactionStatus | undefined,
        year: queryInt(req.query.year),
        month: queryInt(req.query.month),
      })
    );
  }
);

/**
 * @swagger
 * /api/v2/transactions/{id}:
 *   get:
 *     tags: [Transactions v2]
 *     summary: Get one non-deleted transaction (raw, negative quantities)
 *     responses:
 *       200:
 *         description: The transaction
 *       404:
 *         description: Not found
 */
export const getTransactionById = asyncHandler(
  async (req: Request, res: Response) => {
    const transaction = await getTransactionByIdService(
      parseId(req),
      req.user.id
    );

    if (!transaction) {
      throw new AppError(TRANSACTION_NOT_FOUND, status.NOT_FOUND);
    }

    res.status(status.OK).json(transaction);
  }
);

/**
 * @swagger
 * /api/v2/transactions:
 *   post:
 *     tags: [Transactions v2]
 *     summary: Create a transaction (always takes jars out of the stock)
 *     responses:
 *       201:
 *         description: The created transaction
 *       400:
 *         description: Not enough jars in stock
 */
export const createTransaction = asyncHandler(
  async (req: Request, res: Response) => {
    res
      .status(status.CREATED)
      .json(await createTransactionService(req.body, req.user.id));
  }
);

/**
 * @swagger
 * /api/v2/transactions/{id}:
 *   put:
 *     tags: [Transactions v2]
 *     summary: Update a transaction (stock of old and new fruit is recalculated)
 *     responses:
 *       200:
 *         description: The updated transaction
 *       400:
 *         description: Not enough jars in stock
 *       404:
 *         description: Not found
 */
export const updateTransaction = asyncHandler(
  async (req: Request, res: Response) => {
    const transaction = await updateTransactionService(
      parseId(req),
      req.body,
      req.user.id
    );

    if (!transaction) {
      throw new AppError(TRANSACTION_NOT_FOUND, status.NOT_FOUND);
    }

    res.status(status.OK).json(transaction);
  }
);

/**
 * @swagger
 * /api/v2/transactions/{id}:
 *   delete:
 *     tags: [Transactions v2]
 *     summary: Soft delete a transaction (jars return to the stock)
 *     responses:
 *       200:
 *         description: Deleted
 *       404:
 *         description: Not found
 */
export const deleteTransaction = asyncHandler(
  async (req: Request, res: Response) => {
    if (!(await deleteTransactionService(parseId(req), req.user.id))) {
      throw new AppError(TRANSACTION_NOT_FOUND, status.NOT_FOUND);
    }

    res.status(status.OK).json({ message: 'Transakcija je obrisana' });
  }
);

/**
 * @swagger
 * /api/v2/inventory:
 *   get:
 *     tags: [Inventory v2]
 *     summary: Derived stock grouped by fruit and cup
 *     responses:
 *       200:
 *         description: "[{ orderTypeId, label, cups: [{ cupId, label, numberOf }] }]"
 *       404:
 *         description: No stock data
 */
export const getInventory = asyncHandler(async (req: Request, res: Response) => {
  const inventory = await getInventoryGroupedService(req.user.id);

  if (inventory.length === 0) {
    throw new AppError('Inventar nije pronađen', status.NOT_FOUND);
  }

  res.status(status.OK).json(inventory);
});

/**
 * @swagger
 * /api/v2/inventory/overview:
 *   get:
 *     tags: [Inventory v2]
 *     summary: Total jars per cup across all fruits
 *     responses:
 *       200:
 *         description: "[{ label, numberOf }]"
 */
export const getInventoryOverview = asyncHandler(
  async (req: Request, res: Response) => {
    res
      .status(status.OK)
      .json(await getInventoryOverviewService(req.user.id));
  }
);

/**
 * @swagger
 * /api/v2/inventory/input:
 *   post:
 *     tags: [Inventory v2]
 *     summary: Manual stock correction (positive adds, negative removes); rejected if stock would go below 0
 *     responses:
 *       201:
 *         description: The created corrections
 *       400:
 *         description: Not enough jars in stock
 */
export const inputInventory = asyncHandler(
  async (req: Request, res: Response) => {
    res
      .status(status.CREATED)
      .json(await createCorrectionsService(req.body, req.user.id));
  }
);
