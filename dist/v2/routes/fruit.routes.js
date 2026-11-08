import { Router } from 'express';
import { checkSchema } from 'express-validator';
import { handleValidationErrors } from '../../middlewares/handleValidationErrors.js';
import { createFruit, getAllFruits } from '../controllers/fruit.controller.js';
import { fruitSchema } from '../validationSchemas/fruitSchema.js';
const router = Router();
router.get('/', getAllFruits);
router.post('/', checkSchema(fruitSchema), handleValidationErrors, createFruit);
export default router;
//# sourceMappingURL=fruit.routes.js.map