import { Prisma } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';

import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

export default function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (error instanceof AppError) {
    logger.error({
      name: error.name,
      message: error.message,
      stack: error.stack,
      customStatusCode: error.customStatusCode,
    });

    res.status(error.status).json({
      message: error.message,
      status: error.status,
      customStatusCode: error.customStatusCode || '',
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const status = error.code === 'P2025' ? 400 : 500;
    const message =
      error.code === 'P2025'
        ? error?.meta?.cause
        : error.message || 'Internal server error';
    const customStatusCode = error.code === 'P2025' ? 'PRISMA_P2025' : '';

    logger.error({
      name: error.name,
      message,
      stack: error.stack,
      code: error.code,
    });

    res.status(status).json({
      message,
      status,
      customStatusCode,
    });
    return;
  }

  if (error instanceof Error) {
    logger.error({
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      message: error.message,
      status: 500,
      customStatusCode: '',
    });
    return;
  }

  res.status(500).json({
    message: 'Internal server error',
    status: 500,
    customStatusCode: '',
  });
  return;
}
