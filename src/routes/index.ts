import { Router } from 'express';

import fruitsRouter from './fruit.routes.js';
import cupsRouter from './cup.routes.js';
import cupCostRouter from './cupCost.routes.js';
import cupValuesRouter from './cupValue.routes.js';
import constantsRouter from './constant.routes.js';
import ordersRouter from './order.routes.js';

const router = Router();

router.use('/fruits', fruitsRouter);
router.use('/cups', cupsRouter);
router.use('/cupCosts', cupCostRouter);
router.use('/cupValues', cupValuesRouter);
router.use('/constants', constantsRouter);
router.use('/orders', ordersRouter);

export default router;
