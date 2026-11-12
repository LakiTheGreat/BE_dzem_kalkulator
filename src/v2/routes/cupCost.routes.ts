import { Router } from 'express';
import { checkSchema } from 'express-validator';

import { handleValidationErrors } from '../../middlewares/handleValidationErrors.js';
import {
  createCupCost,
  deleteCupCost,
  getAllCupCosts,
  putCupCost,
} from '../controllers/cupCost.controller.js';
import { cupPriceSchema } from '../validationSchemas/cupPriceSchema.js';

const router = Router();

router.get('/', getAllCupCosts);

router.post(
  '/',
  checkSchema(cupPriceSchema),
  handleValidationErrors,
  createCupCost
);

router.put(
  '/:id',
  checkSchema(cupPriceSchema),
  handleValidationErrors,
  putCupCost
);

router.delete('/:id', deleteCupCost);

export default router;
