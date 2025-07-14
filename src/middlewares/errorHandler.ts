import { Request, Response, NextFunction } from 'express';

import AppError from '../utils/AppError.js';

export default function errorHandler(
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const status = error.status || 500;
  const message = error.message || 'Internal server error';

  res.status(status).json({
    message,
    status: error.status,
    customStatusCode: error.customStatusCode || '',
  });
}
