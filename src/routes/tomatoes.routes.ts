import { Router } from 'express';
import { checkSchema } from 'express-validator';

import {
  createTomatoOrder,
  createTomatoTransaction,
  deleteTomatoOrder,
  deleteTomatoTransaction,
  getAllTomatoCups,
  getAllTomatoOrders,
  getAllTomatoTransactions,
  getTomatoCupTotals,
  getTomatoOrderById,
  updateTomatoOrder,
  updateTomatoTransaction,
} from '../controllers/tomato.controller.js';
import {
  tomatoOrderSchema,
  tomatoTransactionSchema,
} from '../validationSchemas/tomatoSchema.js';
import { handleValidationErrors } from '../middlewares/handleValidationErrors.js';

const router = Router();

router.get('/cups', getAllTomatoCups);
router.get('/totals', getTomatoCupTotals);

router.post(
  '/transactions',
  checkSchema(tomatoTransactionSchema),
  handleValidationErrors,
  createTomatoTransaction
);
router.get('/transactions', getAllTomatoTransactions);
router.delete('/transactions/:id', deleteTomatoTransaction);
router.put(
  '/transactions/:id',
  checkSchema(tomatoTransactionSchema),
  handleValidationErrors,
  updateTomatoTransaction
);

router.get('/', getAllTomatoOrders);
router.get('/:id', getTomatoOrderById);

router.post(
  '/',
  checkSchema(tomatoOrderSchema),
  handleValidationErrors,
  createTomatoOrder
);

router.put(
  '/:id',
  checkSchema(tomatoOrderSchema),
  handleValidationErrors,
  updateTomatoOrder
);

router.delete('/:id', deleteTomatoOrder);

export default router;
