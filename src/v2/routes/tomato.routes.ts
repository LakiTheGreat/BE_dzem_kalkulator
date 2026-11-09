import { Router } from 'express';
import { checkSchema } from 'express-validator';

import { handleValidationErrors } from '../../middlewares/handleValidationErrors.js';
import {
  createTomatoOrder,
  createTomatoTransaction,
  deleteTomatoOrder,
  deleteTomatoTransaction,
  getAllTomatoCups,
  getAllTomatoOrders,
  getAllTomatoTransactions,
  getTomatoOrderById,
  getTomatoTotals,
  getTomatoTransactionById,
  updateTomatoOrder,
  updateTomatoTransaction,
} from '../controllers/tomato.controller.js';
import {
  tomatoOrderQuerySchema,
  tomatoOrderSchema,
  tomatoTransactionQuerySchema,
  tomatoTransactionSchema,
} from '../validationSchemas/tomatoSchema.js';

const router = Router();

router.get('/cups', getAllTomatoCups);
router.get('/totals', getTomatoTotals);

router.get(
  '/transactions',
  checkSchema(tomatoTransactionQuerySchema),
  handleValidationErrors,
  getAllTomatoTransactions
);
router.post(
  '/transactions',
  checkSchema(tomatoTransactionSchema),
  handleValidationErrors,
  createTomatoTransaction
);
router.get('/transactions/:id', getTomatoTransactionById);
router.put(
  '/transactions/:id',
  checkSchema(tomatoTransactionSchema),
  handleValidationErrors,
  updateTomatoTransaction
);
router.delete('/transactions/:id', deleteTomatoTransaction);

router.get(
  '/',
  checkSchema(tomatoOrderQuerySchema),
  handleValidationErrors,
  getAllTomatoOrders
);
router.post(
  '/',
  checkSchema(tomatoOrderSchema),
  handleValidationErrors,
  createTomatoOrder
);
router.get('/:id', getTomatoOrderById);
router.put(
  '/:id',
  checkSchema(tomatoOrderSchema),
  handleValidationErrors,
  updateTomatoOrder
);
router.delete('/:id', deleteTomatoOrder);

export default router;
