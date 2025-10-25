import { Request, Response } from 'express';
import status from 'http-status';

import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  createTomatoOrderService,
  deleteTomatoOrderService,
  getAllTomatoCupsService,
  getAllTomatoOrdersService,
  getTomatoCupTotalsService,
  getTomatoOrderByIdService,
  updateTomatoOrderService,
} from '../services/tomato.service.js';
import AppError from '../utils/AppError.js';

export const getTomatoOrderById = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = Number(req.header('x-user-id'));
    const id = Number(req.params.id);

    if (isNaN(id)) {
      throw new AppError('Invalid ID', status.BAD_REQUEST);
    }

    const tomatoTransaction = await getTomatoOrderByIdService(id, userId);

    if (!tomatoTransaction) {
      throw new AppError('TomatoTransaction not found', status.NOT_FOUND);
    }

    res.status(status.OK).json(tomatoTransaction);
  }
);

export const getAllTomatoCups = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = Number(req.header('x-user-id'));

    const whereClause: any = { isDeleted: false, userId };

    const tomatoCups = await getAllTomatoCupsService(whereClause);

    res.status(status.OK).json(tomatoCups);
  }
);

export const createTomatoOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const { cupTypeId, totalExpenses, numOfCups } = req.body;
    const userId = Number(req.header('x-user-id'));

    const tomatoOrder = await createTomatoOrderService({
      cupType: cupTypeId,
      totalExpenses,
      numOfCups,
      userId,
    });

    if (!tomatoOrder) {
      throw new AppError(
        'Tomato order was not created found',
        status.BAD_REQUEST
      );
    }

    res.status(status.OK).json(tomatoOrder);
  }
);

export const getAllTomatoOrders = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = Number(req.header('x-user-id'));

    const whereClause: any = { isDeleted: false, userId };

    const tomatoOrders = await getAllTomatoOrdersService(whereClause);

    res.status(status.OK).json(tomatoOrders);
  }
);

export const updateTomatoOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const userId = Number(req.header('x-user-id'));

    if (isNaN(id)) {
      throw new AppError('Invalid ID', status.BAD_REQUEST);
    }

    const { numOfCups, totalExpense } = req.body;

    const updatedOrder = await updateTomatoOrderService(
      id,
      {
        numOfCups,
        totalExpense,
      },
      userId
    );

    if (!updatedOrder) {
      throw new AppError('TomatoOrder not found', status.NOT_FOUND);
    }

    res.status(status.OK).json(updatedOrder);
  }
);

export const deleteTomatoOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const userId = Number(req.header('x-user-id'));

    if (isNaN(id)) {
      throw new AppError('Invalid ID', status.BAD_REQUEST);
    }

    const deletedOrder = await deleteTomatoOrderService(id, userId);

    if (!deletedOrder) {
      throw new AppError('TomatoOrder not found', status.NOT_FOUND);
    }

    res.status(status.OK).json(deletedOrder);
  }
);

export const getTomatoCupTotals = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = Number(req.header('x-user-id'));

    if (!userId || isNaN(userId)) {
      return res
        .status(status.BAD_REQUEST)
        .json({ message: 'Invalid or missing user ID' });
    }

    const year = req.query.year ? Number(req.query.year) : undefined;
    const month = req.query.month ? Number(req.query.month) : undefined;

    const whereClause: any = { isDeleted: false, userId };

    // Optional date filtering (if you want to include it)
    if (year || month) {
      const startDate = new Date(
        year ?? new Date().getFullYear(),
        month ? month - 1 : 0,
        1
      );

      const endDate = new Date(
        year ?? new Date().getFullYear(),
        month ? month : 12,
        0,
        23,
        59,
        59
      );

      whereClause.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    const totals = await getTomatoCupTotalsService(userId, whereClause);

    res.status(status.OK).json(totals);
  }
);
