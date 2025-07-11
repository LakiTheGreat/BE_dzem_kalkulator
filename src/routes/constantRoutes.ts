import { Router } from 'express';

import {
  getConstantById,
  patchConstantById,
} from '../controllers/constantController.js';

const router = Router();

router.get('/:id', getConstantById);
router.patch('/:id', patchConstantById);

export default router;
