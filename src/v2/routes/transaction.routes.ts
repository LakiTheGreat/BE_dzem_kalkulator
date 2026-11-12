import { Router } from 'express';
import { checkSchema } from 'express-validator';

import { handleValidationErrors } from '../../middlewares/handleValidationErrors.js';
import {
  createTransaction,
  deleteTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
} from '../controllers/jam.controller.js';
import {
  transactionQuerySchema,
  transactionSchema,
} from '../validationSchemas/jamSchema.js';

const router = Router();

router.get(
  '/',
  checkSchema(transactionQuerySchema),
  handleValidationErrors,
  getAllTransactions
);
router.get('/:id', getTransactionById);
router.post(
  '/',
  checkSchema(transactionSchema),
  handleValidationErrors,
  createTransaction
);
router.put(
  '/:id',
  checkSchema(transactionSchema),
  handleValidationErrors,
  updateTransaction
);
router.delete('/:id', deleteTransaction);

export default router;
