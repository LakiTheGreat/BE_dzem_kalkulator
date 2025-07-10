import { Router } from 'express';

import fruitsRouter from './fruitRoutes.js';
import cupsRouter from './cupRoutes.js';

const router = Router();

router.use('/fruits', fruitsRouter);
router.use('/cups', cupsRouter);

export default router;
