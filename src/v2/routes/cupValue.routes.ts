import { Router } from 'express';
import { checkSchema } from 'express-validator';

import { handleValidationErrors } from '../../middlewares/handleValidationErrors.js';
import {
  createCupValue,
  deleteCupValue,
  getAllCupValues,
  putCupValue,
} from '../controllers/cupValue.controller.js';
import { cupPriceSchema } from '../validationSchemas/cupPriceSchema.js';

const router = Router();

router.get('/', getAllCupValues);

router.post(
  '/',
  checkSchema(cupPriceSchema),
  handleValidationErrors,
  createCupValue
);

router.put(
  '/:id',
  checkSchema(cupPriceSchema),
  handleValidationErrors,
  putCupValue
);

router.delete('/:id', deleteCupValue);

export default router;
