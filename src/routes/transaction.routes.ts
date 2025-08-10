import { Router } from 'express';
import { checkSchema } from 'express-validator';

import {
  createTransaction,
  getTransactions,
} from '../controllers/transaction.controller.js';
import { handleValidationErrors } from '../middlewares/handleValidationErrors.js';
import { transactionSchema } from '../validationSchemas/transactionSchema.js';

const router = Router();

router.get('/', getTransactions);

router.post(
  '/',
  checkSchema(transactionSchema),
  handleValidationErrors,
  createTransaction
);

export default router;
