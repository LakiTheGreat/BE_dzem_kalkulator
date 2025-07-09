import { Router } from 'express';
import { checkSchema } from 'express-validator';

import { fruitSchema } from '../validationSchemas/fruitSchema.js';
import { handleValidationErrors } from '../utils/handleValidationErrors.js';
import {
  createNewFruit,
  deleteFruitById,
  getAllFruits,
} from '../controllers/fruitController-temp.js';

const router = Router();

router.get('/', getAllFruits);

router.post(
  '/',
  checkSchema(fruitSchema),
  handleValidationErrors,
  createNewFruit
);

router.delete('/:id', deleteFruitById);

export default router;
