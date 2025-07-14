import { Router } from 'express';
import { checkSchema } from 'express-validator';

import {
  createNewOrder,
  deleteOrder,
  getAllOrders,
  getOrderById,
} from '../controllers/order.controller.js';
import { handleValidationErrors } from '../middlewares/handleValidationErrors.js';
import { createOrderSchema } from '../validationSchemas/orderSchema.js';

const router = Router();

router.get('/', getAllOrders);

router.get('/:id', getOrderById);

router.post(
  '/',
  checkSchema(createOrderSchema),
  handleValidationErrors,
  createNewOrder
);

router.delete('/:id', deleteOrder);

export default router;
