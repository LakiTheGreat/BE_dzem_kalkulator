import { Router } from 'express';
import { checkSchema } from 'express-validator';

import {
  createNewOrder,
  getAllOrders,
} from '../controllers/orderController.js';
import { handleValidationErrors } from '../utils/handleValidationErrors.js';
import { createOrderSchema } from '../validationSchemas/orderSchema.js';

const router = Router();

router.get('/', getAllOrders);

router.post(
  '/',
  checkSchema(createOrderSchema),
  handleValidationErrors,
  createNewOrder
);

export default router;
