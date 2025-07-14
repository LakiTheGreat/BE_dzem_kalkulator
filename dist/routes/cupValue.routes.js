import { Router } from 'express';
import { checkSchema } from 'express-validator';
import { createCupValue, deleteCupValue, getAllCupValues, putCupValue, } from '../controllers/cupValue.controller.js';
import { handleValidationErrors } from '../middlewares/handleValidationErrors.js';
import { cupValueSchema } from '../validationSchemas/cupSchema.js';
const router = Router();
router.get('/', getAllCupValues);
router.post('/', checkSchema(cupValueSchema), handleValidationErrors, createCupValue);
router.put('/:id', checkSchema(cupValueSchema), handleValidationErrors, putCupValue);
router.delete('/:id', deleteCupValue);
export default router;
//# sourceMappingURL=cupValue.routes.js.map