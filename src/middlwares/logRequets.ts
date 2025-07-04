import { Request, Response, NextFunction } from 'express';

import logger from '../utils/logger.js';

export default function logRequests(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log('Middlwere run');
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });
  console.log('Middlwere before next');
  next();
}
