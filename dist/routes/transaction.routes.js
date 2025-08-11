import { Router } from 'express';
import { checkSchema } from 'express-validator';
import { createTransaction, getTransactions, updateTransaction, } from '../controllers/transaction.controller.js';
import { handleValidationErrors } from '../middlewares/handleValidationErrors.js';
import { transactionSchema } from '../validationSchemas/transactionSchema.js';
const router = Router();
router.get('/', getTransactions);
router.post('/', checkSchema(transactionSchema), handleValidationErrors, createTransaction);
router.put('/:id', checkSchema(transactionSchema), handleValidationErrors, updateTransaction);
export default router;
//# sourceMappingURL=transaction.routes.js.map