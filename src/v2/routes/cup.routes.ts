import { Router } from 'express';
import { checkSchema } from 'express-validator';

import { handleValidationErrors } from '../../middlewares/handleValidationErrors.js';
import {
  createCup,
  deleteCup,
  getAllCups,
  putCup,
} from '../controllers/cup.controller.js';
import { cupSchema } from '../validationSchemas/cupSchema.js';

const router = Router();

router.get('/', getAllCups);

router.post('/', checkSchema(cupSchema), handleValidationErrors, createCup);

router.put('/:id', checkSchema(cupSchema), handleValidationErrors, putCup);

router.delete('/:id', deleteCup);

export default router;
