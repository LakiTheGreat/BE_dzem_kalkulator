import { Router } from 'express';
import { checkSchema } from 'express-validator';
import { createTomatoOrder, deleteTomatoOrder, getAllTomatoCups, getAllTomatoOrders, getTomatoCupTotals, getTomatoOrderById, updateTomatoOrder, } from '../controllers/tomato.controller.js';
import { tomatoOrderSchema } from '../validationSchemas/tomatoSchema.js';
import { handleValidationErrors } from '../middlewares/handleValidationErrors.js';
const router = Router();
router.get('/cups', getAllTomatoCups);
router.get('/totals', getTomatoCupTotals);
router.get('/', getAllTomatoOrders);
router.get('/:id', getTomatoOrderById);
router.post('/', checkSchema(tomatoOrderSchema), handleValidationErrors, createTomatoOrder);
router.put('/:id', checkSchema(tomatoOrderSchema), handleValidationErrors, updateTomatoOrder);
router.delete('/:id', deleteTomatoOrder);
export default router;
//# sourceMappingURL=tomatoes.routes.js.map