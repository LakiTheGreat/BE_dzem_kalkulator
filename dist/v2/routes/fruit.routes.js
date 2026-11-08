import { Router } from 'express';
import { checkSchema } from 'express-validator';
import { handleValidationErrors } from '../../middlewares/handleValidationErrors.js';
import { createFruit, getAllFruits, patchFruit } from '../controllers/fruit.controller.js';
import { fruitSchema } from '../validationSchemas/fruitSchema.js';
const router = Router();
router.get('/', getAllFruits);
router.post('/', checkSchema(fruitSchema), handleValidationErrors, createFruit);
router.patch('/:id', checkSchema(fruitSchema), handleValidationErrors, patchFruit);
export default router;
//# sourceMappingURL=fruit.routes.js.map