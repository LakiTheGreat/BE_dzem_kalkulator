import { Router } from 'express';

import { mockAuth } from '../middlewares/auth/mockAuth.js';
import authRouter from './auth.routes.js';
import constantsRouter from './constant.routes.js';
import cupsRouter from './cup.routes.js';
import cupCostRouter from './cupCost.routes.js';
import cupValuesRouter from './cupValue.routes.js';
import fruitsRouter from './fruit.routes.js';
import inventoryRouter from './inventory.routes.js';
import ordersRouter from './order.routes.js';
import transactionRouter from './transaction.routes.js';
import bouquetsRouter from './bouquet.routes.js';
import tomatoesRouter from './tomatoes.routes.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/fruits', mockAuth, fruitsRouter);
router.use('/cups', mockAuth, cupsRouter);
router.use('/cupCosts', mockAuth, cupCostRouter);
router.use('/cupValues', mockAuth, cupValuesRouter);
router.use('/constants', mockAuth, constantsRouter);
router.use('/orders', mockAuth, ordersRouter);
router.use('/inventory', mockAuth, inventoryRouter);
router.use('/transactions', mockAuth, transactionRouter);
router.use('/bouquets', mockAuth, bouquetsRouter);
router.use('/tomatoes', mockAuth, tomatoesRouter);

export default router;
