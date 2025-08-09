import { Router } from 'express';
import { checkSchema } from 'express-validator';

import {
  getInventory,
  getInventoryOverview,
  upsertInventory,
} from '../controllers/inventory.controller.js';
import { handleValidationErrors } from '../middlewares/handleValidationErrors.js';
import { inventorySchema } from '../validationSchemas/inventorySchema.js';

const router = Router();

router.get('/', getInventory);

router.get('/overview', getInventoryOverview);

router.post(
  '/input',
  checkSchema(inventorySchema),
  handleValidationErrors,
  upsertInventory
);

export default router;
