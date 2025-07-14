import { validationResult } from 'express-validator';
import status from 'http-status';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';
export function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorDetails = errors.array();
        const message = JSON.stringify(errorDetails);
        logger.warn({
            type: 'validation',
            path: req.path,
            method: req.method,
            errors: errorDetails,
        });
        next(new AppError(message, status.BAD_REQUEST));
        return;
    }
    next();
}
//# sourceMappingURL=handleValidationErrors.js.map