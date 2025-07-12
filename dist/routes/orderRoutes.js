import { Router } from 'express';
import { checkSchema } from 'express-validator';
import { createNewOrder, deleteOrder, getAllOrders, getOrderById, } from '../controllers/orderController.js';
import { handleValidationErrors } from '../utils/handleValidationErrors.js';
import { createOrderSchema } from '../validationSchemas/orderSchema.js';
const router = Router();
router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.post('/', checkSchema(createOrderSchema), handleValidationErrors, createNewOrder);
router.delete('/:id', deleteOrder);
export default router;
//# sourceMappingURL=orderRoutes.js.map