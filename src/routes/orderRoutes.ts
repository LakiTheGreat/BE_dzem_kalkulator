import { Router } from 'express';
import { checkSchema } from 'express-validator';

import { handleValidationErrors } from '../utils/handleValidationErrors.js';
import { createNewOrder } from '../controllers/orderController.js';
import { createOrderSchema } from '../validationSchemas/orderSchema.js';

const router = Router();

router.post(
  '/',
  checkSchema(createOrderSchema),
  handleValidationErrors,
  createNewOrder
);

export default router;
