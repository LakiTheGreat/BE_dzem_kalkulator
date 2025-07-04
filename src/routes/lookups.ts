import { Router } from 'express';

import { fruits } from '../mockData/index.js';
import logger from '../utils/logger.js';

const router = Router();

router.get('/fruits', (req, res) => {
  console.log('GET /fruits - POZVANO');
  logger.info('GET /fruits - POZVANO - WINSTON LOGER');
  res.status(200).json(fruits);
});

export default router;
