import { Router } from 'express';

import { fruits } from '../mock.js';

const router = Router();

router.get('/api/lookup/fruits', (req, res) => {
  res.status(200).json(fruits);
});

export default router;
