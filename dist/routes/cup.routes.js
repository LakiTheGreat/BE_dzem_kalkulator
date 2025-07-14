import { Router } from 'express';
import { checkSchema } from 'express-validator';
import { handleValidationErrors } from '../middlewares/handleValidationErrors.js';
import { createNewCup, deleteCupById, getAllCups, putCup, } from '../controllers/cup.controller.js';
import { cupCreateSchema } from '../validationSchemas/cupSchema.js';
const router = Router();
router.get('/', getAllCups);
router.post('/', checkSchema(cupCreateSchema), handleValidationErrors, createNewCup);
router.put('/:id', checkSchema(cupCreateSchema), handleValidationErrors, putCup);
router.delete('/:id', deleteCupById);
export default router;
//# sourceMappingURL=cup.routes.js.map