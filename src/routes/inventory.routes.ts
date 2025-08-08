import { Router } from 'express';
import { checkSchema } from 'express-validator';

import { handleValidationErrors } from '../middlewares/handleValidationErrors.js';
import { inventorySchema } from '../validationSchemas/inventorySchema.js';
import {
  getAllInventory,
  upsertInventory,
} from '../controllers/inventory.controller.js';

const router = Router();

router.get('/overview', getAllInventory);

router.post(
  '/input',
  checkSchema(inventorySchema),
  handleValidationErrors,
  upsertInventory
);

export default router;
