import { Router } from 'express';

import { getAllFruits } from '../controllers/fruit.controller.js';

const router = Router();

router.get('/', getAllFruits);

export default router;
