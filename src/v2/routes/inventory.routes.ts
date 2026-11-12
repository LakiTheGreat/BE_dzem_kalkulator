import { Router } from 'express';
import { checkSchema } from 'express-validator';

import { handleValidationErrors } from '../../middlewares/handleValidationErrors.js';
import {
  getInventory,
  getInventoryOverview,
  inputInventory,
} from '../controllers/jam.controller.js';
import { inventoryInputSchema } from '../validationSchemas/jamSchema.js';

const router = Router();

router.get('/', getInventory);
router.get('/overview', getInventoryOverview);
router.post(
  '/input',
  checkSchema(inventoryInputSchema),
  handleValidationErrors,
  inputInventory
);

export default router;
