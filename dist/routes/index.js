import { Router } from 'express';
import lookupRouter from './lookups.js';
const router = Router();
router.use('/api/lookup', lookupRouter);
export default router;
