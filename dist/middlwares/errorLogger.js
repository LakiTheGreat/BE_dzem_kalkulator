import logger from '../utils/logger.js';
export function errorLogger(err, req, res, next) {
    logger.error('Unhandled error occurred', {
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        method: req.method,
        url: req.originalUrl,
        body: req.body,
        params: req.params,
        query: req.query,
    });
    next(err);
}
//# sourceMappingURL=errorLogger.js.map