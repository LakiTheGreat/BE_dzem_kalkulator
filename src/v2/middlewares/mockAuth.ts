import { NextFunction, Request, Response } from 'express';
import status from 'http-status';

import prisma from '../../utils/db.js';
import logger from '../../utils/logger.js';

// Same responses as v1 mockAuth, but stops after the 401 (v1 keeps going and
// tries to send a second response).
export const mockAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = Number(req.header('x-user-id'));
  if (!userId) {
    res.status(status.UNAUTHORIZED).json({ error: 'No user ID provided' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(status.NOT_FOUND).json({ error: 'User not found' });
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    logger.error({ message: 'v2 mockAuth failed', error });
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
  }
};
