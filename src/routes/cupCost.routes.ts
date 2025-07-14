import { Router } from 'express';
import { checkSchema } from 'express-validator';

import {
  createCupCost,
  deleteCupCost,
  getAllCupCosts,
  putCupCost,
} from '../controllers/cupCost.controller.js';
import { handleValidationErrors } from '../middlewares/handleValidationErrors.js';
import { cupCostSchema } from '../validationSchemas/cupSchema.js';

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
