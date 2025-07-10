import { Router } from 'express';
import fruitsRouter from './fruitRoutes.js';
import cupsRouter from './cupRoutes.js';
import cupCostRouter from './cupCostRoutes.js';
import cupValuesRouter from './cupValueRoutes.js';
const router = Router();
router.use('/fruits', fruitsRouter);
router.use('/cups', cupsRouter);
router.use('/cupCosts', cupCostRouter);
router.use('/cupValues', cupValuesRouter);
export default router;
//# sourceMappingURL=index.js.map