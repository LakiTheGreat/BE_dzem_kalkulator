import { Router } from 'express';
import { checkSchema } from 'express-validator';
import { fruitSchema } from '../validationSchemas/fruitSchema.js';
import { handleValidationErrors } from '../utils/handleValidationErrors.js';
import { createNewFruit, deleteFruitById, getAllFruits, patchFruitLabel, } from '../controllers/fruit.controller.js';
const router = Router();
router.get('/', getAllFruits);
router.post('/', checkSchema(fruitSchema), handleValidationErrors, createNewFruit);
router.patch('/:id', checkSchema(fruitSchema), handleValidationErrors, patchFruitLabel);
router.delete('/:id', deleteFruitById);
export default router;
//# sourceMappingURL=fruit.routes.js.map