import { Router } from 'express';

import lookupRouter from './lookups.mjs';

const router = Router();

router.use(lookupRouter);

export default router;
