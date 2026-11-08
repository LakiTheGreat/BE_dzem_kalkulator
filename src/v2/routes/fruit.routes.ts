import { Router } from 'express';
import { checkSchema } from 'express-validator';

import { handleValidationErrors } from '../../middlewares/handleValidationErrors.js';
import {
  createFruit,
  deleteFruit,
  getAllFruits,
  patchFruit,
} from '../controllers/fruit.controller.js';
import { fruitSchema } from '../validationSchemas/fruitSchema.js';

const router = Router();

router.get('/', getAllFruits);

router.post('/', checkSchema(fruitSchema), handleValidationErrors, createFruit);

router.patch(
  '/:id',
  checkSchema(fruitSchema),
  handleValidationErrors,
  patchFruit
);

router.delete('/:id', deleteFruit);

export default router;
