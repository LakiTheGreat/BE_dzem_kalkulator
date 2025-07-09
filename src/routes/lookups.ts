import { Request, Response, Router } from 'express';
import { checkSchema, validationResult } from 'express-validator';

import {
  createNewFruit,
  deleteFruitById,
  getAllFruits,
} from '../handlers/fruits.js';
import { lookupSchema } from '../validationSchemas/lookupsSchema.js';

const router = Router();

router.get('/fruits', getAllFruits);

router.post(
  '/fruits',
  checkSchema(lookupSchema),
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    createNewFruit(req, res);
  }
);

router.delete('/fruits/:id', deleteFruitById);

export default router;
