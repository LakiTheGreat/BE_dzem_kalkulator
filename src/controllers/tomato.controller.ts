import { Request, Response } from 'express';
import status from 'http-status';

import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  createBouquetTransactionService,
  getAllBouquetTransactionsService,
  getBouquetTransactionByIdService,
  updateBouquetTransactionService,
} from '../services/bouquet.service.js';

import AppError from '../utils/AppError.js';
import { getAllTomatoCupsService } from '../services/tomato.service.js';

export const getAllTomatoCups = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = Number(req.header('x-user-id'));

    const transactionStatus =
      req.query.transactionStatus !== undefined
        ? String(req.query.transactionStatus)
        : undefined;

    const whereClause: any = { isDeleted: false, userId };

    const tomatoCups = await getAllTomatoCupsService(whereClause);

    res.status(status.OK).json(tomatoCups);
  }
);
