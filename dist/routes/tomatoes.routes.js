import { Router } from 'express';
import { checkSchema } from 'express-validator';
import { createTomatoOrder, getAllTomatoCups, getAllTomatoOrders, } from '../controllers/tomato.controller.js';
import { tomatoOrderSchema } from '../validationSchemas/tomatoSchema.js';
import { handleValidationErrors } from '../middlewares/handleValidationErrors.js';
const router = Router();
router.get('/cups', getAllTomatoCups);
router.get('/', getAllTomatoOrders);
router.post('/', checkSchema(tomatoOrderSchema), handleValidationErrors, createTomatoOrder);
export default router;
//# sourceMappingURL=tomatoes.routes.js.map