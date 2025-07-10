import { validationResult } from 'express-validator';
export function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    next();
}
//# sourceMappingURL=handleValidationErrors.js.map