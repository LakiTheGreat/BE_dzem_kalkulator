import { Router } from 'express';
import { checkSchema } from 'express-validator';

import {
  getConstantById,
  patchConstantById,
} from '../controllers/constant.controller.js';
import { constantSchema } from '../validationSchemas/constantSchema.js';
import { handleValidationErrors } from '../middlewares/handleValidationErrors.js';

const router = Router();

router.get('/:id', getConstantById);
router.patch(
  '/:id',
  checkSchema(constantSchema),
  handleValidationErrors,
  patchConstantById
);

export default router;
