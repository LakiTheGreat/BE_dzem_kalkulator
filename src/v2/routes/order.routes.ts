import { Router } from 'express';
import { checkSchema } from 'express-validator';

import { handleValidationErrors } from '../../middlewares/handleValidationErrors.js';
import {
  createOrder,
  deleteOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
} from '../controllers/jam.controller.js';
import {
  orderQuerySchema,
  orderSchema,
} from '../validationSchemas/jamSchema.js';

const router = Router();

router.get('/', checkSchema(orderQuerySchema), handleValidationErrors, getAllOrders);
router.get('/:id', getOrderById);
router.post('/', checkSchema(orderSchema), handleValidationErrors, createOrder);
router.put('/:id', checkSchema(orderSchema), handleValidationErrors, updateOrder);
router.delete('/:id', deleteOrder);

export default router;
