import { Router } from 'express';
import { checkSchema } from 'express-validator';
import { createTransaction, getTransactionById, getTransactions, updateTransaction, } from '../controllers/transaction.controller.js';
import { handleValidationErrors } from '../middlewares/handleValidationErrors.js';
import { transactionSchema } from '../validationSchemas/transactionSchema.js';
const router = Router();
router.get('/', getTransactions);
router.get('/:id', getTransactionById);
router.post('/', checkSchema(transactionSchema), handleValidationErrors, createTransaction);
router.put('/:id', checkSchema(transactionSchema), handleValidationErrors, updateTransaction);
router.delete('/:id', updateTransaction);
export default router;
//# sourceMappingURL=transaction.routes%20copy.js.map