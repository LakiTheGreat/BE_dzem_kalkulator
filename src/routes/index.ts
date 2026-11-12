import { Router } from 'express';

import { mockAuth } from '../middlewares/auth/mockAuth.js';
import authRouter from '../v1/routes/auth.routes.js';
import constantsRouter from '../v1/routes/constant.routes.js';
import cupsRouter from '../v1/routes/cup.routes.js';
import cupCostRouter from '../v1/routes/cupCost.routes.js';
import cupValuesRouter from '../v1/routes/cupValue.routes.js';
import fruitsRouter from '../v1/routes/fruit.routes.js';
import inventoryRouter from '../v1/routes/inventory.routes.js';
import ordersRouter from '../v1/routes/order.routes.js';
import transactionRouter from '../v1/routes/transaction.routes.js';
import bouquetsRouter from '../v1/routes/bouquet.routes.js';
import tomatoesRouter from '../v1/routes/tomatoes.routes.js';
import fruitsV2Router from '../v2/routes/fruit.routes.js';
import cupsV2Router from '../v2/routes/cup.routes.js';
import cupCostsV2Router from '../v2/routes/cupCost.routes.js';
import cupValuesV2Router from '../v2/routes/cupValue.routes.js';
import constantsV2Router from '../v2/routes/constant.routes.js';
import tomatoesV2Router from '../v2/routes/tomato.routes.js';
import { mockAuth as mockAuthV2 } from '../v2/middlewares/mockAuth.js';

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

// v2 (refactored, runs next to v1)
router.use('/v2/fruits', mockAuthV2, fruitsV2Router);
router.use('/v2/cups', mockAuthV2, cupsV2Router);
router.use('/v2/cupCosts', mockAuthV2, cupCostsV2Router);
router.use('/v2/cupValues', mockAuthV2, cupValuesV2Router);
router.use('/v2/constants', mockAuthV2, constantsV2Router);
router.use('/v2/tomatoes', mockAuthV2, tomatoesV2Router);
export default router;
