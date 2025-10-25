import { Router } from 'express';
import { checkSchema } from 'express-validator';

import { getAllBouquetTransactions } from '../controllers/bouquet.controller.js';

const router = Router();

router.get('/', getAllBouquetTransactions);

export default router;
