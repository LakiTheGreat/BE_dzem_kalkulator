import { Router } from 'express';
import fruitsRouter from './fruitRoutes.js';
const router = Router();
router.use('/fruits', fruitsRouter);
export default router;
//# sourceMappingURL=index.js.map