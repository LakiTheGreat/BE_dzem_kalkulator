import { Router } from 'express';
import { checkSchema } from 'express-validator';

import { handleValidationErrors } from '../utils/handleValidationErrors.js';
import { cupCostSchema } from '../validationSchemas/cupSchema.js';
import {
  createCupCost,
  deleteCupCost,
  getAllCupCosts,
  putCupCost,
} from '../controllers/cupCostController.js';

const router = Router();

router.get('/', getAllCupCosts);

router.post(
  '/',
  checkSchema(cupCostSchema),
  handleValidationErrors,
  createCupCost
);

router.put(
  '/:id',
  checkSchema(cupCostSchema),
  handleValidationErrors,
  putCupCost
);

router.delete('/:id', deleteCupCost);

export default router;
