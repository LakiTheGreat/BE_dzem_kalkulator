import { Router } from 'express';
import { checkSchema } from 'express-validator';

import {
  fruitSchema,
  patchFruitSchema,
} from '../validationSchemas/fruitSchema.js';
import { handleValidationErrors } from '../utils/handleValidationErrors.js';
import {
  createNewFruit,
  deleteFruitById,
  getAllFruits,
  patchFruitLabel,
} from '../controllers/fruitController-temp.js';

const router = Router();

router.get('/', getAllFruits);

router.post(
  '/',
  checkSchema(patchFruitSchema),
  handleValidationErrors,
  createNewFruit
);

router.patch(
  '/:id',
  checkSchema(patchFruitSchema),
  handleValidationErrors,
  patchFruitLabel
);

router.delete('/:id', deleteFruitById);

export default router;
