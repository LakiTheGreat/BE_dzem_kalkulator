import { Router } from 'express';
import { checkSchema } from 'express-validator';
import { handleValidationErrors } from '../utils/handleValidationErrors.js';
import { createNewCup, deleteCupById, getAllCups, putCup, } from '../controllers/cupController.js';
import { cupSchema } from '../validationSchemas/cupSchema.js';
const router = Router();
router.get('/', getAllCups);
router.post('/', checkSchema(cupSchema), handleValidationErrors, createNewCup);
router.put('/:id', checkSchema(cupSchema), handleValidationErrors, putCup);
router.delete('/:id', deleteCupById);
export default router;
//# sourceMappingURL=cupRoutes.js.map