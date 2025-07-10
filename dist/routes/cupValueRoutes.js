import { Router } from 'express';
import { checkSchema } from 'express-validator';
import { createCupValue, deleteCupValue, getAllCupValues, putCupValue, } from '../controllers/cupValueController.js';
import { handleValidationErrors } from '../utils/handleValidationErrors.js';
import { cupCostSchema } from '../validationSchemas/cupSchema.js';
const router = Router();
router.get('/', getAllCupValues);
router.post('/', checkSchema(cupCostSchema), handleValidationErrors, createCupValue);
router.put('/:id', checkSchema(cupCostSchema), handleValidationErrors, putCupValue);
router.delete('/:id', deleteCupValue);
export default router;
//# sourceMappingURL=cupValueRoutes.js.map