import { Router } from 'express';

import fruitsRouter from './fruitRoutes.js';
import cupsRouter from './cupRoutes.js';
import cupCostRouter from './cupCostRoutes.js';
import cupValuesRouter from './cupValueRoutes.js';
import constantsRouter from './constantRoutes.js';
import ordersRouter from './orderRoutes.js';

const router = Router();

router.use('/fruits', fruitsRouter);
router.use('/cups', cupsRouter);
router.use('/cupCosts', cupCostRouter);
router.use('/cupValues', cupValuesRouter);
router.use('/constants', constantsRouter);
router.use('/orders', ordersRouter);

export default router;
