import { Router } from 'express';
import { checkSchema } from 'express-validator';
import { createCupValue, deleteCupValue, getAllCupValues, putCupValue, } from '../controllers/cupValueController.js';
import { handleValidationErrors } from '../utils/handleValidationErrors.js';
import { cupValueSchema } from '../validationSchemas/cupSchema.js';
const router = Router();
router.get('/', getAllCupValues);
router.post('/', checkSchema(cupValueSchema), handleValidationErrors, createCupValue);
router.put('/:id', checkSchema(cupValueSchema), handleValidationErrors, putCupValue);
router.delete('/:id', deleteCupValue);
export default router;
//# sourceMappingURL=cupValueRoutes.js.map