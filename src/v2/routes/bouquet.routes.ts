import { Router } from 'express';
import { checkSchema } from 'express-validator';

import { handleValidationErrors } from '../../middlewares/handleValidationErrors.js';
import {
  createBouquet,
  getAllBouquets,
  getBouquetById,
  updateBouquet,
} from '../controllers/bouquet.controller.js';
import {
  bouquetQuerySchema,
  bouquetTransactionSchema,
} from '../validationSchemas/bouquetSchema.js';

const router = Router();

router.get(
  '/',
  checkSchema(bouquetQuerySchema),
  handleValidationErrors,
  getAllBouquets
);
router.get('/:id', getBouquetById);

router.post(
  '/',
  checkSchema(bouquetTransactionSchema),
  handleValidationErrors,
  createBouquet
);

router.put(
  '/:id',
  checkSchema(bouquetTransactionSchema),
  handleValidationErrors,
  updateBouquet
);

export default router;
