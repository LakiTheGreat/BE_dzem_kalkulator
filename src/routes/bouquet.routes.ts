import { Router } from 'express';
import { checkSchema } from 'express-validator';

import {
  createBouquetTransaction,
  getAllBouquetTransactions,
  getBouquetTransactionById,
  updateBouquetTransaction,
} from '../controllers/bouquet.controller.js';
import { handleValidationErrors } from '../middlewares/handleValidationErrors.js';
import { bouquetTransactionSchema } from '../validationSchemas/bouquetSchema.js';

const router = Router();

router.get('/', getAllBouquetTransactions);
router.get('/:id', getBouquetTransactionById);

router.post(
  '/',
  checkSchema(bouquetTransactionSchema),
  handleValidationErrors,
  createBouquetTransaction
);

router.put(
  '/:id',
  checkSchema(bouquetTransactionSchema),
  handleValidationErrors,
  updateBouquetTransaction
);

// router.delete('/:id', updateTransaction);

export default router;
